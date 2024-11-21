import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  allColor?: string;
  colorName?: keyof typeof DefaultTheme.colors;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  allColor,
  colorName = 'text',
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const scheme = useColorScheme()
  const color = useThemeColor({ light: allColor || lightColor, dark: allColor || darkColor }, colorName);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: scheme === 'dark' ? '#67a3ff' : '#0b5cb4'}] : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#3782f5',
  },
});
