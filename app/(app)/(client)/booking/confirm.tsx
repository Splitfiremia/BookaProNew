import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, DollarSign, User, MapPin, CheckCircle, CreditCard, Timer, AlertCircle } from 'lucide-react-native';
import { usePayments } from '@/providers/PaymentProvider';
import { useReservationTimer } from '@/utils/reservationHooks';
import { getReservation } from '@/utils/bookingService';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, GLASS_STYLES } from '@/constants/theme';

export default function ConfirmBookingScreen() {
  const router = useRouter();
  const { providerId, serviceId, date, time, reservationId } = useLocalSearchParams<{ 
    providerId: string; 
    serviceId: string; 
    date: string;
    time: string;
    reservationId?: string;
  }>();
  
  const { 
    paymentMethods, 
    processPayment, 
    calculateTipSuggestions, 
    isLoading: paymentLoading,
    processStripePayment,
    releaseSlotReservation
  } = usePayments();
  
  const timer = useReservationTimer(reservationId || null);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedTipAmount, setSelectedTipAmount] = useState<number>(0);
  const [selectedTipPercentage, setSelectedTipPercentage] = useState<number>(0);
  const [customTipAmount, setCustomTipAmount] = useState<string>('');
  const [showCustomTip, setShowCustomTip] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Mock data - in real app, fetch based on IDs
  const servicePrice = 35;
  const taxAmount = 3.15;
  const subtotal = servicePrice;
  const totalAmount = subtotal + taxAmount + selectedTipAmount;
  
  const tipSuggestions = useMemo(() => {
    return calculateTipSuggestions(subtotal, providerId);
  }, [subtotal, providerId, calculateTipSuggestions]);
  
  // Set default payment method on load
  useEffect(() => {
    const defaultMethod = paymentMethods.find(pm => pm.isDefault);
    if (defaultMethod && !selectedPaymentMethod) {
      setSelectedPaymentMethod(defaultMethod.id);
    }
  }, [paymentMethods, selectedPaymentMethod]);
  
  // Handle reservation expiry
  useEffect(() => {
    if (timer.isExpired && reservationId) {
      Alert.alert(
        'Reservation Expired',
        'Your time slot reservation has expired. Please select a new time slot.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [timer.isExpired, reservationId, router]);
  
  const handleTipSelection = (percentage: number, amount: number) => {
    setSelectedTipPercentage(percentage);
    setSelectedTipAmount(amount);
    setShowCustomTip(false);
    setCustomTipAmount('');
  };
  
  const handleCustomTipChange = (value: string) => {
    setCustomTipAmount(value);
    const numValue = parseFloat(value) || 0;
    setSelectedTipAmount(numValue);
    setSelectedTipPercentage(0);
  };
  
  const handleConfirmBooking = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method.');
      return;
    }
    
    if (timer.isExpired && reservationId) {
      Alert.alert('Error', 'Your reservation has expired. Please book again.');
      return;
    }
    
    setIsProcessingPayment(true);
    setPaymentError(null);
    
    try {
      // Create a temporary appointment ID for payment processing
      const tempAppointmentId = `temp-${Date.now()}`;
      
      const tipType = selectedTipPercentage > 0 ? 'percentage' : 
                     selectedTipAmount > 0 ? 'custom' : 'none';
      
      await processPayment(
        tempAppointmentId,
        totalAmount,
        selectedTipAmount,
        selectedPaymentMethod,
        tipType,
        reservationId
      );
      
      Alert.alert(
        'Payment Successful!',
        'Your appointment has been confirmed. You will receive a confirmation email shortly.',
        [
          {
            text: 'View Appointments',
            onPress: () => router.push('/(app)/(client)/(tabs)/appointments'),
          },
        ]
      );
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancel = () => {
    if (reservationId) {
      releaseSlotReservation(reservationId);
    }
    router.back();
  };

  // Mock data - in real app, fetch based on IDs
  const providerName = 'John Smith';
  const serviceName = 'Haircut';
  const serviceDuration = '30 min';
  const providerAddress = '123 Main St, New York, NY 10001';
  
  const formatPaymentMethodDisplay = (method: any) => {
    if (method.type === 'applepay') return 'Apple Pay';
    if (method.type === 'googlepay') return 'Google Pay';
    if (method.type === 'cash') return 'Cash';
    return `${method.brand || method.type.toUpperCase()} •••• ${method.last4}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <CheckCircle size={48} color="#4CAF50" />
          <Text style={styles.title}>Confirm Your Booking</Text>
          <Text style={styles.subtitle}>Please review your appointment details</Text>
          
          {reservationId && (
            <View style={styles.timerContainer}>
              <Timer size={16} color={timer.timeRemaining < 60 ? "#FF6B6B" : "#666"} />
              <Text style={[styles.timerText, timer.timeRemaining < 60 && styles.timerUrgent]}>
                Time remaining: {timer.formatTime()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Provider</Text>
            <View style={styles.detailRow}>
              <User size={20} color="#666" />
              <Text style={styles.detailText}>{providerName}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={20} color="#666" />
              <Text style={styles.detailText}>{providerAddress}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.serviceLabel}>Service:</Text>
              <Text style={styles.detailText}>{serviceName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={20} color="#666" />
              <Text style={styles.detailText}>{serviceDuration}</Text>
            </View>
            <View style={styles.detailRow}>
              <DollarSign size={20} color="#666" />
              <Text style={styles.detailText}>${servicePrice.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appointment Time</Text>
            <View style={styles.detailRow}>
              <Calendar size={20} color="#666" />
              <Text style={styles.detailText}>{date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={20} color="#666" />
              <Text style={styles.detailText}>{time}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === method.id && styles.selectedPaymentMethod
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodInfo}>
                  <CreditCard size={20} color="#666" />
                  <Text style={styles.paymentMethodText}>
                    {formatPaymentMethodDisplay(method)}
                  </Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPaymentMethod === method.id && styles.radioButtonSelected
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Tip</Text>
            <View style={styles.tipContainer}>
              {tipSuggestions.suggestions.map((tip) => (
                <TouchableOpacity
                  key={tip.percentage}
                  style={[
                    styles.tipButton,
                    selectedTipPercentage === tip.percentage && styles.selectedTipButton
                  ]}
                  onPress={() => handleTipSelection(tip.percentage, tip.amount)}
                >
                  <Text style={[
                    styles.tipButtonText,
                    selectedTipPercentage === tip.percentage && styles.selectedTipButtonText
                  ]}>
                    {tip.label}
                  </Text>
                  <Text style={[
                    styles.tipAmountText,
                    selectedTipPercentage === tip.percentage && styles.selectedTipAmountText
                  ]}>
                    ${tip.amount}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {tipSuggestions.allowCustom && (
                <TouchableOpacity
                  style={[
                    styles.tipButton,
                    showCustomTip && styles.selectedTipButton
                  ]}
                  onPress={() => setShowCustomTip(!showCustomTip)}
                >
                  <Text style={[
                    styles.tipButtonText,
                    showCustomTip && styles.selectedTipButtonText
                  ]}>
                    Custom
                  </Text>
                </TouchableOpacity>
              )}
              
              {tipSuggestions.allowNoTip && (
                <TouchableOpacity
                  style={[
                    styles.tipButton,
                    selectedTipAmount === 0 && styles.selectedTipButton
                  ]}
                  onPress={() => handleTipSelection(0, 0)}
                >
                  <Text style={[
                    styles.tipButtonText,
                    selectedTipAmount === 0 && styles.selectedTipButtonText
                  ]}>
                    No Tip
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {showCustomTip && (
              <View style={styles.customTipContainer}>
                <Text style={styles.customTipLabel}>Custom tip amount:</Text>
                <TextInput
                  style={styles.customTipInput}
                  value={customTipAmount}
                  onChangeText={handleCustomTipChange}
                  placeholder="0.00"
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service</Text>
              <Text style={styles.paymentAmount}>${servicePrice.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tax</Text>
              <Text style={styles.paymentAmount}>${taxAmount.toFixed(2)}</Text>
            </View>
            {selectedTipAmount > 0 && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Tip</Text>
                <Text style={styles.paymentAmount}>${selectedTipAmount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>Cancellation Policy</Text>
            <Text style={styles.noteText}>
              Free cancellation up to 24 hours before your appointment. 
              Late cancellations may incur a fee.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {paymentError && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color="#FF6B6B" />
            <Text style={styles.errorText}>{paymentError}</Text>
          </View>
        )}
        
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isProcessingPayment}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (isProcessingPayment || !selectedPaymentMethod || timer.isExpired) && styles.disabledButton
            ]}
            onPress={handleConfirmBooking}
            disabled={isProcessingPayment || !selectedPaymentMethod || timer.isExpired}
          >
            {isProcessingPayment ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>
                Pay ${totalAmount.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timerUrgent: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  paymentMethodCard: {
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
  selectedPaymentMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentMethodText: {
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
  defaultBadgeText: {
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
  radioButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  tipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tipButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTipButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedTipButtonText: {
    color: '#fff',
  },
  tipAmountText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectedTipAmountText: {
    color: '#fff',
  },
  customTipContainer: {
    marginTop: 16,
  },
  customTipLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  customTipInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    flex: 1,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 12,
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  detailsContainer: {
    margin: 16,
    ...GLASS_STYLES.card,
    padding: 16,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 12,
    fontFamily: FONTS.bold,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailText: {
    fontSize: 14,
    color: COLORS.lightGray,
    flex: 1,
    fontFamily: FONTS.regular,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentAmount: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  noteContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    ...GLASS_STYLES.button.primary,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
});