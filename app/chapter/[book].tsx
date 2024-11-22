import React, { useState, useEffect, useRef, Fragment, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams } from "expo-router";
import books from '@/assets/bible';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSettingsStore } from "@/store/settings";
import { ThemedButton } from "@/components/ThemedButton";
import { useTheme } from "@react-navigation/native";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import ModalBottom from "@/components/ModalBottom";
import extractFootnoteLink from "@/utils/extractFootnoteLink";
import formatBookName from "@/utils/formatBookName";
import ThemedTemplatedText from "@/components/ThemedTemplatedText";
import cleanText from "@/utils/cleanText";
import { NotedVerseType, useHighlightNotes } from "@/hooks/useHighlightWithNotes";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import Ionicons from '@expo/vector-icons/Ionicons';
import { ModalCentered } from "@/components/ModalCentered";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Collapsible } from "@/components/Collapsible";
import { RenderRightActions } from "@/components/notes/RenderRightActions";
import { ModalPicker } from "@/components/ModalPicker";
import { useNoteGroups } from "@/hooks/useNoteGroups";
import { NoteGroupModelType } from "@/services/sqlite/models/note.group.model";

const soundObject = new Audio.Sound();

let soundLoaded = false;

// Define the structure of a Verse and Footnote
interface Footnote {
  word: string;
  id: string;
}

interface FootnoteReference {
  id: string;
  text: string;
}

interface Verse {
  text: string;
  footnotes: Footnote[];
  outlines: string[] | null;
}

interface ChapterScreenProps {
}

