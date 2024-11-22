import React from "react";
import { StyleSheet, Modal, View } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { ThemedButton } from "./ThemedButton";
import { useTheme } from "@react-navigation/native";
import { useSettingsStore } from "@/store/settings";

type ModalCenteredProps = {
  title: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalCentered({ title, visible, onClose, children }: ModalCenteredProps) {
  const { colors } = useTheme();
  const fontSize = useSettingsStore((state) => state.fontSize);
  const titleStyle = { fontSize: fontSize + 4, lineHeight: Math.max(fontSize * 1.5, 28) };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalCenteredStyles.modalBackground}>
        <ThemedView colorName="card" style={modalCenteredStyles.modalContainer}>
          <View style={[modalCenteredStyles.modalHeader, { borderBottomColor: colors.border }]}>
            <ThemedText style={[modalCenteredStyles.modalTitle, titleStyle]}>{title}</ThemedText>
          </View>
          <View style={modalCenteredStyles.modalBody}>
            {children}
          </View>
          <View style={[modalCenteredStyles.modalFooter, { borderTopColor: colors.border }]}>
            <ThemedButton title="Close" onPress={onClose} />
          </View>
        </ThemedView>
      </View>
    </Modal>
  )
}

export const modalCenteredStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    maxHeight: "80%",
    marginHorizontal: 15,
    paddingVertical: 20,
    borderRadius: 10,
  },
  modalHeader: {
    width: "100%",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  modalBody: {
    maxHeight: '80%',
  },
  modalFooter: {
    width: "100%",
    borderTopWidth: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
})