import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onClose: () => void;
}

export default function AlertModal({
  visible,
  title,
  message,
  buttons,
  onClose,
}: AlertModalProps) {
  const handleButtonPress = (button: AlertButton) => {
    // Validate button before processing
    if (!button || typeof button !== 'object') {
      console.warn('AlertModal: Invalid button object');
      onClose();
      return;
    }
    
    if (button.onPress && typeof button.onPress === 'function') {
      try {
        button.onPress();
      } catch (error) {
        console.error('AlertModal: Error executing button onPress:', error);
      }
    }
    onClose();
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return styles.destructiveButton;
      case 'cancel':
        return styles.cancelButton;
      default:
        return styles.defaultButton;
    }
  };

  const getButtonTextStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return styles.destructiveButtonText;
      case 'cancel':
        return styles.cancelButtonText;
      default:
        return styles.defaultButtonText;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => {
              // Validate button text
              const buttonText = button.text?.trim() || 'OK';
              
              return (
                <TouchableOpacity
                  key={`${buttonText}-${index}`}
                  style={[
                    styles.button,
                    getButtonStyle(button.style),
                    buttons.length === 1 && styles.singleButton,
                    index === 0 && buttons.length > 1 && styles.firstButton,
                    index === buttons.length - 1 && buttons.length > 1 && styles.lastButton,
                  ]}
                  onPress={() => handleButtonPress(button)}
                >
                  <Text style={[
                    styles.buttonText,
                    getButtonTextStyle(button.style)
                  ]}>
                    {buttonText}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    minWidth: Platform.OS === 'web' ? 300 : 280,
    maxWidth: Platform.OS === 'web' ? 400 : 320,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  singleButton: {
    borderRadius: 0,
  },
  firstButton: {
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  lastButton: {
    // No additional styles needed
  },
  defaultButton: {
    backgroundColor: 'transparent',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  destructiveButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FONTS.regular,
  },
  defaultButtonText: {
    color: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.secondary,
  },
  destructiveButtonText: {
    color: '#FF3B30',
  },
});