const ChapterScreen: React.FC<ChapterScreenProps> = () => {
  const inset = useSafeAreaInsets()
  const { dark, colors } = useTheme()
  const params = useLocalSearchParams<{ book: string }>();
  const fontSize = useSettingsStore((state) => state.fontSize);
  const flatListRef = useRef<FlatList<Verse> | null>(null);
  const [chapter, setChapter] = useState<number>(0);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [footnoteReferences, setFootnoteReferences] = useState<Record<string, string> | null>(null);
  const [selectedFootnote, setSelectedFootnote] = useState<Footnote | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number | null>(null);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [selectedVerseIndex, setSelectedVerseIndex] = useState<number | null>(null);
  const [isChapterModalVisible, setChapterModalVisible] = useState<boolean>(false);
  const [numberOfChapters, setNumberOfChapters] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { textToSpeech, stopSpeech } = useTextToSpeech();
  const [activeNoteVerseIndex, setActiveNoteVerseIndex] = useState<number | null>(null);
  const [updateNote, setUpdateNote] = useState<NotedVerseType | null>(null);
  const { highlightedVerses, toggleHighlight, saveNote, loadHighlightedVerses, removeNote } = useHighlightNotes({ book: params.book, chapter });
  const [updateNoteGroup, setUpdateNoteGroup] = useState<NoteGroupModelType | null>(null);
  const { noteGroups, saveNoteGroup } = useNoteGroups();

  const noteGroupOptions = useMemo(() => noteGroups.map(noteGroup => ({ label: noteGroup.name, value: noteGroup.id })), [noteGroups]);
  
  const noteGroupNames = useMemo(() => {
    const groupMaps = new Map<number, string>();
    noteGroups.forEach(noteGroup => groupMaps.set(noteGroup.id, noteGroup.name));
    return groupMaps;
  }, [noteGroups]);

  useEffect(() => {
    loadHighlightedVerses()
  }, [chapter]);

  const loadChapter = () => {
    
    // @ts-ignore
    const book = books[formatBookName(params.book)] || {};  

    if(chapter === 0) {
      if(Object.keys(book).length === 1) {
        setChapter(1);
      }
      return;
    }

    const jsonData = book[`chapter-${chapter}`] as { verses: Verse[], footnoteReferences: FootnoteReference[] };
    setVerses(jsonData?.verses || []);

    setFootnoteReferences(jsonData?.footnoteReferences?.reduce<Record<string, string>>((result, item) => {
      result[item.id] = item.text;
      result[item.id.replace(/[a-zA-Z]/g, '')] = item.text;
      return result;
    }, {}) || null);
    
    if(isReading) return;

    flatListRef.current?.scrollToIndex({ animated: false, index: 0 });

    setSelectedVerseIndex(null);
    setCurrentVerseIndex(null);
    setLoading(false);
    setIsReading(false);
  };

  useEffect(loadChapter, [chapter]);

  const countChapters = () => {
    // @ts-ignore
    const book = books[formatBookName(params.book)] || {};  
    setNumberOfChapters(Object.keys(book).length);
  };

  useEffect(countChapters, [params.book]);

  // iOS Fix for playing audio
  const iOSFixForPlayingAudio = () => {
    if(soundLoaded) return;
    soundLoaded = true;
    (async () => {
      if (Platform.OS === "ios") {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });
        await soundObject.loadAsync(require("@/assets/audio/soundFile.mp3"));
        await soundObject.playAsync();
      }
    })();
  }

  useEffect(iOSFixForPlayingAudio, []);

  const readVerse = () => {
    if(currentVerseIndex === null) {
      return setIsReading(false);
    }
    
    if(!isReading) {
      setIsReading(true);
    }

    flatListRef.current?.scrollToIndex({ animated: true, index: currentVerseIndex });
    
    const verseText = verses[currentVerseIndex].text;

    textToSpeech(`${verseText}`, () => {
      const isLastVerse = currentVerseIndex === verses.length - 1;

      if(isLastVerse) {
        const isLastChapter = chapter === numberOfChapters;

        if(isLastChapter) {
          setCurrentVerseIndex(null);
          return;
        }

        setChapter(prev => prev + 1);
        
        textToSpeech(`${params.book.replace('1', 'Unang').replace('2', 'Ikalawang').replace('3', 'Ikatlong')} Kapitulo ${chapter + 1}`, () => {
          setCurrentVerseIndex(0)
        });
        return;
      }

      setCurrentVerseIndex(prev => prev !== null ? Math.min(prev + 1, verses.length - 1) : prev)
    });

    return () => {
      stopSpeech();
    }
  };
  
  useEffect(readVerse, [currentVerseIndex]);

  const unmountCleanup = () => () => {
    setIsReading(false);
    setCurrentVerseIndex(null);
  }

  useEffect(unmountCleanup, []);

  const startReadingFromSelectedVerse = () => {
    if (selectedVerseIndex !== null) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setSelectedVerseIndex(null);
      setCurrentVerseIndex(selectedVerseIndex);
    }
  };

  const stopReading = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    stopSpeech();
    setIsReading(false);
    setCurrentVerseIndex(null);
  };

  const handleNextChapter = () => {
    if(isReading) {
      stopReading();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
    setChapter(chapter + 1);
  };

  const handlePreviousChapter = () => {
    if(isReading) {
      stopReading();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
    if (chapter > 1) setChapter(chapter - 1);
  };

  const handleChapterSelect = (chapterNum: number) => {
    Haptics.selectionAsync();
    setChapter(chapterNum);
    setChapterModalVisible(false);
  };

  const handleOpenNoteModal = (verseIndex: number) => {
    setActiveNoteVerseIndex(verseIndex);
    const notes = highlightedVerses.get(verseIndex!) || []

    if(notes.length === 1 && notes[0].note === '') {
      setUpdateNote(notes[0]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
  };

  const titleStyle = { fontSize: fontSize + 4, lineHeight: Math.max(fontSize * 1.5, 28) };

  const textStyle = { fontSize, lineHeight: Math.max(fontSize * 1.5, 28) };
  
  const renderVerse = ({ item, index }: { item: Verse; index: number }) => {
    const words = item.text.split(" ");
    const isActive = index === currentVerseIndex;
    const isSelected = index === selectedVerseIndex;
    const isHighlighted = highlightedVerses.has(index);
    const noteExists = highlightedVerses.get(index) || []
    const highlightedStyle = { backgroundColor: isHighlighted ? colors.border : 'transparent' };

    const handleLongPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      Alert.alert('Mga aksyon', 'Anong ang gusto mong gawin sa bersikulo?', [
        { text: `${isHighlighted ? 'Remove' : 'Add'} Highlight`, onPress: () => toggleHighlight(index) },
        { text: `${isSelected ? 'Unselect' : 'Select'} to Read Verse`, onPress: () => {
          if(isSelected) {
            setSelectedVerseIndex(null);
            return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
          setSelectedVerseIndex(index)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        } },
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      ]);
    }

    return (
      <>
        {item.outlines && item.outlines.length > 0 && (
          <>
            {item.outlines.map((outline, outlineIndex) => (
              <ThemedText key={outlineIndex} style={[styles.outlineText, textStyle]}>
                {outline}
              </ThemedText>
            ))}
          </>
        )}
        <ThemedView>
          <ThemedText 
            onLongPress={handleLongPress} 
            style={[styles.verseText, { backgroundColor: isSelected || isActive ? colors.card : 'transparent' }, textStyle]}
          >
            <ThemedText style={[styles.verseNumber, textStyle]}>{index + 1}.{" "}</ThemedText>
            {words.map((word, wordIndex) => {
              const footnote = item.footnotes.find(f => (cleanText(f.word) === cleanText(word) || (f.word.endsWith('-') && word.startsWith(f.word))) && f.id);
              return (
                <Fragment key={wordIndex}>
                  <ThemedText
                    type={footnote ? 'link' : undefined}
                    style={[footnote ? styles.footnoteHighlight : undefined, textStyle, highlightedStyle]}
                    onPress={footnote ? () => {
                      setSelectedFootnote(footnote)
                      Haptics.selectionAsync()
                    } : undefined}
                    onLongPress={footnote ? handleLongPress : undefined}
                  >
                    {word}
                  </ThemedText>
                  <ThemedText style={[textStyle, highlightedStyle]}>{" "}</ThemedText>
                </Fragment>
              );
            })}
          </ThemedText>
          {!!isHighlighted && (
            <TouchableOpacity style={[styles.noteIndicator, { backgroundColor: colors.primary }]} onPress={() => handleOpenNoteModal(index)}>
              <Ionicons name={noteExists.length === 1 && noteExists[0].note === '' ? "chatbubble-outline" : "chatbubble-ellipses-outline"} size={25} color={colors.background}/>
            </TouchableOpacity>
          )}
        </ThemedView>
      </>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: `${params.book}`, headerTitleAlign: "center", headerTitleStyle: { fontSize: 26 } }} />
      {renderContent()}
      {renderChapterSelectionModal()}
      {renderFootnotesModal()}
      {!updateNote && !!highlightedVerses.get(activeNoteVerseIndex!) ? renderNotesModal() : renderSaveNotesModal()}
    </>
  );

  function renderContent() {
    if(loading && chapter !== 0) {
      return (
        <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large"/>
        </ThemedView>
      )
    }

    if(!loading && numberOfChapters === 0) {
      return (
        <ThemedView style={{flex: 1, paddingVertical: 50}}>
          <ThemedText style={[textStyle, {textAlign: 'center'}]}>Ang Libro ng {params.book} ay hindi pa na-ilalathala.</ThemedText>
        </ThemedView>
      )
    }

    if(chapter === 0) {
      return (
        <ThemedView style={styles.chapterSelectContainer}>
          {Array.from({ length: numberOfChapters }, (_, i) => i + 1).map((item, index) => (
            <TouchableOpacity key={index} onPress={() => handleChapterSelect(item)}>
              <ThemedView colorName="card" style={[styles.chapterSelectItem, { borderColor: colors.border }]}>
                <ThemedText style={{textAlign: 'center'}}>{item}</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>
      )
    }

    return (
      <ThemedView style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
          setChapterModalVisible(true)
        }}>
          <ThemedText style={styles.chapterTitle} colorName="primary" type="title">Kapitulo {chapter}</ThemedText>
        </TouchableOpacity>
        <FlatList
          ref={flatListRef}
          data={verses}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderVerse}
          style={{ paddingHorizontal: 15 }}
        />
        <ThemedView colorName="card" style={{ padding: 15, paddingBottom: Math.max(inset.bottom, 15) }}>
          {(currentVerseIndex !== null || selectedVerseIndex != null) && (
            <View style={styles.controlButtons}>
              {isReading ? (
                <ThemedButton title="Stop Reading" onPress={stopReading} color="red" />
              ) : (
                <ThemedButton title={currentVerseIndex === null ? "Start Reading Verse" : "Resume Reading"} onPress={startReadingFromSelectedVerse} color="green" />
              )}
            </View>
          )}
          <View style={styles.paginationButtons}>
            {chapter === 1 ? (
              <View />
            ) : (
              <ThemedButton title={`Kapitulo ${chapter - 1}`} onPress={handlePreviousChapter} disabled={chapter === 1} />
            )}
            {chapter === numberOfChapters ? (
              <View />
            ) : (
              <ThemedButton title={`Kapitulo ${chapter + 1}`} onPress={handleNextChapter} disabled={chapter === numberOfChapters} />
            )}
          </View>
        </ThemedView>
      </ThemedView>
    )
  }

  function renderChapterSelectionModal() {
    return (
      <ModalCentered
        title="Pumili ng Kapitulo"
        visible={isChapterModalVisible}
        onClose={() => {
          setChapterModalVisible(false)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        }}
      >
        <ScrollView>
          <ThemedView style={styles.chapterSelectContainer}>
            {Array.from({ length: numberOfChapters }, (_, i) => i + 1).map((item, index) => (
              <TouchableOpacity key={index} onPress={() => handleChapterSelect(item)}>
                <ThemedView colorName="card" style={[styles.chapterSelectItem, { borderColor: colors.border }]}>
                  <ThemedText style={{textAlign: 'center'}}>{item}</ThemedText>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ScrollView>
      </ModalCentered>
    )
  }

  function renderFootnotesModal() {
    return (
      <ModalBottom
        visible={!!selectedFootnote}
        backdrop={false}
        onClose={() => {
          setSelectedFootnote(null)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        }}
      >
          <ThemedText style={[styles.modalTitle, titleStyle]}>Talababa sa Bersikulo {selectedFootnote?.id?.split('-')?.[0]}</ThemedText>
          <ThemedText style={[styles.modalTitle, titleStyle, { fontWeight: 600, fontStyle: 'italic' }]}>"{selectedFootnote?.word.replace(/[\,\;\)\:]/g, '')}"</ThemedText>
          <ScrollView style={{height: 250}}>
            {!!selectedFootnote?.id && (
              <ThemedTemplatedText style={textStyle}>{extractFootnoteLink(footnoteReferences?.[selectedFootnote?.id] || '', { book: params.book, chapter }, [ { book: params.book, chapter, id: selectedFootnote?.id }])}</ThemedTemplatedText>
            )}
          </ScrollView>
      </ModalBottom>
    )
  }

  function renderNotesModal() {
    const notes = highlightedVerses.get(activeNoteVerseIndex!) || []
    const hasMultipleNotes = notes.length > 1
    const lastIndex = notes.length - 1

    const closeNoteModal = () => {
      setActiveNoteVerseIndex(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    }

    return (
      <ModalBottom visible={activeNoteVerseIndex !== null && !updateNote} onClose={closeNoteModal}>
        <ThemedText style={[styles.modalTitle, titleStyle]}>{hasMultipleNotes ? 'Mga Tala' : 'Ang Tala'}</ThemedText>
          {hasMultipleNotes ? (
            <GestureHandlerRootView style={{height: 250, marginBottom: 15}}>
              <FlatList
                data={notes}
                keyExtractor={(item) => item.noteId.toString()}
                renderItem={({ item, index }) => (
                  <Swipeable
                    friction={2}
                    enableTrackpadTwoFingerGesture
                    rightThreshold={40}
                    renderRightActions={(progress, dragX) => (
                      <RenderRightActions
                        progress={progress}
                        dragX={dragX}
                        item={item}
                        onEdit={setUpdateNote}
                        onDelete={() => removeNote(activeNoteVerseIndex!, item.noteId)}
                      />
                    )}
                  >
                    <Collapsible
                      title={item.noteGroupId ? noteGroupNames.get(item.noteGroupId) || '(Walang grupo)' : '(Walang grupo)'}
                      titleStyle={textStyle}
                      headingActiveStyle={{ backgroundColor: colors.border }}
                      activeStyle={{ borderBottomWidth: lastIndex !== index ? 2 : 0 }}
                      style={{
                        borderBottomColor: colors.border,
                        borderBottomWidth: lastIndex !== index ? 2 : 1,
                      }}
                    >
                      <ThemedView colorName="card" style={[styles.notesContainer, { borderWidth: 2, borderColor: colors.border, marginBottom: 15 }]}>
                        <ThemedText style={[styles.noteText, textStyle]}>
                          {item.note}
                        </ThemedText>
                      </ThemedView>
                    </Collapsible>
                  </Swipeable>
                )}
              />
            </GestureHandlerRootView>
          ) : (
            <ScrollView style={{height: 250, marginBottom: 15}}>
              <ThemedText style={textStyle}>
                {notes[0].note}
              </ThemedText>
            </ScrollView>
          )}
        <View style={{ marginBottom: 5}}>
          <ThemedButton
            title="Gawa ng bagong Note"
            onPress={() => {
              setUpdateNote({ noteId: 0, note: '', noteGroupId: 0 });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        </View>
        {!hasMultipleNotes && (
          <ThemedButton
            title="I-edit ang Note"
            onPress={() => {
              setUpdateNote(notes[0]);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        )}
      </ModalBottom>
    )
  }

  function renderSaveNotesModal() {

    const closeNoteModal = () => {
      setUpdateNote(null);
    }
    
    const closeWithChecking = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const notes = highlightedVerses.get(activeNoteVerseIndex!)
      const oldNote = notes?.find(item => item.noteId === updateNote?.noteId)

      if(!oldNote || (updateNote?.noteId === oldNote?.noteId && updateNote?.note === oldNote?.note)) {
        
        closeNoteModal();

        if(notes?.length === 1) {
          setActiveNoteVerseIndex(null);
        }
        return;
      }

      Alert.alert('⚠️ Babala ⚠️', 'Ang iyong natala ay hindi pa na-save. Gusto mo ba tuluyang isara ang form at mawala ang iyong na mga nagawa?', [
        { 
          text: 'Oo', 
          onPress: () => {
            closeNoteModal()

            if(notes?.length === 1 && oldNote.note === '') {
              setActiveNoteVerseIndex(null);
            }
          } 
        },
        { text: 'Huwag', style: 'cancel' },
      ]);
    }

    return (
      <ModalBottom visible={!!updateNote} onClose={closeWithChecking}>
        <ThemedText style={[styles.modalTitle, titleStyle]}>Mag-tala</ThemedText>
        <ThemedView colorName="card" style={{ flexDirection: 'row', gap: 5, marginBottom: 15 }}>
          <View style={{flex: 1}}>
            <ModalPicker
              value={updateNote?.noteGroupId}
              options={noteGroupOptions}
              onChangeValue={(noteGroupId) => setUpdateNote(prev => prev && ({ ...prev, noteGroupId: noteGroupId as number }))}
              placeholder="Pumili ng grupo ng tala"
            />
          </View>
          <TouchableOpacity 
            onPress={() => setUpdateNoteGroup({ id: 0, name: '' })}
            style={{ width: 55, height: '100%', paddingHorizontal: 12, paddingVertical: 13, borderRadius: 5, backgroundColor: colors.primary }}>
            <Ionicons name="add-circle-outline" size={30} color="#ffffff" />
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={{height: 250, marginBottom: 15}}>
          <ThemedTextInput
            placeholder="Ano ang iyong gustong i-tala?"
            value={updateNote?.note}
            onChangeText={(note) => setUpdateNote(prev => prev && ({ ...prev, note }))}
            multiline
            style={{ height: '100%', textAlignVertical: 'top', ...textStyle }}
          />
        </ThemedView>
        <ThemedButton
          title="I-save ang Tala"
          onPress={() => {
            if (activeNoteVerseIndex !== null) saveNote(activeNoteVerseIndex, { ...updateNote! });
            closeNoteModal();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
        />
        <ModalBottom visible={!!updateNoteGroup} onClose={() => {
          setUpdateNoteGroup(null)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        }}>
          <ThemedText style={[styles.modalTitle, titleStyle]}>Gumawa ng grupo ng tala</ThemedText>
          <View style={{height: 150, marginBottom: 15}}>
            <ThemedTextInput
              placeholder="Ano ang pangalan bagong grupo?"
              value={updateNoteGroup?.name}
              onChangeText={(name) => setUpdateNoteGroup(prev => prev && ({ ...prev, name }))}
            />
          </View>
          <ThemedButton
            title="I-save ang Grupo"
            onPress={async () => {
              if(updateNoteGroup?.name === '') return Alert.alert('Walang pangalan', 'Mangyaring maglagay ng pangalan ng grupo');
              await saveNoteGroup({...updateNoteGroup!});
              setUpdateNoteGroup(null)
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
          />
        </ModalBottom>
      </ModalBottom>
    )
  }
};

const styles = StyleSheet.create({
  chapterTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 10,
  },
  chapterSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  chapterSelectItem: { 
    paddingVertical: 10, 
    borderWidth: 1, 
    borderRadius: 5, 
    width: 50 
  },
  verseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verseText: {
    padding: 10,
    fontSize: 16,
    position: 'relative',
  },
  outlineText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  footnoteHighlight: {
    zIndex: 100,
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButtons: {
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  noteIndicator: {
    position: 'absolute',
    top: -10,
    right: 0,
    marginLeft: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    zIndex: 1
  },
  notesContainer: {
    padding: 16,
  },
  noteText: {
    fontSize: 16,
    marginVertical: 4,
  },
});

export default ChapterScreen;
