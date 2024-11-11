import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { Stack, useLocalSearchParams } from "expo-router";
import books from '@/assets/bible';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';

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
  const params = useLocalSearchParams<{ book: string }>();
  const [chapter, setChapter] = useState<number>(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selectedFootnote, setSelectedFootnote] = useState<Footnote | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number | null>(null);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [selectedVerseIndex, setSelectedVerseIndex] = useState<number | null>(null);
  const [isChapterModalVisible, setChapterModalVisible] = useState<boolean>(false);
  const [numberOfChapters, setNumberOfChapters] = useState<number>(0);
  const [loading, setLoading] = useState(true)

  useLayoutEffect(() => {
    setLoading(true);
  }, []);

  const loadChapter = () => {
    // @ts-ignore
    const book = books[params.book.toLowerCase().replace(/\s+/g, '-')] || {};  
    const jsonData = book[`chapter-${chapter}`];
    setVerses(jsonData?.verses || []);
    
    setSelectedVerseIndex(null);
    setCurrentVerseIndex(null);
    setLoading(false);
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
    if(currentVerseIndex === null) return;
    const verseText = verses[currentVerseIndex].text;

    Speech.speak(`${verseText}`, {
      onDone: () => {
        setCurrentVerseIndex(prev => prev !== null ? prev + 1 : prev)
      },
      language: 'fil-PH',  // Attempt to use Filipino (Tagalog)
      pitch: 1,  // Adjust pitch
      rate: 1,  
    });

    return () => {
      Speech.stop();
    }
  };
  
  useEffect(readVerse, [currentVerseIndex]);

  useEffect(() => {
    return () => {
      setCurrentVerseIndex(null);
    }
  }, []);

  const startReadingFromSelectedVerse = () => {
    if (selectedVerseIndex !== null) {
      setIsReading(true);
      setSelectedVerseIndex(null);
      setCurrentVerseIndex(selectedVerseIndex);
    }
  };

  const stopReading = () => {
    setIsReading(false);
    setCurrentVerseIndex(null);
  };

  const handleNextChapter = () => {
    setChapter(chapter + 1);
  };

  const handlePreviousChapter = () => {
    if (chapter > 1) setChapter(chapter - 1);
  };

  const handleChapterSelect = (chapterNum: number) => {
    setChapter(chapterNum);
    setChapterModalVisible(false);
  };

  const renderVerse = ({ item, index }: { item: Verse; index: number }) => {
    const words = item.text.split(" ");
    const isActive = index === currentVerseIndex;
    const isSelected = index === selectedVerseIndex;

    return (
      <>
        {item.outlines && item.outlines.length > 0 && (
          <>
            {item.outlines.map((outline, outlineIndex) => (
              <Text key={outlineIndex} style={styles.outlineText}>
                {outline}
              </Text>
            ))}
          </>
        )}
        <Text style={[styles.verseText, isSelected && styles.selectedVerse, isActive && styles.activeVerse]}>
          <Text onPress={() => setSelectedVerseIndex(index)} style={styles.verseNumber}>{index + 1}.{" "}</Text>
          {words.map((word, wordIndex) => {
            const footnote = item.footnotes.find(f => f.word === word && f.note);
            return (
              <Text
                key={wordIndex}
                style={footnote ? styles.highlight : undefined}
                onPress={footnote ? () => setSelectedFootnote(footnote) : undefined}
              >
                {word}{" "}
              </Text>
            );
          })}
        </Text>
      </>
    );
  };

  const inset = useSafeAreaInsets()

  if(loading) {
    return (
      <>
        <Stack.Screen options={{ title: `${params.book}` }} />
        <View style={{ flex: 1, paddingBottom: inset.bottom, paddingHorizontal: 15 }}>
          <Text style={styles.chapterTitle}>Kapitulo {chapter}</Text>
          <ActivityIndicator size="large"/>
        </View>
      </>
    )
  }

  if(!loading && numberOfChapters === 0) {
    return (
      <View style={{backgroundColor: '#fff', flex: 1, paddingVertical: 50}}>
        <Text style={{textAlign: 'center'}}>Ang Libro ng {params.book} ay hindi pa na-ilalathala.</Text>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: `${params.book}` }} />
      <View style={{ flex: 1, paddingBottom: inset.bottom, paddingHorizontal: 15 }}>
        <TouchableOpacity onPress={() => setChapterModalVisible(true)}>
          <Text style={styles.chapterTitle}>Kapitulo {chapter}</Text>
        </TouchableOpacity>
        <FlatList
          data={verses}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderVerse}
        />
        <View style={styles.paginationButtons}>
          <Button title="Previous" onPress={handlePreviousChapter} disabled={chapter === 1} />
          <Button title="Next" onPress={handleNextChapter} disabled={chapter === numberOfChapters} />
        </View>
        {(currentVerseIndex !== null || selectedVerseIndex != null) && (
          <View style={styles.controlButtons}>
            {isReading ? (
              <Button title="Stop Reading" onPress={stopReading} color="red" />
            ) : (
              <Button title={currentVerseIndex === null ? "Start Reading Verse" : "Resume Reading"} onPress={startReadingFromSelectedVerse} color="green" />
            )}
          </View>
        )}

        {/* Chapter Selection Modal */}
        <Modal
          visible={isChapterModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setChapterModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Mamili ng Kapitulo</Text>
              <FlatList
                style={{borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ccc', width: '100%'}}
                data={Array.from({ length: numberOfChapters }, (_, i) => i + 1)}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleChapterSelect(item)}>
                    <Text style={[styles.chapterItem, item === chapter && { color: 'red' }]}>Kapitulo {item}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button title="Close" onPress={() => setChapterModalVisible(false)} />
            </View>
          </View>
        </Modal>

        {/* Footnote Modal */}
        <Modal
          visible={!!selectedFootnote}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedFootnote(null)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>{selectedFootnote?.note}</Text>
              <Button title="Close" onPress={() => setSelectedFootnote(null)} />
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  chapterTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 10,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  verseNumber: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  verseText: {
    padding: 10,
    fontSize: 16,
  },
  outlineText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  activeVerse: {
    backgroundColor: '#d0f0c0',
  },
  selectedVerse: {
    backgroundColor: '#cce5ff',
  },
  highlight: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 0
  },
  controlButtons: {
    marginVertical: 10,
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    maxHeight: '80%',
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
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
