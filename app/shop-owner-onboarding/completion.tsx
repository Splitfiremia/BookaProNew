import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding } from '@/providers/ShopOwnerOnboardingProvider';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, ArrowRight } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function ShopOwnerOnboardingCompletion() {
  const router = useRouter();
  const { completeOnboarding } = useShopOwnerOnboarding();
  const insets = useSafeAreaInsets();

  const handleComplete = () => {
    completeOnboarding();
    router.replace('/(app)/(shop-owner)/(tabs)/dashboard' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80' }}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={[
          styles.content,
          {
            paddingTop: SPACING.lg + insets.top,
            paddingBottom: SPACING.lg + insets.bottom
          }
        ]}>
          <View style={styles.header}>
            <View style={styles.successIcon}>
              <CheckCircle size={80} color={COLORS.success} />
            </View>
            <Text style={styles.title}>Welcome to the Platform!</Text>
            <Text style={styles.subtitle}>
              Your shop is now set up and ready to accept bookings. Let's get you started with your dashboard.
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureNumber}>✓</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Shop Profile Created</Text>
                <Text style={styles.featureDescription}>
                  Your business information is live
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureNumber}>✓</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Services Configured</Text>
                <Text style={styles.featureDescription}>
                  Your service menu is ready for bookings
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureNumber}>✓</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Payment Setup Complete</Text>
                <Text style={styles.featureDescription}>
                  Ready to process transactions
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleComplete}
            activeOpacity={0.8}
            testID="complete-onboarding-button"
          >
            <Text style={styles.buttonText}>Go to Dashboard</Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.lightGray,
    textAlign: 'center',
    maxWidth: '90%',
    fontFamily: FONTS.regular,
    lineHeight: 24,
  },
  featuresContainer: {
    marginVertical: SPACING.xxl,
  },
  featureItem: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  featureDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  button: {
    ...GLASS_STYLES.button.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    marginRight: SPACING.xs,
    fontFamily: FONTS.bold,
  },
});