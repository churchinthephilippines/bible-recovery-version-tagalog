import * as Speech from 'expo-speech';
import { SPEECH_LANGUAGE } from "@/constants/Speech";
import { useSettingsStore } from "@/store/settings";

export const useTextToSpeech = () => {
  const { speechRate, speechPitch } = useSettingsStore();
  return {
    textToSpeech: (text: string, onDone?: () => void) => {
      Speech.speak(text, {
        onDone,
        language: SPEECH_LANGUAGE, 
        pitch: speechPitch,
        rate: speechRate,
      });
    },
    stopSpeech: () => {
      Speech.stop();
    }
  }
}