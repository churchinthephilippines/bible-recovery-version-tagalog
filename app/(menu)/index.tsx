import ThemedContainer from "@/components/ThemedContainer";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import React from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from "@react-navigation/native";
import { bookList } from "@/constants/BookList";

const Books = () => {
  const { colors } = useTheme();
  const handleBookPress = (book: string) => {
    Haptics.selectionAsync();
    router.navigate(`/chapter/${book}`);
  };

  return (
    <ThemedContainer
      header={(
        <>
          <ThemedText type="title" allColor="#F5F5DC" style={{ textAlign: 'center' }}>BIBLIA</ThemedText>
          <ThemedText allColor="#F5F5DC" style={{ textAlign: 'center', marginBottom: 15 }}>SALIN SA PAGBABAWI</ThemedText>
        </>
      )}
      noPadding
     >
      <ThemedText colorName="primary" style={{ textAlign: 'center', fontSize: 20, marginVertical: 15 }}>Ang Bagong Tipan</ThemedText>
      <FlatList
        data={bookList}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleBookPress(item)} style={[styles.heading, { borderColor: colors.border }]}>
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
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderBottomWidth: 2,
  },
  bookName: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Books;
