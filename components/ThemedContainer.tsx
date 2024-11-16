import { StyleSheet, View } from "react-native"
import { ThemedView, ThemedViewProps } from "@/components/ThemedView"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import React from "react"
import { TINT_COLOR } from "@/constants/Colors"

export type ThemedContainerProps = ThemedViewProps & {
  header: React.ReactNode;
  headerBGColor?: string;
  children: React.ReactNode;
}

export function ThemedContainer({ header, headerBGColor = TINT_COLOR, children, style, ...props }: ThemedContainerProps) {
  const inset = useSafeAreaInsets()
  
  return (
    <ThemedView {...props} style={[styles.container, style]}>
      <View style={{ backgroundColor: headerBGColor, paddingTop: inset.top + 10, paddingBottom: 10 }}>
        {header}
      </View>
      <View style={styles.body}>
        {children}
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
})

export default ThemedContainer
