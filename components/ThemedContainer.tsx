import { StyleSheet, View } from "react-native"
import { ThemedView, ThemedViewProps } from "@/components/ThemedView"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import React from "react"
import { TINT_COLOR } from "@/constants/Colors"

export type ThemedContainerProps = ThemedViewProps & {
  header: React.ReactNode;
  headerBGColor?: string;
  noPadding?: boolean;
  children: React.ReactNode;
}

export function ThemedContainer({ header, headerBGColor = TINT_COLOR, children, noPadding, style, ...props }: ThemedContainerProps) {
  const inset = useSafeAreaInsets()
  
  return (
    <ThemedView {...props} style={[styles.container, style]}>
      <View style={{ backgroundColor: headerBGColor, paddingTop: inset.top + 10, paddingBottom: 10 }}>
        {header}
      </View>
      <View style={[styles.body, noPadding ? { padding: 0 } : undefined]}>
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
    padding: 15,
  },
})

export default ThemedContainer
