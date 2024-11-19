import React, { useState, useEffect, useRef, Fragment } from 'react';
import { View, FlatList, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from "expo-router";
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
  const { colors } = useTheme()
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

  const textStyle = { fontSize, lineHeight: Math.max(fontSize * 1.5, 28) };

  const renderVerse = ({ item, index }: { item: Verse; index: number }) => {
    const words = item.text.split(" ");
    const isActive = index === currentVerseIndex;
    const isSelected = index === selectedVerseIndex;

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
        <ThemedText 
          onLongPress={() => {
            setSelectedVerseIndex(index)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
          }} 
          style={[styles.verseText, { backgroundColor: isSelected || isActive ? colors.card : 'transparent' }, textStyle]}>
          <ThemedText style={[styles.verseNumber, textStyle]}>{index + 1}.{" "}</ThemedText>
          {words.map((word, wordIndex) => {
            const footnote = item.footnotes.find(f => (f.word === word || (f.word.endsWith('-') && word.startsWith(f.word))) && f.id);
            return (
              <Fragment key={wordIndex}>
                <ThemedText
                  type={footnote ? 'link' : undefined}
                  style={[footnote ? styles.footnoteHighlight : undefined, textStyle]}
                  onPress={footnote ? () => {
                    setSelectedFootnote(footnote)
                    Haptics.selectionAsync()
                  } : undefined}
                  onLongPress={footnote ? () => {
                    setSelectedVerseIndex(index) 
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                  } : undefined}
                >
                  {word}
                </ThemedText>
                <ThemedText>{" "}</ThemedText>
              </Fragment>
            );
          })}
        </ThemedText>
      </>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: `${params.book}`, headerTitleAlign: "center", headerTitleStyle: { fontSize: 26 } }} />
      {renderContent()}
      {renderChapteSelectionModal()}
      {renderFootnotesModal()}
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
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 15, paddingHorizontal: 15, paddingVertical: 10, marginTop: 15 }}>
          {Array.from({ length: numberOfChapters }, (_, i) => i + 1).map((item, index) => (
            <TouchableOpacity key={index} onPress={() => handleChapterSelect(item)}>
              <ThemedView colorName="card" style={{ paddingVertical: 10, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, width: 50 }}>
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

  function renderChapteSelectionModal() {
    return (
      <Modal
        visible={isChapterModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setChapterModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <ThemedView colorName="card" style={[styles.modalContainer, { paddingHorizontal: 0}]}>
            <View style={{ width: '100%', borderBottomColor: '#ccc', borderBottomWidth: 1, paddingBottom: 10 }}>
              <ThemedText style={styles.modalTitle}>Pumili ng Kapitulo</ThemedText>
            </View>
            <FlatList
              style={{ width: '100%' }}
              data={Array.from({ length: numberOfChapters }, (_, i) => i + 1)}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleChapterSelect(item)}>
                  <ThemedView colorName={item === chapter ? "border" : "background"}>
                    <ThemedText colorName={item === chapter ? "primary" : "text"} style={[styles.chapterItem]}>Kapitulo {item}</ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              )}
            />
            <View style={{ width: '100%', borderTopColor: '#ccc', borderTopWidth: 1, paddingTop: 20, paddingHorizontal: 20 }}>
              <ThemedButton title="Close" onPress={() => {
                setChapterModalVisible(false)
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
              }} />
            </View>
          </ThemedView>
        </View>
      </Modal>
    )
  }

  function renderFootnotesModal() {
    return (
      <ModalBottom
        visible={!!selectedFootnote}
        onClose={() => {
          setSelectedFootnote(null)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        }}
      >
          <ThemedText style={styles.modalTitle}>Tala sa Bersikulo {selectedFootnote?.id?.split('-')?.[0]}</ThemedText>
          <ThemedText style={[styles.modalTitle, { fontWeight: 600, fontStyle: 'italic' }]}>"{selectedFootnote?.word.replace(/[\,\;\)\:]/g, '')}"</ThemedText>
          <ScrollView style={{height: 250}}>
            {!!selectedFootnote?.id && (
              <ThemedText style={styles.modalText}>{extractFootnoteLink(footnoteReferences?.[selectedFootnote?.id] || '', { book: params.book, chapter }, [ { book: params.book, chapter, id: selectedFootnote?.id }])}</ThemedText>
            )}
          </ScrollView>
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
  verseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verseText: {
    padding: 10,
    fontSize: 16,
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
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    maxHeight: '80%',
    marginHorizontal: 25,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  chapterItem: {
    fontSize: 18,
    paddingVertical: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default ChapterScreen;
