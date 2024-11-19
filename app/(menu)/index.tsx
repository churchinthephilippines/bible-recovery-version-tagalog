import ThemedContainer from "@/components/ThemedContainer";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import React from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from 'expo-haptics';

const books = [
  "Mateo",
  "Marcos",
  "Lucas",
  "Juan",
  "Mga Gawa",
  "Roma",
  "1 Corinto",
  "2 Corinto",
  "Galacia",
  "Efeso",
  "Filipos",
  "Colosas",
  "1 Tesalonica",
  "2 Tesalonica",
  "1 Timoteo",
  "2 Timoteo",
  "Tito",
  "Filemon",
  "Hebreo",
  "Santiago",
  "1 Pedro",
  "2 Pedro",
  "1 Juan",
  "2 Juan",
  "3 Juan",
  "Judas",
  "Apocalipsis",
];

const Books = () => {
  const handleBookPress = (book: string) => {
    Haptics.selectionAsync();
    router.navigate(`/chapter/${book}`);
  };

  const inset = useSafeAreaInsets();

  return (
    <ThemedContainer
      header={(
        <>
          <ThemedText type="title" allColor="#F5F5DC" style={{ textAlign: 'center' }}>BIBLIA</ThemedText>
          <ThemedText allColor="#F5F5DC" style={{ textAlign: 'center', marginBottom: 15 }}>SALIN SA PAGBABAWI</ThemedText>
        </>
      )}
     >
      <ThemedText colorName="primary" style={{ textAlign: 'center', fontSize: 20, marginBottom: 15 }}>Ang Bagong Tipan</ThemedText>
      <FlatList
        data={books}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleBookPress(item)}>
            <ThemedText style={styles.bookName}>{item}</ThemedText>
          </TouchableOpacity>
        )}
        style={styles.listContainer}
      />
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listContainer: {
    width: '100%',
    borderBottomColor: '#cfcfcf',
    borderBottomWidth: 1,
  },
  bookName: {
    fontSize: 18,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    textAlign: 'center',
  },
});

export default Books;
