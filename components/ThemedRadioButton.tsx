import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from "./ThemedText";
import { useTheme } from "@react-navigation/native";
import * as Haptics from 'expo-haptics';

export type ThemedRadioButtonProps<T extends string> = {
  options: {
    value: T;
    label: string;
  }[];
  value: T;
  onValueChange: (value: T) => void;
}

export function ThemedRadioButton<T extends string>({
  options,
  value,
  onValueChange,
}: ThemedRadioButtonProps<T>) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;
        const onPress = () => {
          onValueChange(option.value);
          Haptics.selectionAsync()
        }
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.button, { borderColor: selected ? colors.primary: colors.text }]}
            onPress={onPress}
          >
            <ThemedText style={[styles.label, { color: selected ? colors.primary : colors.text }]}>
                {option.label}
            </ThemedText>
          </TouchableOpacity>
        )
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    flexWrap: 'wrap', // Support wrapping for long lists
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    margin: 5,
  },
  label: {
    fontSize: 16,
  },
});

export default ThemedRadioButton;