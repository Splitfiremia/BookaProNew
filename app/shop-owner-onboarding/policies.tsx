import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, Info, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Policies() {
  const router = useRouter();
  const { cancellationPolicy, setCancellationPolicy, nextStep } = useShopOwnerOnboarding();
  
  const [policy, setPolicy] = useState(cancellationPolicy);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!policy.trim()) {
      setError('Please enter a cancellation policy');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setCancellationPolicy(policy);
      nextStep();
      router.push('/shop-owner-onboarding/completion' as any);
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
            testID="policies-back-button"
          >
            <ChevronLeft size={20} color={COLORS.lightGray} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Set your shop policies</Text>
            <Text style={styles.subtitle}>
              Define your cancellation policy and other important rules
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Info size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Clear policies help set expectations and reduce misunderstandings with clients.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cancellation Policy</Text>
              <Text style={styles.inputHelper}>
                Example: &quot;24-hour notice required for cancellations. Late cancellations may be charged 50% of the service fee.&quot;
              </Text>
              <TextInput
                style={[styles.textArea, error ? styles.inputError : null]}
                value={policy}
                onChangeText={setPolicy}
                placeholder="Enter your cancellation policy"
                placeholderTextColor={COLORS.input.placeholder}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                testID="cancellation-policy-input"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.8}
            testID="policies-next-button"
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
  infoBox: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
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
  inputHelper: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    marginBottom: SPACING.sm,
    fontStyle: 'italic' as const,
    fontFamily: FONTS.regular,
  },
  textArea: {
    ...GLASS_STYLES.input,
    backgroundColor: COLORS.input.background,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.input.border,
    minHeight: 150,
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
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    marginRight: SPACING.sm,
    fontFamily: FONTS.bold,
  },
});