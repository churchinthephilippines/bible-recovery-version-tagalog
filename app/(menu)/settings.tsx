import { StyleSheet, Text } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useSettingsStore } from "@/store/settings"
import ThemedSlider from "@/components/ThemedSlider"
import ThemedRadioButton from "@/components/ThemedRadioButton"
import ThemedContainer from "@/components/ThemedContainer"

export default function TabTwoScreen() {
  const { fontSize, setFontSize, themeMode, setThemeMode } = useSettingsStore()
  
  return (
    <ThemedContainer
      header={<ThemedText type="title" allColor="#F5F5DC" style={{ textAlign: "center", marginBottom: 15 }}>Mga Setting</ThemedText>}
    >
      <ThemedView colorName="card" style={[styles.exampleContainer]}>
        <ThemedText style={{ fontSize, lineHeight: Math.max(fontSize * 1.5, 24) }}>
          <Text>1.</Text> Sa pasimula ay ang Salita,
          at ang Salita ay kasama ng Diyos, at ang Salita ay Diyos.
        </ThemedText>
      </ThemedView>
      <ThemedText>
        Laki ng mga Titik (Font Size): {fontSize?.toFixed(0)}
      </ThemedText>
      <ThemedSlider
        minimumValue={15}
        maximumValue={30}
        value={fontSize}
        onValueChange={(value) => setFontSize(value)}
      />
      <ThemedText>
        Tema (Theme Mode)
      </ThemedText>
      <ThemedRadioButton
        options={[
          { value: 'light', label: 'Maliwanag' },
          { value: 'dark', label: 'Madilim' },
          { value: 'auto', label: 'Awtomatiko' },
        ]}
        value={themeMode}
        onValueChange={(value) => setThemeMode(value)}
      />
    </ThemedContainer>
  )
}

const styles = StyleSheet.create({
  exampleContainer: {
    marginBottom: 25,
    padding: 15,
    borderRadius: 5,
  },
})
