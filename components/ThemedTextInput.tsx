import { TextInput, type TextInputProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({ style, lightColor, darkColor, placeholderTextColor = "#aaa", ...otherProps }: ThemedTextInputProps) {
	const color = useThemeColor({}, 'text');
	const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'card');

  return <TextInput style={[{ backgroundColor, color, borderColor, ...themedTextInputStyles }, style]} placeholderTextColor={placeholderTextColor} {...otherProps} />;
}

export const themedTextInputStyles = { 
  padding: 15, 
  borderWidth: 1, 
  borderRadius: 5,
  fontSize: 16,
  lineHeight: 24,
}
