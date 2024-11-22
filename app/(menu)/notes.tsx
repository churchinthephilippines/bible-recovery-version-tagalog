import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import { ThemedText, ThemedTextProps } from "@/components/ThemedText"
import ThemedContainer from "@/components/ThemedContainer"
import { useCallback, useEffect, useMemo, useState } from "react"
import { noteModel, NoteModelType } from "@/services/sqlite/models/note.model"
import { useFocusEffect } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable"
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
import { RenderRightActions } from "@/components/notes/RenderRightActions"
import { useNoteGroups } from "@/hooks/useNoteGroups"
import ModalBottom from "@/components/ModalBottom"
import { NoteGroupModelType } from "@/services/sqlite/models/note.group.model"
import * as Haptics from "expo-haptics"
import { Ionicons } from "@expo/vector-icons"

export default function TabTwoScreen() {
  const fontSize = useSettingsStore((state) => state.fontSize)
  const { colors } = useTheme()
  const [notes, setNotes] = useState<NoteModelType[]>([])
  const [searchText, setSearchText] = useState<string>("")
  const [searchBook, setSearchBook] = useState<string | null>(null)
  const [searchNoteGroup, setSearchNoteGroup] = useState<number | null>(null)
  const [updateNote, setUpdateNote] = useState<NoteModelType | null>(null)
  const [updateNoteGroup, setUpdateNoteGroup] =
    useState<NoteGroupModelType | null>(null)
  const { noteGroups, saveNoteGroup, loadNoteGroups } = useNoteGroups()
  const noteGroupOptions = useMemo(
    () =>
      noteGroups.map((noteGroup) => ({
        label: noteGroup.name,
        value: noteGroup.id,
      })),
    [noteGroups]
  )
  const noteGroupNames = useMemo(() => {
    const groupMaps = new Map<number, string>()
    noteGroups.forEach((noteGroup) =>
      groupMaps.set(noteGroup.id, noteGroup.name)
    )
    return groupMaps
  }, [noteGroups])

  useFocusEffect(useCallback(() => {
    loadNoteGroups()
  }, []));

  const getTitle = (item: NoteModelType) =>
    `${item.book} ${item.chapter}:${item.verseIndex}`

  const loadNotes = async () => {
    await noteModel.createTable()

    const where: WhereClause = [["note", "!=", ""]]
    if (searchBook) where.push(["book", "=", searchBook])
    if (searchText) where.push(["note", "LIKE", `%${searchText}%`])
    if (searchNoteGroup) where.push(["noteGroupId", "=", searchNoteGroup])

    const data = await noteModel.findAll({
      where,
    })

    setNotes(data)
  }

  useEffect(() => {
    loadNotes()
  }, [searchBook, searchText, searchNoteGroup])

  useFocusEffect(
    useCallback(() => {
      loadNotes()

      return () => {
        setNotes([])
      }
    }, [searchBook, searchText, searchNoteGroup])
  )

  const saveNote = async ({ id, ...props }: NoteModelType) => {
    await noteModel.update(props, [["id", "=", id]])
    setNotes((prev) => {
      const updatedNotes = prev.filter((note) => note.id !== id)
      return [...updatedNotes, { id, ...props }]
    })
  }

  const handleEdit = (item: NoteModelType) => {
    setUpdateNote(item)
  }

  const handleDelete = (item: NoteModelType) => {
    const onDelete = async () => {
      setNotes((prev) => prev.filter((note) => note.id !== item.id))
      noteModel.delete([["id", "=", item.id]])
    }
    Alert.alert(
      "Pag-tanggal sa tala",
      `Sigurado kaba na gusto mong tanggalin ang tala na iyong isinulat sa ${getTitle(
        item
      )}?`,
      [
        { text: "Huwag", style: "cancel" },
        { text: "Oo", style: "destructive", onPress: onDelete },
      ]
    )
  }

  const lastIndex = notes.length - 1

  const textStyle = { fontSize, lineHeight: Math.max(fontSize * 1.5, 28) }

  const titleStyle = {
    fontSize: fontSize + 4,
    lineHeight: Math.max(fontSize * 1.5, 28),
  }

  const renderItem = ({
    item,
    index,
  }: {
    item: NoteModelType
    index: number
  }) => (
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
        title={`${getTitle(item)}${
          item.noteGroupId
            ? ` (${noteGroupNames.get(item.noteGroupId) || "Walang grupo"})`
            : ""
        }`}
        titleStyle={textStyle}
        headingActiveStyle={{ backgroundColor: colors.border }}
        activeStyle={{ borderBottomWidth: lastIndex !== index ? 2 : 0 }}
        style={{
          borderBottomColor: colors.border,
          borderBottomWidth: lastIndex !== index ? 2 : 1,
        }}
      >
        <ThemedView
          colorName="card"
          style={[
            styles.notesContainer,
            { borderWidth: 2, borderColor: colors.border, marginBottom: 15 },
          ]}
        >
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
      <Collapsible
        title="Mga Filter"
        titleStyle={[titleStyle, { textAlign: 'center', color: colors.primary }]}
        headingStyle={{ justifyContent: 'center', backgroundColor: colors.notification }}
        style={{ borderWidth: 1, borderColor: colors.notification, marginBottom: 10 }}
      >
        <ThemedView
          style={{
            padding: 15
          }}
        >
          <ThemedTextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Salain ang tala gamit ang Teksto"
            style={{ marginBottom: 15, textAlignVertical: 'top' }}
          />
          <ModalPicker
            value={searchBook}
            options={bookListOptions}
            clearable
            onChangeValue={(value) => setSearchBook(value as string)}
            placeholder="Salain ang tala gamit ang Libro"
            style={{ marginBottom: 15 }}
          />
          <ModalPicker
            value={searchNoteGroup}
            options={noteGroupOptions}
            clearable
            onChangeValue={(value) => setSearchNoteGroup(value as number)}
            placeholder="Salain ang tala gamit ang Group"
          />
        </ThemedView>
      </Collapsible>
      {notes.length > 0 ? (
        <GestureHandlerRootView>
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        </GestureHandlerRootView>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText style={{ ...textStyle, textAlign: "center" }}>
            Walang makitang tala sa
          </ThemedText>
          {!!searchBook && (
            <ThemedText
              style={{
                ...textStyle,
                textAlign: "center",
                fontStyle: "italic",
                marginBottom: 5,
              }}
            >
              Libro:{" "}
              <ThemedText style={{ fontWeight: "bold" }}>
                "{searchBook}"
              </ThemedText>
            </ThemedText>
          )}
          {!!searchText && (
            <ThemedText
              style={{
                ...textStyle,
                textAlign: "center",
                fontStyle: "italic",
                marginBottom: 5,
              }}
            >
              Teksto:{" "}
              <ThemedText style={{ fontWeight: "bold" }}>
                "{searchText}"
              </ThemedText>
            </ThemedText>
          )}
          {(!!searchText || !!searchBook) && (
            <ThemedButton
              title="I-reset ang filters"
              onPress={() => {
                setSearchText("")
                setSearchBook(null)
              }}
            />
          )}
        </View>
      )}
      {renderSaveNotesModal()}
    </ThemedContainer>
  )

  function renderSaveNotesModal() {
    const closeNoteModal = () => {
      setUpdateNote(null)
    }

    const closeWithChecking = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)

      const oldNote = notes?.find((item) => item.id === updateNote?.id)

      if (
        !oldNote ||
        (updateNote?.id === oldNote?.id && updateNote?.note === oldNote?.note)
      ) {
        closeNoteModal()
        return
      }

      Alert.alert(
        "⚠️ Babala ⚠️",
        "Ang iyong natala ay hindi pa na-save. Gusto mo ba tuluyang isara ang form at mawala ang iyong na mga nagawa?",
        [
          { text: "Oo", onPress: closeNoteModal },
          { text: "Huwag", style: "cancel" },
        ]
      )
    }

    return (
      <ModalBottom visible={!!updateNote} onClose={closeWithChecking}>
        <ThemedText style={[styles.modalTitle, titleStyle]}>
          Mag-tala
        </ThemedText>
        <ThemedView
          colorName="card"
          style={{ flexDirection: "row", gap: 5, marginBottom: 15 }}
        >
          <View style={{ flex: 1 }}>
            <ModalPicker
              value={updateNote?.noteGroupId}
              options={noteGroupOptions}
              onChangeValue={(noteGroupId) =>
                setUpdateNote(
                  (prev) =>
                    prev && { ...prev, noteGroupId: noteGroupId as number }
                )
              }
              placeholder="Pumili ng grupo ng tala"
            />
          </View>
          <TouchableOpacity
            onPress={() => setUpdateNoteGroup({ id: 0, name: "" })}
            style={{
              width: 55,
              height: "100%",
              paddingHorizontal: 12,
              paddingVertical: 13,
              borderRadius: 5,
              backgroundColor: colors.primary,
            }}
          >
            <Ionicons name="add-circle-outline" size={30} color="#ffffff" />
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={{ height: 250, marginBottom: 15 }}>
          <ThemedTextInput
            placeholder="Ano ang iyong gustong i-tala?"
            value={updateNote?.note}
            onChangeText={(note) =>
              setUpdateNote((prev) => prev && { ...prev, note })
            }
            multiline
            style={{ height: "100%", textAlignVertical: "top", ...textStyle }}
          />
        </ThemedView>
        <ThemedButton
          title="I-save ang Tala"
          onPress={() => {
            saveNote({ ...updateNote! })
            closeNoteModal()
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          }}
        />
        <ModalBottom
          visible={!!updateNoteGroup}
          onClose={() => {
            setUpdateNoteGroup(null)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          }}
        >
          <ThemedText style={[styles.modalTitle, titleStyle]}>
            Gumawa ng grupo ng tala
          </ThemedText>
          <View style={{ height: 150, marginBottom: 15 }}>
            <ThemedTextInput
              placeholder="Ano ang pangalan bagong grupo?"
              value={updateNoteGroup?.name}
              onChangeText={(name) =>
                setUpdateNoteGroup((prev) => prev && { ...prev, name })
              }
            />
          </View>
          <ThemedButton
            title="I-save ang Grupo"
            onPress={async () => {
              if (updateNoteGroup?.name === "")
                return Alert.alert(
                  "Walang pangalan",
                  "Mangyaring maglagay ng pangalan ng grupo"
                )
              const noteGroupId = await saveNoteGroup({ ...updateNoteGroup! })
              setUpdateNote(prev => prev && ({ ...prev, noteGroupId }));
              setUpdateNoteGroup(null)
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              )
            }}
          />
        </ModalBottom>
      </ModalBottom>
    )
  }
}

const VerseToggle = ({
  item,
  textStyle,
}: {
  item: NoteModelType
  textStyle: ThemedTextProps["style"]
}) => {
  const [show, setShow] = useState(false)

  return (
    <>
      <ThemedView
        colorName="card"
        style={{ flexDirection: "row", justifyContent: "flex-start" }}
      >
        <TouchableOpacity onPress={() => setShow((prev) => !prev)}>
          <ThemedText style={[{ fontStyle: "italic" }, textStyle]} type="link">
            I-{show ? "tago" : "pakita"} ang Bersikulo
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      {show && (
        <ThemedView
          colorName="border"
          style={{
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 5,
            marginBottom: 5,
          }}
        >
          <ThemedText style={[{ fontStyle: "italic" }, textStyle]}>
            {/* @ts-ignore */}
            {bible[formatBookName(item.book)][`chapter-${item.chapter}`]
                .verses[item.verseIndex]?.text
            }
          </ThemedText>
        </ThemedView>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  notesContainer: {
    padding: 15,
  },
  noteText: {
    fontSize: 16,
    marginVertical: 4,
  },
  modalTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
})
