import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CreditCard, Smartphone } from 'lucide-react-native';
import { usePayments, PaymentMethod } from '@/providers/PaymentProvider';

interface StripePaymentSheetProps {
  amount: number;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: string) => void;
  reservationId?: string;
  disabled?: boolean;
}

export function StripePaymentSheet({
  amount,
  onPaymentSuccess,
  onPaymentError,
  reservationId,
  disabled = false
}: StripePaymentSheetProps) {
  const { paymentMethods, processStripePayment } = usePayments();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const defaultMethod = paymentMethods.find(pm => pm.isDefault);
    if (defaultMethod && !selectedMethod) {
      setSelectedMethod(defaultMethod.id);
    }
  }, [paymentMethods, selectedMethod]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      onPaymentError('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processStripePayment(amount, selectedMethod, reservationId);
      onPaymentSuccess(result);
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPaymentMethodDisplay = (method: PaymentMethod) => {
    if (method.type === 'applepay') return 'Apple Pay';
    if (method.type === 'googlepay') return 'Google Pay';
    if (method.type === 'cash') return 'Cash';
    return `${method.brand || method.type.toUpperCase()} •••• ${method.last4}`;
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'applepay' || method.type === 'googlepay') {
      return <Smartphone size={20} color="#666" />;
    }
    return <CreditCard size={20} color="#666" />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>
      
      <View style={styles.methodsContainer}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.selectedMethod
            ]}
            onPress={() => setSelectedMethod(method.id)}
            disabled={disabled}
          >
            <View style={styles.methodInfo}>
              {getPaymentMethodIcon(method)}
              <Text style={styles.methodText}>
                {formatPaymentMethodDisplay(method)}
              </Text>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            <View style={[
              styles.radioButton,
              selectedMethod === method.id && styles.radioSelected
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.payButton,
          (disabled || !selectedMethod || isProcessing) && styles.payButtonDisabled
        ]}
        onPress={handlePayment}
        disabled={disabled || !selectedMethod || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.payButtonText}>
            Pay ${amount.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  methodsContainer: {
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  methodText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  defaultBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  radioSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  payButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});