import * as Speech from 'expo-speech';
import { SPEECH_LANGUAGE, SPEECH_PITCH, SPEECH_RATE } from "@/constants/Speech";

export const useTextToSpeech = () => {
  return {
    textToSpeech: (text: string, onDone: () => void) => {
      Speech.speak(text, {
        onDone,
        language: SPEECH_LANGUAGE, 
        pitch: SPEECH_PITCH,
        rate: SPEECH_RATE,
      });
    },
    stopSpeech: () => {
      Speech.stop();
    }
  }
}