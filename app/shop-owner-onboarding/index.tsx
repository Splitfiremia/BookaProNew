import { StyleSheet, View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding } from '@/providers/ShopOwnerOnboardingProvider';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function ShopOwnerOnboardingStart() {
  const router = useRouter();
  const { resetOnboarding } = useShopOwnerOnboarding();
  const insets = useSafeAreaInsets();

  const handleStart = () => {
    // Reset the onboarding state to ensure a fresh start
    resetOnboarding();
    // Navigate to the first step
    router.push('/shop-owner-onboarding/shop-information' as any);
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
          } as const
        ]}>

          <View style={styles.header}>
            <Text style={styles.title}>Set Up Your Shop</Text>
            <Text style={styles.subtitle}>
              Let&apos;s get your business ready to accept bookings
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoNumber}>1</Text>
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Business Details</Text>
                <Text style={styles.infoDescription}>
                  Tell us about your shop and services
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoNumber}>2</Text>
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Service Menu</Text>
                <Text style={styles.infoDescription}>
                  Set up your services and pricing
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoNumber}>3</Text>
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Team Management</Text>
                <Text style={styles.infoDescription}>
                  Invite your providers to join
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleStart}
              activeOpacity={0.8}
              testID="start-shop-onboarding-button"
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              testID="back-button"
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
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
    marginTop: SPACING.xxl,
    alignItems: 'center',
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
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
    maxWidth: '80%',
    fontFamily: FONTS.regular,
  },
  infoContainer: {
    marginVertical: SPACING.xxl,
  },
  infoItem: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  infoDescription: {
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
  buttonContainer: {
    gap: SPACING.md,
  },
  backButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
});