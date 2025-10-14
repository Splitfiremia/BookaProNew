import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShopInformation() {
  const router = useRouter();
  const { shopName, shopPhone, shopEmail, shopAddress, shopCity, shopState, shopZip, setShopInfo, nextStep } = useShopOwnerOnboarding();
  
  const [name, setName] = useState(shopName);
  const [phone, setPhone] = useState(shopPhone);
  const [email, setEmail] = useState(shopEmail);
  const [address, setAddress] = useState(shopAddress);
  const [city, setCity] = useState(shopCity);
  const [state, setState] = useState(shopState);
  const [zip, setZip] = useState(shopZip);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Shop name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) newErrors.phone = 'Please enter a valid 10-digit phone number';
    
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';
    
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!zip.trim()) newErrors.zip = 'ZIP code is required';
    if (!/^\d{5}(-\d{4})?$/.test(zip)) newErrors.zip = 'Please enter a valid ZIP code';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setShopInfo(name, phone, email, address, city, state, zip);
      nextStep();
      router.push('/shop-owner-onboarding/owner-information' as any);
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
          testID="shop-info-back-button"
        >
          <ChevronLeft size={20} color={COLORS.lightGray} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Tell us about your business</Text>
          <Text style={styles.subtitle}>
            Let&apos;s start with the basic information about your shop
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Shop Name</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your shop name"
              placeholderTextColor={COLORS.input.placeholder}
              testID="shop-name-input"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Shop Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              value={phone}
              onChangeText={setPhone}
              placeholder="(123) 456-7890"
              placeholderTextColor={COLORS.input.placeholder}
              keyboardType="phone-pad"
              testID="shop-phone-input"
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Shop Email Address</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="shop@example.com"
              placeholderTextColor={COLORS.input.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="shop-email-input"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Shop Address</Text>
            <TextInput
              style={[styles.input, errors.address ? styles.inputError : null]}
              value={address}
              onChangeText={setAddress}
              placeholder="123 Main St"
              placeholderTextColor={COLORS.input.placeholder}
              testID="shop-address-input"
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.cityInput]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={[styles.input, errors.city ? styles.inputError : null]}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor={COLORS.input.placeholder}
                testID="shop-city-input"
              />
              {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
            </View>

            <View style={[styles.inputContainer, styles.stateInput]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={[styles.input, errors.state ? styles.inputError : null]}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor={COLORS.input.placeholder}
                maxLength={2}
                autoCapitalize="characters"
                testID="shop-state-input"
              />
              {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
            </View>

            <View style={[styles.inputContainer, styles.zipInput]}>
              <Text style={styles.label}>ZIP Code</Text>
              <TextInput
                style={[styles.input, errors.zip ? styles.inputError : null]}
                value={zip}
                onChangeText={setZip}
                placeholder="12345"
                placeholderTextColor={COLORS.input.placeholder}
                keyboardType="numeric"
                maxLength={10}
                testID="shop-zip-input"
              />
              {errors.zip ? <Text style={styles.errorText}>{errors.zip}</Text> : null}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="shop-info-next-button"
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cityInput: {
    flex: 3,
    marginRight: SPACING.md,
  },
  stateInput: {
    flex: 1,
    marginRight: SPACING.md,
  },
  zipInput: {
    flex: 2,
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