import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OwnerInformation() {
  const router = useRouter();
  const { ownerFirstName, ownerLastName, ownerPhone, setOwnerInfo, nextStep } = useShopOwnerOnboarding();
  
  const [firstName, setFirstName] = useState(ownerFirstName);
  const [lastName, setLastName] = useState(ownerLastName);
  const [phone, setPhone] = useState(ownerPhone);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) newErrors.phone = 'Please enter a valid 10-digit phone number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setOwnerInfo(firstName, lastName, phone);
      nextStep();
      router.push('/shop-owner-onboarding/shop-type' as any);
    }
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
            testID="owner-info-back-button"
          >
            <ChevronLeft size={20} color={COLORS.lightGray} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>And who are you?</Text>
            <Text style={styles.subtitle}>
              This information is for your account and billing
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Your First Name</Text>
              <TextInput
                style={[styles.input, errors.firstName ? styles.inputError : null]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={COLORS.input.placeholder}
                testID="owner-first-name-input"
              />
              {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Your Last Name</Text>
              <TextInput
                style={[styles.input, errors.lastName ? styles.inputError : null]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={COLORS.input.placeholder}
                testID="owner-last-name-input"
              />
              {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Your Phone Number</Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                value={phone}
                onChangeText={setPhone}
                placeholder="(123) 456-7890"
                placeholderTextColor={COLORS.input.placeholder}
                keyboardType="phone-pad"
                testID="owner-phone-input"
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.8}
            testID="owner-info-next-button"
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
    marginBottom: SPACING.xl,
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
  form: {
    marginBottom: SPACING.lg,
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
  button: {
    ...GLASS_STYLES.button.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    marginRight: SPACING.sm,
    fontFamily: FONTS.bold,
  },
});