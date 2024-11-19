import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useSettingsStore } from "@/store/settings"
import ThemedSlider from "@/components/ThemedSlider"
import ThemedRadioButton from "@/components/ThemedRadioButton"
import ThemedContainer from "@/components/ThemedContainer"
import { useCallback, useEffect, useState } from "react"
import Constants from 'expo-constants';
import { useTextToSpeech } from "@/hooks/useTextToSpeech"
import { useFocusEffect } from "expo-router"

const appVersion = Constants.manifest?.version || Constants.expoConfig?.version || 'Unknown version';

const previewVerse = 'Sa pasimula ay ang Salita, at ang Salita ay kasama ng Diyos, at ang Salita ay Diyos.'

export default function TabTwoScreen() {
  const { 
    fontSize, 
    setFontSize, 
    themeMode, 
    setThemeMode,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    setDefaultSettings
  } = useSettingsStore()
  // this is a hack to prevent glitch on android
  const [previewFontSize, setPreviewFontSize] = useState<number>(fontSize);

  const [isReading, setIsReading] = useState<boolean>(false);
  const { textToSpeech, stopSpeech } = useTextToSpeech()

  useFocusEffect(useCallback(() => {
    return () => {
      stopSpeech();
    }
  }, [fontSize]));

  useEffect(() => {
    setPreviewFontSize(fontSize);
  }, [fontSize]);

  const onTryToRead = () => {
    if(isReading) {
      setIsReading(false);
      return stopSpeech();
    }
    setIsReading(true);
    textToSpeech(previewVerse, () => setIsReading(false));
  }

  const onResetSetting = () => {
    Alert.alert('I-reset ang Mga Setting', 'I-reset ang Mga Setting', [
      {
        text: 'I-reset',
        onPress: () => {
          setDefaultSettings();
        },
      },
      { text: 'Huwag', style: 'cancel' },
    ]);
  }
  
  return (
    <ThemedContainer
      header={(
        <>
          <ThemedText type="title" allColor="#F5F5DC" style={{ textAlign: "center" }}>Mga Setting</ThemedText>
          <ThemedText allColor="#F5F5DC" style={{ textAlign: "center", fontSize: 10 }}>version {appVersion}</ThemedText>
        </>
      )}
    >
      <ScrollView style={{flex: 1}}>
        <ThemedView colorName="card" style={[styles.exampleContainer]}>
          <ThemedText style={{ fontSize: previewFontSize, lineHeight: Math.max(previewFontSize * 1.5, 28) }}>
            <Text>1.</Text> {previewVerse}
          </ThemedText>
        </ThemedView>
        <ThemedText>
          Laki ng mga Titik (Font Size): {previewFontSize?.toFixed(0)}
        </ThemedText>
        <ThemedSlider
          minimumValue={15}
          maximumValue={30}
          value={previewFontSize}
          onValueChange={(value) => setPreviewFontSize(value)}
          onSlidingComplete={(value) => setFontSize(value)}
        />
        <ThemedText>
          Taas ng boses (Voice Pitch): {speechPitch?.toFixed(1)}
        </ThemedText>
        <ThemedSlider
          minimumValue={0.6}
          maximumValue={1.5}
          step={0.1}
          value={speechPitch}
          onValueChange={(value) => setSpeechPitch(value)}
        />
        <ThemedText>
          Bilis ng pag-basa (Voice Rate): {speechRate?.toFixed(1)}
        </ThemedText>
        <ThemedSlider
          minimumValue={0.6}
          maximumValue={1.5}
          step={0.1}
          value={speechRate}
          onValueChange={(value) => setSpeechRate(value)}
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
        <TouchableOpacity onPress={onTryToRead} style={[styles.button, { backgroundColor: !isReading ? '#28a745' : '#dc3545', marginTop: 25 }]}>
          <ThemedText style={styles.buttonText}>{isReading ? 'Huminto sa pag-basa (Stop reading)' : 'Subukan ang pag-babasa (Test reading)'}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={onResetSetting} style={[styles.button]}>
          <ThemedText style={styles.buttonText}>I-reset ang Mga Setting (Reset Settings)</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedContainer>
  )
}

const styles = StyleSheet.create({
  exampleContainer: {
    marginBottom: 25,
    padding: 15,
    borderRadius: 5,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#dc3545',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
  },
})
