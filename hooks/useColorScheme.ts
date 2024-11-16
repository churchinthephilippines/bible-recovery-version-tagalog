import { useSettingsStore } from "@/store/settings";
import { useColorScheme as _useColorScheme } from 'react-native';

export const useColorScheme = () => {
	const { themeMode } = useSettingsStore();
  const autoTheme = _useColorScheme() ?? 'light';
  return themeMode === 'auto' ? autoTheme : themeMode;
};
