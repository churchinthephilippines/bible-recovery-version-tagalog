import { create } from 'zustand'

type SettingsStore = {
  fontSize: number;
  setFontSize: (fontSize: number) => void;
  themeMode: 'light' | 'dark' | 'auto';
  setThemeMode: (themeMode: 'light' | 'dark' | 'auto') => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  fontSize: 16,
  setFontSize: (fontSize) => set((state) => ({ ...state, fontSize })),
  themeMode: 'auto',
  setThemeMode: (themeMode) => set((state) => ({ ...state, themeMode })),
}))