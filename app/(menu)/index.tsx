import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    router.navigate(`/chapter/${book}`);
  };

  const inset = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: inset.top }]}>
      <ThemedText style={styles.title}>BIBLIA</ThemedText>
      <ThemedText style={{ textAlign: 'center', marginBottom: 15 }}>SALIN SA PAGBABAWI</ThemedText>
      <ThemedText style={{ textAlign: 'center', fontSize: 20, marginBottom: 15 }}>Ang Bagong Tipan</ThemedText>
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
    </View>
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
    borderTopColor: '#cfcfcf',
    borderTopWidth: 1,
    padding: 20,
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
