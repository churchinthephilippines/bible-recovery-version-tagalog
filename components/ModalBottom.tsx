import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ThemedView } from "./ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

interface ModalBottomProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalBottom({ visible, onClose, children }: ModalBottomProps) {
  const { colors } = useTheme();

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
      <View style={[styles.modalOverlay]}>
        <ThemedView colorName="card" style={[styles.modalContent]}>
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
    backgroundColor: '#f0f0f0',
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
