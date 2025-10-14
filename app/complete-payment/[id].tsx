import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { usePayments } from '@/providers/PaymentProvider';
import { useAppointments } from '@/providers/AppointmentProvider';
import { CreditCard, Apple, Wallet, DollarSign, ArrowLeft, CheckCircle2, Mail, Heart, Star, Shield, Lock } from 'lucide-react-native';

const currency = (v: number) => `$${(v / 100).toFixed(2)}`;

export default function CompletePaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { payments, processPayment, requestPaymentForAppointment, calculateTipSuggestions, paymentMethods, generateReceipt, validatePaymentSecurity } = usePayments();
  const { appointments } = useAppointments();

  const existingPayment = useMemo(() => payments.find(p => p.appointmentId === String(id)), [payments, id]);
  const appointment = useMemo(() => appointments.find(a => a.id === String(id)), [appointments, id]);

  const subtotalCents = Math.round((existingPayment?.subtotal ?? appointment?.price ?? 0) * 100);
  const providerId = appointment?.providerId;

  const [selectedTipType, setSelectedTipType] = useState<'percentage' | 'custom' | 'none'>('percentage');
  const [selectedPct, setSelectedPct] = useState<number>(18);
  const [customCents, setCustomCents] = useState<number>(0);
  const [method, setMethod] = useState<'card' | 'apple' | 'google' | 'cash'>('card');
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  const [securityValidated, setSecurityValidated] = useState<boolean>(false);

  const tipSuggestions = useMemo(() => {
    if (subtotalCents <= 0) return { suggestions: [], allowCustom: true, allowNoTip: true, defaultPercentage: 18, thankYouMessage: undefined };
    return calculateTipSuggestions(subtotalCents / 100, providerId);
  }, [subtotalCents, providerId, calculateTipSuggestions]);

  useEffect(() => {
    if (tipSuggestions.defaultPercentage) {
      setSelectedPct(tipSuggestions.defaultPercentage);
    }
  }, [tipSuggestions.defaultPercentage]);

  const tipCents = useMemo(() => {
    if (selectedTipType === 'none') return 0;
    if (selectedTipType === 'custom') return customCents;
    return Math.round((subtotalCents * selectedPct) / 100);
  }, [selectedTipType, customCents, subtotalCents, selectedPct]);

  const totalCents = useMemo(() => subtotalCents + tipCents, [subtotalCents, tipCents]);

  const handleCustomChange = useCallback((text: string) => {
    const clean = text.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    const normalized = parts.length > 1 ? `${parts[0]}.${parts[1].slice(0,2)}` : clean;
    const value = Math.round(parseFloat(normalized || '0') * 100);
    setCustomCents(Number.isFinite(value) ? value : 0);
  }, []);

  const getPaymentMethodId = useCallback((): string => {
    if (method === 'card') {
      const defaultCard = paymentMethods.find(pm => pm.isDefault && pm.type !== 'applepay' && pm.type !== 'googlepay' && pm.type !== 'cash');
      return defaultCard?.id ?? paymentMethods.find(pm => pm.type !== 'applepay' && pm.type !== 'googlepay' && pm.type !== 'cash')?.id ?? 'pm1';
    }
    if (method === 'apple') return paymentMethods.find(pm => pm.type === 'applepay')?.id ?? 'pm2';
    if (method === 'google') return paymentMethods.find(pm => pm.type === 'googlepay')?.id ?? 'pm3';
    return paymentMethods.find(pm => pm.type === 'cash')?.id ?? 'pm4';
  }, [method, paymentMethods]);

  const onPay = useCallback(async () => {
    try {
      if (!id) return;
      setIsPaying(true);
      
      // Security validation
      const paymentData = {
        amount: totalCents / 100,
        tip: tipCents / 100,
        method: method,
        appointmentId: id,
      };
      
      await validatePaymentSecurity(paymentData);
      setSecurityValidated(true);
      
      const tip = tipCents / 100;
      const amt = totalCents / 100;
      const paymentId = getPaymentMethodId();
      
      await processPayment(String(id), amt, tip, paymentId, selectedTipType);
      
      if (tip > 0 && tipSuggestions.thankYouMessage) {
        setShowThankYou(true);
        setTimeout(() => {
          setShowThankYou(false);
          setCompleted(true);
        }, 2000);
      } else {
        setCompleted(true);
      }
    } catch (e) {
      console.error('[CompletePayment] Pay error', e);
      if (e instanceof Error && e.message.includes('fraud')) {
        Alert.alert('Security Alert', 'This transaction has been flagged for review. Please contact support if you believe this is an error.');
      } else {
        Alert.alert('Payment failed', 'Please try again.');
      }
    } finally {
      setIsPaying(false);
    }
  }, [id, processPayment, totalCents, tipCents, getPaymentMethodId, selectedTipType, tipSuggestions.thankYouMessage, method, validatePaymentSecurity]);

  const ensurePaymentRecord = useCallback(async () => {
    if (!id) return;
    if (!existingPayment) {
      try {
        await requestPaymentForAppointment(String(id));
      } catch (e) {
        console.log('Unable to pre-create payment record', e);
      }
    }
  }, [id, existingPayment, requestPaymentForAppointment]);

  React.useEffect(() => {
    ensurePaymentRecord();
  }, [ensurePaymentRecord]);

  const handleEmailReceipt = useCallback(async () => {
    try {
      if (!existingPayment) return;
      const receipt = await generateReceipt(existingPayment.id);
      Alert.alert('Receipt Sent', `A receipt has been emailed to you.\n\nTransaction ID: ${receipt.transactionId}`);
    } catch (e) {
      console.error('[CompletePayment] Receipt error', e);
      Alert.alert('Error', 'Unable to send receipt. Please try again.');
    }
  }, [existingPayment, generateReceipt]);

  if (showThankYou) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.thankYouContainer}>
          <View style={styles.thankYouContent}>
            <Heart color="#D4AF37" size={64} fill="#D4AF37" />
            <Text style={styles.thankYouTitle}>{tipSuggestions.thankYouMessage || 'Thank you!'}</Text>
            <Text style={styles.thankYouSubtitle}>Your payment is being processed...</Text>
            <View style={styles.sparkleContainer}>
              <Star color="#D4AF37" size={20} fill="#D4AF37" />
              <Star color="#D4AF37" size={16} fill="#D4AF37" />
              <Star color="#D4AF37" size={24} fill="#D4AF37" />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (completed) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back" testID="back-button">
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Confirmed</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.contentCentered}>
          <CheckCircle2 color="#22c55e" size={72} />
          <Text style={styles.thankText} testID="thank-you">Thank you for your payment!</Text>
          <Text style={styles.paidNote}>Total Paid {currency(totalCents)}</Text>
          <TouchableOpacity
            style={styles.emailButton}
            onPress={handleEmailReceipt}
            testID="email-receipt"
            accessibilityLabel="Email receipt"
          >
            <View style={styles.mailRow}>
              <Mail color="#000" size={18} />
              <Text style={[styles.payText, styles.mailTextSpacing]}>Email Receipt</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back" testID="back-button">
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard} testID="summary-card">
          <Text style={styles.summaryLabel}>Service Subtotal</Text>
          <Text style={styles.summaryValue}>{currency(subtotalCents)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a Tip</Text>
          <Text style={styles.sectionSubtitle}>Show your appreciation for great service</Text>
          <View style={styles.tipRow}>
            {tipSuggestions.suggestions.map(suggestion => (
              <TouchableOpacity
                key={`tip-${suggestion.percentage}`}
                style={[styles.tipButton, selectedTipType === 'percentage' && selectedPct === suggestion.percentage && styles.tipButtonActive]}
                onPress={() => { setSelectedTipType('percentage'); setSelectedPct(suggestion.percentage); }}
                testID={`tip-${suggestion.percentage}`}
              >
                <Text style={[styles.tipText, selectedTipType === 'percentage' && selectedPct === suggestion.percentage && styles.tipTextActive]}>{suggestion.label}</Text>
                <Text style={[styles.tipAmount, selectedTipType === 'percentage' && selectedPct === suggestion.percentage && styles.tipAmountActive]}>{currency(suggestion.amount * 100)}</Text>
              </TouchableOpacity>
            ))}
            {tipSuggestions.allowCustom && (
              <TouchableOpacity
                style={[styles.tipButton, selectedTipType === 'custom' && styles.tipButtonActive]}
                onPress={() => setSelectedTipType('custom')}
                testID="tip-custom"
              >
                <Text style={[styles.tipText, selectedTipType === 'custom' && styles.tipTextActive]}>Custom</Text>
              </TouchableOpacity>
            )}
            {tipSuggestions.allowNoTip && (
              <TouchableOpacity
                style={[styles.tipButton, selectedTipType === 'none' && styles.tipButtonActive]}
                onPress={() => setSelectedTipType('none')}
                testID="tip-none"
              >
                <Text style={[styles.tipText, selectedTipType === 'none' && styles.tipTextActive]}>No Tip</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedTipType === 'custom' && (
            <View style={styles.customRow}>
              <Text style={styles.customLabel}>Custom Amount</Text>
              <View style={styles.customInputWrap}>
                <Text style={styles.currency}>$</Text>
                <TextInput
                  style={styles.customInput}
                  keyboardType={Platform.OS === 'web' ? 'numeric' : 'decimal-pad'}
                  placeholder="0.00"
                  placeholderTextColor="#666"
                  onChangeText={handleCustomChange}
                  testID="custom-tip-input"
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.methodsRow}>
            <TouchableOpacity
              style={[styles.methodCard, method === 'card' && styles.methodCardActive]}
              onPress={() => setMethod('card')}
              testID="method-card"
            >
              <CreditCard color={method === 'card' ? '#000' : '#D4AF37'} size={24} />
              <View style={styles.methodInfo}>
                <Text style={[styles.methodText, method === 'card' && styles.methodTextActive]}>Card</Text>
                {paymentMethods.find(pm => pm.isDefault && pm.type !== 'applepay' && pm.type !== 'googlepay' && pm.type !== 'cash') && (
                  <Text style={[styles.methodSubtext, method === 'card' && styles.methodSubtextActive]}>•••• {paymentMethods.find(pm => pm.isDefault)?.last4}</Text>
                )}
              </View>
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.methodCard, method === 'apple' && styles.methodCardActive]}
                onPress={() => setMethod('apple')}
                testID="method-apple"
              >
                <Apple color={method === 'apple' ? '#000' : '#D4AF37'} size={24} />
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodText, method === 'apple' && styles.methodTextActive]}>Apple Pay</Text>
                  <Text style={[styles.methodSubtext, method === 'apple' && styles.methodSubtextActive]}>Touch ID</Text>
                </View>
              </TouchableOpacity>
            )}
            {Platform.OS === 'android' && (
              <TouchableOpacity
                style={[styles.methodCard, method === 'google' && styles.methodCardActive]}
                onPress={() => setMethod('google')}
                testID="method-google"
              >
                <Wallet color={method === 'google' ? '#000' : '#D4AF37'} size={24} />
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodText, method === 'google' && styles.methodTextActive]}>Google Pay</Text>
                  <Text style={[styles.methodSubtext, method === 'google' && styles.methodSubtextActive]}>Fingerprint</Text>
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.methodCard, method === 'cash' && styles.methodCardActive]}
              onPress={() => setMethod('cash')}
              testID="method-cash"
            >
              <DollarSign color={method === 'cash' ? '#000' : '#D4AF37'} size={24} />
              <View style={styles.methodInfo}>
                <Text style={[styles.methodText, method === 'cash' && styles.methodTextActive]}>Cash</Text>
                <Text style={[styles.methodSubtext, method === 'cash' && styles.methodSubtextActive]}>Pay in person</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Tip</Text>
            <Text style={styles.totalValue}>{currency(tipCents)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>{currency(totalCents)}</Text>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Shield size={16} color="#10B981" />
          <Text style={styles.securityText}>PCI-DSS Level 1 Compliant • 256-bit SSL Encryption</Text>
          <Lock size={16} color="#10B981" />
        </View>

        <TouchableOpacity
          style={[styles.payButton, isPaying && styles.payButtonDisabled]}
          onPress={onPay}
          disabled={isPaying || subtotalCents <= 0}
          testID="pay-button"
          accessibilityLabel={`Pay ${currency(totalCents)}`}
        >
          <Text style={styles.payText}>{isPaying ? 'Processing...' : `Pay ${currency(totalCents)}`}</Text>
        </TouchableOpacity>

        <Text style={styles.linkText} selectable>
          Link to share: {`${Platform.select({ web: window.location.origin, default: 'bookerpro.app' })}/complete-payment/${id}`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  headerSpacer: { width: 24 },
  content: { padding: 20 },
  contentCentered: { padding: 20, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  summaryCard: { backgroundColor: '#0b0b0b', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryLabel: { color: '#999', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  section: { marginTop: 8, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12, letterSpacing: 1 },
  tipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tipButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: '#333', backgroundColor: '#141414' },
  tipButtonActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  tipText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tipTextActive: { color: '#000' },
  customRow: { marginTop: 12 },
  customLabel: { color: '#999', marginBottom: 8 },
  customInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, height: 48 },
  currency: { color: '#666', fontSize: 18, marginRight: 6 },
  customInput: { flex: 1, color: '#fff', fontSize: 18 },
  methodsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  methodCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#141414', borderWidth: 1, borderColor: '#333', borderRadius: 12, flex: 1, minHeight: 60 },
  methodCardActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  methodText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  methodTextActive: { color: '#000' },
  totalsCard: { marginTop: 8, backgroundColor: '#0b0b0b', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  totalLabel: { color: '#aaa', fontSize: 14 },
  totalValue: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#222', marginVertical: 8 },
  grandLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  grandValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  payButton: { marginTop: 16, backgroundColor: '#D4AF37', borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 56 },
  payButtonDisabled: { opacity: 0.7 },
  payText: { color: '#000', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  linkText: { color: '#666', marginTop: 16, textAlign: 'center' },
  thankText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  paidNote: { color: '#aaa', marginTop: 8 },
  emailButton: { marginTop: 24, backgroundColor: '#D4AF37', borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 56, paddingHorizontal: 16 },
  mailRow: { flexDirection: 'row', alignItems: 'center' },
  mailTextSpacing: { marginLeft: 8 },
  sectionSubtitle: { color: '#666', fontSize: 12, marginBottom: 12, marginTop: -4 },
  tipAmount: { color: '#666', fontSize: 12, marginTop: 2 },
  tipAmountActive: { color: '#000' },
  methodInfo: { marginLeft: 8, flex: 1 },
  methodSubtext: { color: '#666', fontSize: 12, marginTop: 2 },
  methodSubtextActive: { color: '#000' },
  thankYouContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  thankYouContent: { alignItems: 'center', paddingHorizontal: 40 },
  thankYouTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 24 },
  thankYouSubtitle: { color: '#666', fontSize: 16, textAlign: 'center', marginTop: 8 },
  sparkleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  securityText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
  },
});
