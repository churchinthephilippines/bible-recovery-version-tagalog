import { useMemo, useState } from "react"
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  View,
  FlatList,
  Text,
} from "react-native"
import { ThemedText, ThemedTextProps } from "./ThemedText"
import { ModalCentered } from "./ModalCentered"
import { themedTextInputStyles } from "./ThemedTextInput"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useTheme } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { ThemedView } from "./ThemedView"

type ModalPickerProps = {
  clearable?: boolean;
  options: Array<{
    label: string
    value: string | number
  }>
  value?: string | number | null
  placeholder: string
  placeholderTextColor?: string
  onChangeValue?: (value: string | number | null) => void
  lightColor?: string
  darkColor?: string
  textStyle?: ThemedTextProps['style']
}

export function ModalPicker({
  clearable,
  options,
  value,
  placeholder,
  placeholderTextColor = "#aaa",
  onChangeValue,
  lightColor,
  darkColor,
  textStyle
}: ModalPickerProps) {
  const { colors } = useTheme();
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  const [modalVisible, setModalVisible] = useState(false)

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [value]
  )

  const renderItem = ({ item }: { item: (typeof options)[number] }) => (
    <TouchableOpacity
      style={[styles.selectItem, { 
        backgroundColor: value === item.value ? colors.border : colors.background,
        borderBottomColor: colors.notification,
      }]}
      onPress={() => {
        onChangeValue?.(item.value)
        setModalVisible(false)
      }}
    >
      <ThemedText style={{color: value === item.value ? colors.primary : colors.text }}>{item.label}</ThemedText>
    </TouchableOpacity>
  )

  return (
    <>
      <TouchableOpacity
        style={{backgroundColor, borderColor: colors.border, ...themedTextInputStyles}}
        onPress={() => setModalVisible(true)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ThemedText style={[{color: colors.text}, textStyle]}>
            {selected?.label || (<Text style={{color: placeholderTextColor}}>{placeholder}</Text>)}
          </ThemedText>
          {(clearable && !!selected) && (
            <TouchableOpacity onPress={() => onChangeValue?.(null)}>
              <Ionicons name="close-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
      <ModalCentered
        title={placeholder}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
       <ThemedView>
          <FlatList
            data={options}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            style={{maxHeight: '100%' }}
          />
       </ThemedView>
      </ModalCentered>
    </>
  )
}

const styles = StyleSheet.create({
  selectItem: {
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
  },
})
