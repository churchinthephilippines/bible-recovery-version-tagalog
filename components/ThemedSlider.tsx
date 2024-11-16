import React from 'react';
import { View, StyleSheet } from 'react-native';
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
        style={[styles.slider, props.style]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15
  },
  slider: {
    height: 40,
  },
});

export default ThemedSlider;