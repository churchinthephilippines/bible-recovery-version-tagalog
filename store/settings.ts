import { create } from 'zustand'

type SettingsStore = {
  fontSize: number;
  setFontSize: (fontSize: number) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  fontSize: 15,
  setFontSize: (fontSize) => set((state) => ({ ...state, fontSize })),
}))