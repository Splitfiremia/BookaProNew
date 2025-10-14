import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding, SubscriptionPlan } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, Check, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubscriptionPlanSelection() {
  const router = useRouter();
  const { selectedPlanId, selectSubscriptionPlan, getSubscriptionPlans, nextStep } = useShopOwnerOnboarding();
  
  const plans = getSubscriptionPlans();
  // Auto-select the Professional plan since it's the only option
  const [selectedPlan, setSelectedPlan] = useState<string | null>(selectedPlanId || plans[0].id);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setError(null);
  };

  const handleNext = () => {
    // Since there's only one plan, we can always proceed
    selectSubscriptionPlan(selectedPlan || plans[0].id);
    nextStep();
    router.push('/shop-owner-onboarding/payment-information' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="subscription-back-button"
        >
          <ChevronLeft size={20} color={COLORS.lightGray} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Professional Plan</Text>
          <Text style={styles.subtitle}>
            Our professional plan offers everything you need for your business
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.selectedPlan
              ]}
              onPress={() => handleSelectPlan(plan.id)}
              activeOpacity={0.8}
              testID={`plan-${plan.id}`}
            >
              <View style={styles.planHeader}>
                <Text style={[
                  styles.planName,
                  selectedPlan === plan.id && styles.selectedText
                ]}>
                  {plan.name}
                </Text>
                <Text style={styles.planPrice}>
                  ${plan.price.toFixed(2)}<Text style={styles.planPeriod}>/month</Text>
                </Text>
              </View>
              
              <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Check size={16} color={COLORS.primary} style={styles.featureIcon} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              {selectedPlan === plan.id && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="subscription-next-button"
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  plansContainer: {
    marginBottom: SPACING.xl,
  },
  planCard: {
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.input.border,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedPlan: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundLight,
  },
  planHeader: {
    marginBottom: SPACING.md,
  },
  planName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  selectedText: {
    color: COLORS.primary,
  },
  planPrice: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  planPeriod: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'normal' as const,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  planFeatures: {
    marginTop: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureIcon: {
    marginRight: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  selectedBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  selectedBadgeText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold' as const,
    fontFamily: FONTS.bold,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.md,
    textAlign: 'center',
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