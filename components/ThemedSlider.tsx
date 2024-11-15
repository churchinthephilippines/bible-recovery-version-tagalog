import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider, { SliderProps } from '@react-native-community/slider';
import { useTheme } from '@react-navigation/native';

const ThemedSlider = ({label, ...props}: SliderProps & { label: string }) => {
  const { colors } = useTheme(); // Access theme colors

  return (
    <View style={[styles.container]}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}: {props.value?.toFixed(0)}
      </Text>
      <Slider
        style={styles.slider}
        minimumTrackTintColor={colors.primary} // Use theme's primary color
        maximumTrackTintColor={colors.border} // Use theme's border color
        thumbTintColor={colors.primary}      // Match thumb to primary color
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  slider: {
    height: 40,
  },
});

export default ThemedSlider;