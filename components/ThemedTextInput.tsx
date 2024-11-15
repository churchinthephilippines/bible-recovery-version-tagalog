import { TextInput, type TextInputProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({ style, lightColor, darkColor, ...otherProps }: ThemedTextInputProps) {
	const color = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <TextInput style={[{ backgroundColor, color, padding: 15, borderWidth: 1, borderColor: color, borderRadius: 5 }, style]} {...otherProps} />;
}
