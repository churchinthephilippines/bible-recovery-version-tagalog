import { View, type ViewProps } from "react-native"

import { useThemeColor } from "@/hooks/useThemeColor"
import { DefaultTheme } from "@react-navigation/native"

export type ThemedViewProps = ViewProps & {
  lightColor?: string
  darkColor?: string
  allColor?: string
  colorName?: keyof typeof DefaultTheme.colors
}

export function ThemedView({
  style,
  lightColor,
  darkColor,
  allColor,
  colorName = 'background',
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: allColor || lightColor, dark: allColor || darkColor },
    colorName
  )

  return <View style={[{ backgroundColor }, style]} {...otherProps} />
}
