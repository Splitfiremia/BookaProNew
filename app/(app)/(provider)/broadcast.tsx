import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '@/constants/theme';
import { router } from 'expo-router';

export default function BroadcastScreen() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const MAX_LENGTH = 1000;
  
  const handleSend = () => {
    if (!message.trim()) {
      // Validate input before proceeding
      Alert.alert('Error', 'Please enter a message to send.');
      return;
    }
    
    // Prevent multiple submissions
    if (isSending) return;
    
    setIsSending(true);
    
    // Simulate sending the message
    setTimeout(() => {
      setIsSending(false);
      
      // Show success message and navigate back
      Alert.alert(
        'Success', 
        'Your message has been sent to all clients.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1500);
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>CANCEL</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>CLIENT BROADCAST</Text>
        
        <TouchableOpacity 
          onPress={handleSend}
          disabled={isSending || !message.trim()}
        >
          <Text style={[styles.sendButton, (!message.trim() || isSending) && styles.disabledButton]}>
            {isSending ? 'SENDING...' : 'SEND'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          multiline
          value={message}
          onChangeText={setMessage}
          maxLength={MAX_LENGTH}
          editable={!isSending}
          testID="broadcast-message-input"
        />
        <Text style={styles.charCount}>{message.length}/{MAX_LENGTH}</Text>
      </View>
      
      {/* Info Text */}
      <Text style={styles.infoText}>
        This message will be sent to all of your clients.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  cancelButton: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  sendButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  inputContainer: {
    margin: 20,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
  },
  input: {
    color: COLORS.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    color: COLORS.text,
    opacity: 0.7,
    fontSize: 14,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});