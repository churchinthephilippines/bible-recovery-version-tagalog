import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider, { SliderProps } from '@react-native-community/slider';
import { useTheme } from '@react-navigation/native';

export function ThemedSlider(props: SliderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container]}>
      <Slider
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10
  },
});

export default ThemedSlider;