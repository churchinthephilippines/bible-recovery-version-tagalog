import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Platform } from 'react-native';

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

const soundObject = new Audio.Sound();

let soundLoaded = false;

// Define the structure of a Verse and Footnote
interface Footnote {
  word: string;
  note: string;
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
  const [selectedFootnote, setSelectedFootnote] = useState<Footnote | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number | null>(null);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [selectedVerseIndex, setSelectedVerseIndex] = useState<number | null>(null);
  const [isChapterModalVisible, setChapterModalVisible] = useState<boolean>(false);
  const [numberOfChapters, setNumberOfChapters] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { textToSpeech, stopSpeech } = useTextToSpeech();

  const loadChapter = () => {
    if(chapter === 0) return;
    // @ts-ignore
    const book = books[params.book.toLowerCase().replace(/\s+/g, '-')] || {};  
    const jsonData = book[`chapter-${chapter}`];
    setVerses(jsonData?.verses || []);
    
    if(isReading) return;

    setSelectedVerseIndex(null);
    setCurrentVerseIndex(null);
    setLoading(false);
    setIsReading(false);
  };

  useEffect(loadChapter, [chapter]);

  const countChapters = () => {
    // @ts-ignore
    const book = books[params.book.toLowerCase().replace(/\s+/g, '-')] || {};  
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
      setSelectedVerseIndex(null);
      setCurrentVerseIndex(selectedVerseIndex);
    }
  };

  const stopReading = () => {
    setIsReading(false);
    setCurrentVerseIndex(null);
  };

  const handleNextChapter = () => {
    stopSpeech()
    setChapter(chapter + 1);
  };

  const handlePreviousChapter = () => {
    stopSpeech()
    if (chapter > 1) setChapter(chapter - 1);
  };

  const handleChapterSelect = (chapterNum: number) => {
    setChapter(chapterNum);
    setChapterModalVisible(false);
  };

  const textStyle = { fontSize, lineHeight: Math.max(fontSize * 1.5, 24) };

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
        <ThemedText onLongPress={() => setSelectedVerseIndex(index)} style={[styles.verseText, { backgroundColor: isSelected || isActive ? colors.card : 'transparent' }, textStyle]}>
          <ThemedText style={[styles.verseNumber, textStyle]}>{index + 1}.{" "}</ThemedText>
          {words.map((word, wordIndex) => {
            const footnote = item.footnotes.find(f => f.word === word && f.note);
            return (
              <ThemedText
                key={wordIndex}
                type={footnote ? 'link' : undefined}
                style={[footnote ? styles.highlight : undefined, textStyle]}
                onPress={footnote ? () => setSelectedFootnote(footnote) : undefined}
              >
                {word}{" "}
              </ThemedText>
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
    if(loading || chapter === 0) {
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

    return (
      <ThemedView style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => setChapterModalVisible(true)}>
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
        visible={isChapterModalVisible || chapter === 0}
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
            <View style={{ width: '100%', borderTopColor: '#ccc', borderTopWidth: 1, paddingTop: 10 }}>
              <ThemedButton title="Close" onPress={() => chapter === 0 ? router.back() : setChapterModalVisible(false)} />
            </View>
          </ThemedView>
        </View>
      </Modal>
    )
  }

  function renderFootnotesModal() {
    return (
      <Modal
        visible={!!selectedFootnote}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedFootnote(null)}
      >
        <View style={styles.modalBackground}>
          <ThemedView style={styles.modalContainer}>
            <ThemedText style={styles.modalText}>{selectedFootnote?.note}</ThemedText>
            <ThemedButton title="Close" onPress={() => setSelectedFootnote(null)} />
          </ThemedView>
        </View>
      </Modal>
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
  highlight: {
    textDecorationLine: 'underline',
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
