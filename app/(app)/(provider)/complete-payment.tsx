import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { DollarSign, CreditCard, Plus, Minus, Check } from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/theme';

export default function CompletePaymentScreen() {
  const { appointmentId } = useLocalSearchParams();
  
  const [baseAmount] = useState<number>(85);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [tipPercentage, setTipPercentage] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  
  const totalAmount = baseAmount + tipAmount;
  
  const handleTipPercentage = (percentage: number) => {
    const tip = Math.round(baseAmount * (percentage / 100));
    setTipAmount(tip);
    setTipPercentage(percentage);
    setCustomTip('');
  };
  
  const handleCustomTip = (value: string) => {
    const tip = parseFloat(value) || 0;
    setTipAmount(tip);
    setTipPercentage(0);
    setCustomTip(value);
  };
  
  const handleCompletePayment = () => {
    Alert.alert(
      'Payment Successful',
      `Payment of $${totalAmount.toFixed(2)} has been processed successfully.`,
      [
        {
          text: 'OK',
          onPress: () => {
            router.push('/(app)/(provider)/(tabs)/schedule');
          }
        }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={{ width: 50 }} />
      </View>
      
      {/* Service Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Service Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Haircut & Beard Trim</Text>
          <Text style={styles.summaryValue}>${baseAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration</Text>
          <Text style={styles.summaryValue}>45 min</Text>
        </View>
      </View>
      
      {/* Tip Selection */}
      <View style={styles.tipCard}>
        <Text style={styles.sectionTitle}>Add Tip</Text>
        
        <View style={styles.tipButtons}>
          <TouchableOpacity
            style={[styles.tipButton, tipPercentage === 15 && styles.tipButtonActive]}
            onPress={() => handleTipPercentage(15)}
          >
            <Text style={[styles.tipButtonText, tipPercentage === 15 && styles.tipButtonTextActive]}>
              15%
            </Text>
            <Text style={[styles.tipAmount, tipPercentage === 15 && styles.tipAmountActive]}>
              ${Math.round(baseAmount * 0.15)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tipButton, tipPercentage === 20 && styles.tipButtonActive]}
            onPress={() => handleTipPercentage(20)}
          >
            <Text style={[styles.tipButtonText, tipPercentage === 20 && styles.tipButtonTextActive]}>
              20%
            </Text>
            <Text style={[styles.tipAmount, tipPercentage === 20 && styles.tipAmountActive]}>
              ${Math.round(baseAmount * 0.20)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tipButton, tipPercentage === 25 && styles.tipButtonActive]}
            onPress={() => handleTipPercentage(25)}
          >
            <Text style={[styles.tipButtonText, tipPercentage === 25 && styles.tipButtonTextActive]}>
              25%
            </Text>
            <Text style={[styles.tipAmount, tipPercentage === 25 && styles.tipAmountActive]}>
              ${Math.round(baseAmount * 0.25)}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.customTipContainer}>
          <Text style={styles.customTipLabel}>Custom Amount</Text>
          <View style={styles.customTipInput}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.customTipField}
              value={customTip}
              onChangeText={handleCustomTip}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </View>
      
      {/* Payment Method */}
      <View style={styles.paymentMethodCard}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
          onPress={() => setPaymentMethod('card')}
        >
          <CreditCard size={24} color={paymentMethod === 'card' ? COLORS.primary : '#999'} />
          <Text style={[styles.paymentOptionText, paymentMethod === 'card' && styles.paymentOptionTextActive]}>
            Credit/Debit Card
          </Text>
          {paymentMethod === 'card' && <Check size={20} color={COLORS.primary} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
          onPress={() => setPaymentMethod('cash')}
        >
          <DollarSign size={24} color={paymentMethod === 'cash' ? COLORS.primary : '#999'} />
          <Text style={[styles.paymentOptionText, paymentMethod === 'cash' && styles.paymentOptionTextActive]}>
            Cash
          </Text>
          {paymentMethod === 'cash' && <Check size={20} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>
      
      {/* Total */}
      <View style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Service</Text>
          <Text style={styles.totalValue}>${baseAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tip</Text>
          <Text style={styles.totalValue}>${tipAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>${totalAmount.toFixed(2)}</Text>
        </View>
      </View>
      
      {/* Complete Button */}
      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleCompletePayment}
      >
        <Text style={styles.completeButtonText}>
          Charge ${totalAmount.toFixed(2)}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: FONTS.bold,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#999',
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  tipCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tipButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 4,
  },
  tipButtonTextActive: {
    color: '#000',
  },
  tipAmount: {
    fontSize: 14,
    color: '#666',
  },
  tipAmountActive: {
    color: '#000',
  },
  customTipContainer: {
    marginTop: 8,
  },
  customTipLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  customTipInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  currencySymbol: {
    fontSize: 16,
    color: COLORS.text,
    marginRight: 4,
  },
  customTipField: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: COLORS.text,
  },
  paymentMethodCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
  },
  paymentOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#999',
    marginLeft: 12,
  },
  paymentOptionTextActive: {
    color: COLORS.text,
  },
  totalCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#999',
  },
  totalValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});