import secureStorage from "@/utils/secureStorage"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type SettingsStore = {
  fontSize: number
  setFontSize: (fontSize: number) => void
  themeMode: "light" | "dark" | "auto"
  setThemeMode: (themeMode: "light" | "dark" | "auto") => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => (
      {
        fontSize: 16,
        setFontSize: (fontSize) => set((state) => ({ ...state, fontSize })),
        themeMode: "auto",
        setThemeMode: (themeMode) => set((state) => ({ ...state, themeMode })),
      }
    ),
    {
      name: "setting-secure-store", // A unique key for Secure Store
      storage: secureStorage, // Use the custom Secure Store adapter
    }
  )
)
