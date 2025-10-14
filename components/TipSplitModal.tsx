import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { usePayments } from '@/providers/PaymentProvider';
import { X, Users, DollarSign, Check } from 'lucide-react-native';

interface TipSplitModalProps {
  visible: boolean;
  onClose: () => void;
  paymentId: string;
  totalTipAmount: number;
  providers: Array<{
    id: string;
    name: string;
    image?: string;
  }>;
}

export default function TipSplitModal({ visible, onClose, paymentId, totalTipAmount, providers }: TipSplitModalProps) {
  const { splitTip, isLoading } = usePayments();
  
  const [splits, setSplits] = useState<Record<string, string>>(
    providers.reduce((acc, provider) => ({
      ...acc,
      [provider.id]: (totalTipAmount / providers.length).toFixed(2)
    }), {})
  );

  const totalSplitAmount = useMemo(() => {
    return Object.values(splits).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
  }, [splits]);

  const isValidSplit = useMemo(() => {
    return Math.abs(totalSplitAmount - totalTipAmount) < 0.01;
  }, [totalSplitAmount, totalTipAmount]);

  const updateSplit = useCallback((providerId: string, amount: string) => {
    const cleanAmount = amount.replace(/[^0-9.]/g, '');
    const parts = cleanAmount.split('.');
    const normalized = parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : cleanAmount;
    
    setSplits(prev => ({
      ...prev,
      [providerId]: normalized
    }));
  }, []);

  const evenSplit = useCallback(() => {
    const evenAmount = (totalTipAmount / providers.length).toFixed(2);
    setSplits(providers.reduce((acc, provider) => ({
      ...acc,
      [provider.id]: evenAmount
    }), {}));
  }, [totalTipAmount, providers]);

  const handleSplitTip = useCallback(async () => {
    try {
      if (!isValidSplit) {
        Alert.alert('Invalid Split', 'Split amounts must equal the total tip amount.');
        return;
      }

      const splitData = providers.map(provider => ({
        providerId: provider.id,
        amount: parseFloat(splits[provider.id]) || 0
      }));

      await splitTip(paymentId, splitData);
      Alert.alert('Tip Split', 'The tip has been successfully split among providers.');
      onClose();
    } catch (error) {
      console.error('Error splitting tip:', error);
      Alert.alert('Error', 'Failed to split tip. Please try again.');
    }
  }, [isValidSplit, providers, splits, splitTip, paymentId, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Users color="#D4AF37" size={24} />
            <Text style={styles.headerTitle}>Split Tip</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Tip Amount</Text>
            <Text style={styles.summaryAmount}>${totalTipAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Split Between Providers</Text>
              <TouchableOpacity onPress={evenSplit} style={styles.evenSplitButton}>
                <Text style={styles.evenSplitText}>Even Split</Text>
              </TouchableOpacity>
            </View>

            {providers.map(provider => (
              <View key={provider.id} style={styles.providerRow}>
                <View style={styles.providerInfo}>
                  <View style={styles.providerAvatar}>
                    <Text style={styles.providerInitial}>{provider.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.providerName}>{provider.name}</Text>
                </View>
                <View style={styles.amountInputContainer}>
                  <DollarSign color="#666" size={16} />
                  <TextInput
                    style={styles.amountInput}
                    value={splits[provider.id]}
                    onChangeText={(text) => updateSplit(provider.id, text)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#666"
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.validationCard}>
            <View style={styles.validationRow}>
              <Text style={styles.validationLabel}>Total Split:</Text>
              <Text style={[styles.validationAmount, !isValidSplit && styles.validationAmountError]}>
                ${totalSplitAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.validationRow}>
              <Text style={styles.validationLabel}>Expected:</Text>
              <Text style={styles.validationAmount}>${totalTipAmount.toFixed(2)}</Text>
            </View>
            {!isValidSplit && (
              <Text style={styles.validationError}>
                Difference: ${Math.abs(totalSplitAmount - totalTipAmount).toFixed(2)}
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.splitButton, (!isValidSplit || isLoading) && styles.splitButtonDisabled]}
            onPress={handleSplitTip}
            disabled={!isValidSplit || isLoading}
          >
            <Check color={isValidSplit && !isLoading ? '#000' : '#666'} size={20} />
            <Text style={[styles.splitButtonText, (!isValidSplit || isLoading) && styles.splitButtonTextDisabled]}>
              {isLoading ? 'Splitting...' : 'Split Tip'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeButton: { padding: 4 },
  content: { padding: 20 },
  summaryCard: { backgroundColor: '#0b0b0b', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222', alignItems: 'center', marginBottom: 24 },
  summaryLabel: { color: '#666', fontSize: 14, marginBottom: 4 },
  summaryAmount: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  evenSplitButton: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  evenSplitText: { color: '#D4AF37', fontSize: 12, fontWeight: '600' },
  providerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  providerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  providerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D4AF37', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  providerInitial: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  providerName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, minWidth: 100 },
  amountInput: { color: '#fff', fontSize: 16, marginLeft: 4, flex: 1, textAlign: 'right' },
  validationCard: { backgroundColor: '#0b0b0b', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222' },
  validationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  validationLabel: { color: '#666', fontSize: 14 },
  validationAmount: { color: '#fff', fontSize: 16, fontWeight: '600' },
  validationAmountError: { color: '#ff4444' },
  validationError: { color: '#ff4444', fontSize: 12, textAlign: 'center', marginTop: 8 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#222' },
  splitButton: { backgroundColor: '#D4AF37', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  splitButtonDisabled: { backgroundColor: '#333' },
  splitButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  splitButtonTextDisabled: { color: '#666' },
});