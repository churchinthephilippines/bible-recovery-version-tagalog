/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */
import { useColorScheme } from "./useColorScheme";
import { DarkTheme,  DefaultTheme,  useTheme } from "@react-navigation/native";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof DarkTheme.colors & keyof typeof DefaultTheme.colors
) {
  const { colors } = useTheme()
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[colorName];
  }
}
