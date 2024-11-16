import secureStorage from "@/utils/secureStorage"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type SettingsStore = {
  fontSize: number
  setFontSize: (fontSize: number) => void
  themeMode: "light" | "dark" | "auto"
  setThemeMode: (themeMode: "light" | "dark" | "auto") => void
  speechRate: number
  setSpeechRate: (speechRate: number) => void
  speechPitch: number
  setSpeechPitch: (speechPitch: number) => void
  setDefaultSettings: () => void
}

export const defaultSettings = {
  fontSize: 16,
  themeMode: "auto",
  speechRate: 1,
  speechPitch: 1,
} as const;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => (
      {
        ...defaultSettings,
        setFontSize: (fontSize) => set((state) => ({ ...state, fontSize })),
        setThemeMode: (themeMode) => set((state) => ({ ...state, themeMode })),
        setSpeechRate: (speechRate) => set((state) => ({ ...state, speechRate })),
        setSpeechPitch: (speechPitch) => set((state) => ({ ...state, speechPitch })),
        setDefaultSettings: () => set(() => ({ ...defaultSettings })),
      }
    ),
    {
      name: "setting-secure-store", // A unique key for Secure Store
      storage: secureStorage, // Use the custom Secure Store adapter
    }
  )
)
