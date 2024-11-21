import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { ThemedView } from "./ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ModalBottomProps {
  visible: boolean;
  onClose: () => void;
  backdrop?: boolean;
  children: React.ReactNode;
}

export function ModalBottom({ visible, onClose, backdrop = true, children }: ModalBottomProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if(!visible) return;
    
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height); // Get keyboard height
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => {
        setKeyboardHeight(0); // Reset keyboard height when keyboard is hidden
      }
    );

    // Clean up the listeners when the component is unmounted
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
      setKeyboardHeight(0);
    };
  }, [visible]);

  const content = (
    <View style={[styles.modalOverlay]}>
      <ThemedView colorName="card" style={[styles.modalContent, { paddingBottom: insets.bottom, bottom: keyboardHeight }]}>
        {/* Close Button */}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>
            <Ionicons name="close" size={35} color={colors.primary} />
          </Text>
        </TouchableOpacity>

        {/* Modal Content */}
        {children}
      </ThemedView>
    </View>
  )

  if(backdrop) {
    return (
      <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
        {content}
      </Modal>
    )
  }

  if (!visible) return null;
  
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.card,
      }}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    borderRadius: 20,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ModalBottom;
