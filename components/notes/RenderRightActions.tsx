import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, { useAnimatedStyle } from "react-native-reanimated"

type RenderRightActionsProps<T> = {
  progress: Animated.SharedValue<number>
  dragX: Animated.SharedValue<number>
  item: T
  onEdit: (item: T) => void
  onDelete: (item: T) => void
}

export function RenderRightActions<T>({
  progress,
  dragX,
  item,
  onEdit,
  onDelete,
}: RenderRightActionsProps<T>) {
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

const styles = StyleSheet.create({
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
})
