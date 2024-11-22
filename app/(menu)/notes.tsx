import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import { ThemedText, ThemedTextProps } from "@/components/ThemedText"
import ThemedContainer from "@/components/ThemedContainer"
import { useCallback, useEffect, useState } from "react"
import { noteModel, NoteModelType } from "@/services/sqlite/models/note.model"
import { useFocusEffect } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable"
import { Ionicons } from "@expo/vector-icons"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { ThemedView } from "@/components/ThemedView"
import { useTheme } from "@react-navigation/native"
import { Collapsible } from "@/components/Collapsible"
import { useSettingsStore } from "@/store/settings"
import { ModalPicker } from "@/components/ModalPicker"
import { ThemedTextInput } from "@/components/ThemedTextInput"
import { WhereClause } from "@/services/sqlite/base.model"
import { bookListOptions } from "@/constants/BookList"
import bible from "@/assets/bible"
import formatBookName from "@/utils/formatBookName"
import { ThemedButton } from "@/components/ThemedButton"

export default function TabTwoScreen() {
  const fontSize = useSettingsStore((state) => state.fontSize)
  const { colors } = useTheme()
  const [notes, setNotes] = useState<NoteModelType[]>([])
  const [searchText, setSearchText] = useState<string>("")
  const [searchBook, setSearchBook] = useState<string | null>(null)

  const getTitle = (item: NoteModelType) =>
    `${item.book} ${item.chapter}:${item.verseIndex}`

  const loadNotes = async () => {
    await noteModel.createTable()

    const where: WhereClause = [["note", "!=", ""]]
    if (searchBook) where.push(["book", "=", searchBook])
    if (searchText) where.push(["note", "LIKE", `%${searchText}%`])
    const data = await noteModel.findAll({
      where,
    })

    setNotes(data)
  }

  useEffect(() => {
    loadNotes()
  }, [searchBook, searchText])

  useFocusEffect(
    useCallback(() => {
      loadNotes()

      return () => {
        setNotes([])
      }
    }, [searchBook, searchText])
  )

  const handleEdit = (item: NoteModelType) => {
    
  }

  const handleDelete = (item: NoteModelType) => {
    const onDelete = async () => {
      setNotes((prev) => prev.filter((note) => note.id !== item.id))
      noteModel.delete([["id", "=", item.id]])
    }
    Alert.alert(
      "Pag-tanggal sa tala",
      `Sigurado kaba na gusto mong tanggalin ang tala na iyong isinulat sa ${getTitle(item)}?`,
      [
        { text: "Huwag", style: "cancel" },
        { text: "Oo", style: "destructive", onPress: onDelete },
      ]
    )
  }

  const lastIndex = notes.length - 1

  const textStyle = { fontSize, lineHeight: Math.max(fontSize * 1.5, 28) }

  const renderItem = ({ item, index }: { item: NoteModelType, index: number }) => (
    <Swipeable
      friction={2}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      renderRightActions={(progress, dragX) => (
        <RenderRightActions
          progress={progress}
          dragX={dragX}
          item={item}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    >
      <Collapsible
        title={getTitle(item)}
        titleStyle={textStyle}
        headingActiveStyle={{ backgroundColor: colors.border }}
        activeStyle={{ borderBottomWidth: lastIndex !== index ? 2 : 0 }}
        style={{ borderBottomColor: colors.border, borderBottomWidth: lastIndex !== index ? 2 : 1 }}
      >
        <ThemedView colorName="card" style={[styles.notesContainer, { borderWidth: 2, borderColor: colors.border, marginBottom: 15 }]}>
          <ThemedText style={[styles.noteText, textStyle]}>
            {item.note}
          </ThemedText>
          <VerseToggle item={item} textStyle={textStyle} />
        </ThemedView>
      </Collapsible>
    </Swipeable>
  )

  return (
    <ThemedContainer
      header={
        <>
          <ThemedText
            type="title"
            allColor="#F5F5DC"
            style={{ textAlign: "center", marginBottom: 10 }}
          >
            Mga Tala
          </ThemedText>
        </>
      }
    >
      <ThemedView style={{paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: colors.notification}}>
        <ThemedTextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Salain ang tala gamit ang teksto"
          style={{marginBottom: 15}}
        />
        <ModalPicker
          value={searchBook}
          options={bookListOptions}
          clearable
          onChangeValue={(value) => setSearchBook(value as string)}
          placeholder="Salain ang tala gamit ang libro"
        />
      </ThemedView>
      {notes.length > 0 ? (
        <GestureHandlerRootView>
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        </GestureHandlerRootView>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText style={{ ...textStyle, textAlign: "center" }}>
            Walang makitang tala sa
          </ThemedText>
          {!!searchBook && (
            <ThemedText style={{ ...textStyle, textAlign: "center", fontStyle: "italic", marginBottom: 5 }}>
              Libro: <ThemedText style={{fontWeight: "bold"}}>"{searchBook}"</ThemedText>
            </ThemedText>
          )}
          {!!searchText && (
            <ThemedText style={{ ...textStyle, textAlign: "center",  fontStyle: "italic", marginBottom: 5 }}>
              Teksto: <ThemedText style={{fontWeight: "bold"}}>"{searchText}"</ThemedText>
            </ThemedText>
          )}
          {(!!searchText || !!searchBook) && (
            <ThemedButton title="I-reset ang filters" onPress={() => {
              setSearchText('')
              setSearchBook(null)
            }}/>
          )}
        </View>
      )}
    </ThemedContainer>
  )
}

type RenderRightActionsProps = {
  progress: Animated.SharedValue<number>
  dragX: Animated.SharedValue<number>
  item: NoteModelType
  onEdit: (item: NoteModelType) => void
  onDelete: (item: NoteModelType) => void
}

const RenderRightActions = ({
  progress,
  dragX,
  item,
  onEdit,
  onDelete,
}: RenderRightActionsProps) => {
  // Animated styles for stretching
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: dragX.value + 150 }],
    }
  })

  return (
    <Animated.View style={[styles.actionContainer, styleAnimation]}>
      <TouchableOpacity
        onPress={() => onEdit(item)}
        style={[styles.actionButton, styles.editButton]}
      >
        <Ionicons name="pencil-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onDelete(item)}
        style={[styles.actionButton, styles.deleteButton]}
      >
        <Ionicons name="trash-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
    </Animated.View>
  )
}

const VerseToggle = ({ item, textStyle }: { item: NoteModelType, textStyle: ThemedTextProps["style"] }) => {
  const [show, setShow] = useState(false)

  return (
    <>
      <ThemedView colorName="card" style={{flexDirection: "row", justifyContent: "flex-start"}}>
        <TouchableOpacity onPress={() => setShow(prev => !prev)}>
          <ThemedText style={[{ fontStyle: 'italic' }, textStyle]} type="link">I-{show ? 'tago' : 'pakita'} ang Bersikulo</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      {show && (
        <ThemedView colorName="border" style={{paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, marginBottom: 5}}>
          <ThemedText style={[{fontStyle: 'italic'}, textStyle]}>
            {/* @ts-ignore */}
            {bible[formatBookName(item.book)][`chapter-${item.chapter}`].verses[item.verseIndex]?.text}
          </ThemedText>
        </ThemedView>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  notesContainer: {
    padding: 16,
  },
  noteText: {
    fontSize: 16,
    marginVertical: 4,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#000",
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: 75,
  },
  editButton: {
    backgroundColor: "#007BFF",
  },
  deleteButton: {
    backgroundColor: "#FF4C4C",
  },
  actionText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
})
