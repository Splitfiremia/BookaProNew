import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding, PaymentMethod } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, CreditCard, Lock, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentInformation() {
  const router = useRouter();
  const { setPaymentMethod, nextStep } = useShopOwnerOnboarding();
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Card number validation (16 digits)
    const cleanedCardNumber = cardNumber.replace(/\D/g, '');
    if (!cleanedCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cleanedCardNumber.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    // Expiry date validation (MM/YY format)
    const cleanedExpiry = expiryDate.replace(/\D/g, '');
    if (!cleanedExpiry) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (cleanedExpiry.length !== 4) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    } else {
      const month = parseInt(cleanedExpiry.substring(0, 2), 10);
      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Invalid month';
      }
    }
    
    // CVV validation (3-4 digits)
    if (!cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }
    
    // Cardholder name validation
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // In a real app, you would securely process the payment information
      // For this demo, we'll just create a mock payment method
      const paymentMethod: PaymentMethod = {
        id: `card-${Date.now()}`,
        type: 'credit_card',
        last4: cardNumber.replace(/\D/g, '').slice(-4),
        expiryDate: expiryDate,
        brand: getCardBrand(cardNumber)
      };
      
      setPaymentMethod(paymentMethod);
      nextStep();
      router.push('/shop-owner-onboarding/policies' as any);
    }
  };

  const getCardBrand = (cardNumber: string): string => {
    const cleanedNumber = cardNumber.replace(/\D/g, '');
    
    // Very basic card brand detection
    if (cleanedNumber.startsWith('4')) {
      return 'Visa';
    } else if (/^5[1-5]/.test(cleanedNumber)) {
      return 'Mastercard';
    } else if (/^3[47]/.test(cleanedNumber)) {
      return 'American Express';
    } else if (/^6(?:011|5)/.test(cleanedNumber)) {
      return 'Discover';
    }
    
    return 'Unknown';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="payment-back-button"
          >
            <ChevronLeft size={20} color={COLORS.lightGray} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Enter payment details</Text>
            <Text style={styles.subtitle}>
              Your subscription will begin after completing setup
            </Text>
          </View>

          <View style={styles.securityNote}>
            <Lock size={20} color={COLORS.primary} />
            <Text style={styles.securityText}>
              Your payment information is securely processed and encrypted
            </Text>
          </View>

        <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <CreditCard size={24} color={COLORS.primary} />
              <Text style={styles.cardHeaderText}>Credit Card</Text>
            </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={[styles.input, errors.cardNumber ? styles.inputError : null]}
                value={cardNumber}
                onChangeText={(value) => setCardNumber(formatCardNumber(value))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={COLORS.input.placeholder}
                keyboardType="number-pad"
                maxLength={19}
                testID="card-number-input"
              />
              {errors.cardNumber ? <Text style={styles.errorText}>{errors.cardNumber}</Text> : null}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.expiryInput]}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={[styles.input, errors.expiryDate ? styles.inputError : null]}
                  value={expiryDate}
                  onChangeText={(value) => setExpiryDate(formatExpiryDate(value))}
                  placeholder="MM/YY"
                  placeholderTextColor={COLORS.input.placeholder}
                  keyboardType="number-pad"
                  maxLength={5}
                  testID="expiry-date-input"
                />
                {errors.expiryDate ? <Text style={styles.errorText}>{errors.expiryDate}</Text> : null}
              </View>

              <View style={[styles.inputContainer, styles.cvvInput]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={[styles.input, errors.cvv ? styles.inputError : null]}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  placeholderTextColor={COLORS.input.placeholder}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  testID="cvv-input"
                />
                {errors.cvv ? <Text style={styles.errorText}>{errors.cvv}</Text> : null}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cardholder Name</Text>
              <TextInput
                style={[styles.input, errors.cardholderName ? styles.inputError : null]}
                value={cardholderName}
                onChangeText={setCardholderName}
                placeholder="John Doe"
                placeholderTextColor={COLORS.input.placeholder}
                testID="cardholder-name-input"
              />
              {errors.cardholderName ? <Text style={styles.errorText}>{errors.cardholderName}</Text> : null}
            </View>
          </View>
        </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.8}
            testID="payment-next-button"
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.regular,
  },
  header: {
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  securityNote: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  securityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
    fontFamily: FONTS.regular,
  },
  cardContainer: {
    ...GLASS_STYLES.card,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.input.border,
  },
  cardHeaderText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  form: {
    padding: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500' as const,
    color: COLORS.input.label,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.regular,
  },
  input: {
    ...GLASS_STYLES.input,
    backgroundColor: COLORS.input.background,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.input.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expiryInput: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cvvInput: {
    flex: 1,
  },
  button: {
    ...GLASS_STYLES.button.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    marginRight: SPACING.sm,
    fontFamily: FONTS.bold,
  },
});