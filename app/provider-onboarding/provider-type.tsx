import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding, ProviderType } from '@/providers/ProviderOnboardingProvider';
import { Scissors, Brush, Palette, Zap, HelpCircle } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function ProviderTypeScreen() {
  const router = useRouter();
  const { currentStep, totalSteps, providerType, setProviderType, nextStep, previousStep } = useProviderOnboarding();
  const [selectedType, setSelectedType] = useState<ProviderType | null>(providerType);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const optionsSlideAnim = useRef(new Animated.Value(50)).current;
  const navigationSlideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Staggered animation sequence
    const animations = Animated.stagger(150, [
      // Header animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(headerSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Content animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      // Options animation
      Animated.timing(optionsSlideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      // Navigation animation
      Animated.timing(navigationSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);
    
    animations.start();
    
    return () => {
      animations.stop();
    };
  }, [fadeAnim, slideAnim, headerSlideAnim, optionsSlideAnim, navigationSlideAnim]);

  const handleTypeSelect = (type: ProviderType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      setProviderType(selectedType);
      nextStep();
      router.push('/provider-onboarding/personal-info');
    }
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  const providerTypes: { type: ProviderType; icon: React.ReactNode; description: string }[] = [
    { 
      type: 'Barber', 
      icon: <Scissors size={24} color={COLORS.primary} />, 
      description: 'Haircuts, beard trims, shaves, and styling'
    },
    { 
      type: 'Hair Stylist', 
      icon: <Brush size={24} color={COLORS.primary} />, 
      description: 'Cuts, coloring, styling, and treatments'
    },
    { 
      type: 'Nail Technician', 
      icon: <Palette size={24} color={COLORS.primary} />, 
      description: 'Manicures, pedicures, and nail art'
    },
    { 
      type: 'Tattoo Artist', 
      icon: <Zap size={24} color={COLORS.primary} />, 
      description: 'Custom tattoos and body art'
    },
    { 
      type: 'Other', 
      icon: <HelpCircle size={24} color={COLORS.primary} />, 
      description: 'Other beauty or wellness services'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: headerSlideAnim }]
          }
        ]}>
          <Text style={styles.title}>GET STARTED</Text>

        </Animated.View>

        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <Text style={styles.question}>What type of services do you provide?</Text>
          <Text style={styles.description}>Select the category that best describes your expertise.</Text>

          <Animated.View style={[
            styles.optionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: optionsSlideAnim }]
            }
          ]}>
            {providerTypes.map((item, index) => (
              <Animated.View
                key={item.type}
                style={[
                  styles.animatedOptionContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: Animated.add(
                          optionsSlideAnim,
                          new Animated.Value(index * 10)
                        )
                      }
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    selectedType === item.type && styles.selectedCard
                  ]}
                  onPress={() => handleTypeSelect(item.type)}
                  testID={`provider-type-${item.type}`}
                >
                  <View style={styles.iconContainer}>{item.icon}</View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{item.type}</Text>
                    <Text style={styles.optionDescription}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        </Animated.View>

        <Animated.View style={[
          styles.animatedNavigationContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: navigationSlideAnim }]
          }
        ]}>
          <OnboardingNavigation
            onBack={handleBack}
            onNext={handleContinue}
            nextDisabled={!selectedType}
            testID="provider-type-navigation"
          />
        </Animated.View>
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
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  content: {
    flex: 1,
  },
  question: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginBottom: SPACING.xl,
    fontFamily: FONTS.regular,
  },
  optionsContainer: {
    marginBottom: SPACING.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.glass.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  optionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
  animatedOptionContainer: {
    // Container for animated option cards
  },
  animatedNavigationContainer: {
    // Container for animated navigation
  },
});