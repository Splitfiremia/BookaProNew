import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 600,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    // Use type-safe navigation with proper error handling
    try {
      console.log('WelcomeScreen: Navigating to search');
      router.push('/client-onboarding/search');
    } catch (error) {
      console.error('WelcomeScreen: Navigation failed', error);
      // Fallback navigation
      router.push('/(client)/search');
    }
  };

  const handleEnterCode = () => {
    console.log('WelcomeScreen: Enter code pressed');
    // TODO: Implement enter code functionality
    // router.push('/client-onboarding/enter-code');
  };

  // Fallback background color if image fails to load
  const backgroundFallback = { uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80' };

  return (
    <View style={styles.root} testID="client-onboarding-welcome-root">
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent 
      />

      <ImageBackground
        source={backgroundFallback}
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={(error) => console.warn('WelcomeScreen: Background image failed to load', error)}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.content}>
              {/* Header Section */}
              <Animated.View 
                style={[
                  styles.header,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <Text style={styles.appName}>BookerPro</Text>
              </Animated.View>

              {/* Main Content Section */}
              <Animated.View 
                style={[
                  styles.textContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { scale: scaleAnim },
                      { translateY: slideUpAnim },
                    ],
                  },
                ]}
              >
                <View style={styles.glassTitle}>
                  <Text style={styles.title}>SECURE YOUR</Text>
                  <Text style={styles.title}>APPOINTMENT</Text>
                </View>
                <Text style={styles.subtitle}>
                  Book beauty and wellness services with trusted professionals
                </Text>
              </Animated.View>

              {/* Action Buttons Section */}
              <Animated.View 
                style={[
                  styles.buttonContainer,
                  {
                    opacity: buttonFadeAnim,
                    transform: [{ translateY: slideUpAnim }],
                  },
                ]}
              >
                <TouchableOpacity 
                  style={styles.getStartedButton}
                  onPress={handleGetStarted}
                  activeOpacity={0.8}
                  testID="welcome-get-started"
                  accessibilityLabel="Get started finding services"
                  accessibilityRole="button"
                >
                  <Text style={styles.getStartedButtonText}>GET STARTED</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.enterCodeButton}
                  onPress={handleEnterCode}
                  activeOpacity={0.7}
                  testID="welcome-enter-code"
                  accessibilityLabel="Enter referral code"
                  accessibilityRole="button"
                >
                  <Text style={styles.enterCodeButtonText}>HAVE A CODE?</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Footer Section */}
              <Animated.View 
                style={[
                  styles.footer,
                  { opacity: buttonFadeAnim },
                ]}
              >
                <Text style={styles.footerText}>
                  Already have an account?{' '}
                  <Text 
                    style={styles.loginLink}
                    onPress={() => router.push('/(auth)/sign-in')}
                    accessibilityRole="link"
                  >
                    Sign In
                  </Text>
                </Text>
              </Animated.View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Enhanced overlay for better text readability
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: FONTS.bold,
    letterSpacing: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  glassTitle: {
    ...GLASS_STYLES.card,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: 2,
    fontFamily: FONTS.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: FONTS.regular,
    marginTop: SPACING.md,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  getStartedButton: {
    ...GLASS_STYLES.button.primary,
    paddingVertical: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 1.5,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  enterCodeButton: {
    ...GLASS_STYLES.button.secondary,
    paddingVertical: SPACING.lg,
    borderColor: COLORS.white,
    borderWidth: 2,
  },
  enterCodeButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 1.5,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontFamily: FONTS.regular,
    opacity: 0.8,
  },
  loginLink: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    textDecorationLine: 'underline',
  },
});