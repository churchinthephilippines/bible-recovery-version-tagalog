import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText, ThemedTextProps } from '@/components/ThemedText';
import { ThemedView, ThemedViewProps } from '@/components/ThemedView';
import { Theme, useTheme } from "@react-navigation/native";

type CollapsibleProps = {
  title: string;
  titleStyle?: ThemedTextProps['style'];
} & ThemedViewProps;

export function Collapsible({ children, title, titleStyle, ...props }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();
  return (
    <ThemedView {...props}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <ThemedText type="defaultSemiBold" style={titleStyle}>{title}</ThemedText>
        <Ionicons
          name={isOpen ? 'chevron-down' : 'chevron-forward-outline'}
          size={18}
          color={colors.primary}
        />
      </TouchableOpacity>
      {isOpen && children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    padding: 16,
  },
});
