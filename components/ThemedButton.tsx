import { Button, type ButtonProps } from "react-native"

import { useThemeColor } from "@/hooks/useThemeColor"
import { DefaultTheme } from "@react-navigation/native"

export type ThemedButtonProps = ButtonProps & {
  lightColor?: string
  darkColor?: string
  allColor?: string
  colorName?: keyof typeof DefaultTheme.colors
}

export function ThemedButton({
  lightColor,
  darkColor,
  allColor,
  colorName = 'primary',
  ...otherProps
}: ThemedButtonProps) {
  const color = useThemeColor(
    { light: allColor || lightColor, dark: allColor || darkColor },
    colorName
  )

  return <Button color={color} {...otherProps} />
}
