import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText, ThemedTextProps } from '@/components/ThemedText';
import { ThemedView, ThemedViewProps } from '@/components/ThemedView';
import { Theme, useTheme } from "@react-navigation/native";

type CollapsibleProps = {
  title: string;
  titleStyle?: ThemedTextProps['style'];
  titleActiveStyle?: ThemedTextProps['style'];
  headingActiveStyle?: ThemedViewProps['style'];
  activeStyle?: ThemedViewProps['style'];
} & ThemedViewProps;

export function Collapsible({ children, title, titleStyle, titleActiveStyle, headingActiveStyle, activeStyle, style, ...props }: CollapsibleProps) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  return (
    <ThemedView style={[style, open ? activeStyle : undefined]} {...props}>
      <TouchableOpacity
        style={[styles.heading, open ? headingActiveStyle : undefined]}
        onPress={() => setOpen((value) => !value)}
        activeOpacity={0.8}>
        <ThemedText type="defaultSemiBold" style={[titleStyle, open ? titleActiveStyle : undefined]}>{title}</ThemedText>
        <Ionicons
          name={open ? 'chevron-down' : 'chevron-forward-outline'}
          size={18}
          color={colors.primary}
        />
      </TouchableOpacity>
      {open && children}
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
