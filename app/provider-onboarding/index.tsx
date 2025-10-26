import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Animated,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding, WorkSituation } from '@/providers/ProviderOnboardingProvider';
import { Building2, Store, Car, Home, MapPin, Users } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Type definitions for better type safety
interface WorkOption {
  id: WorkSituation;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

interface NextStepInfo {
  icon: React.ComponentType<any>;
  text: string;
  route: string;
}

export default function ProviderOnboardingIntro() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    workSituation, 
    setWorkSituation, 
    nextStep,
    resetOnboarding 
  } = useProviderOnboarding();
  
  const [selected, setSelected] = useState<WorkSituation | null>(workSituation);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Memoized work options to prevent unnecessary re-renders
  const workOptions: WorkOption[] = React.useMemo(() => [
    {
      id: 'own_shop',
      title: 'Shop Owner',
      description: 'You own or rent a commercial space',
      icon: <Building2 size={28} color={COLORS.primary} />,
      features: ['Manage multiple stylists', 'Set booth rental rates', 'Full business control']
    },
    {
      id: 'work_at_shop',
      title: 'Shop Employee',
      description: 'You work at an established business',
      icon: <Store size={28} color={COLORS.primary} />,
      features: ['Join existing shop', 'Collaborate with team', 'Built-in client base']
    },
    {
      id: 'mobile',
      title: 'Mobile Provider',
      description: "You travel to clients' locations",
      icon: <Car size={28} color={COLORS.primary} />,
      features: ['Set service areas', 'Travel fee options', 'Flexible scheduling']
    },
    {
      id: 'home_studio',
      title: 'Home Studio',
      description: 'You work from your home space',
      icon: <Home size={28} color={COLORS.primary} />,
      features: ['Private appointments', 'Lower overhead', 'Personalized space']
    }
  ], []);

  // Animation refs with better performance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const navigationSlideAnim = useRef(new Animated.Value(30)).current;
  
  // Simplified option animations - only animate opacity and slight translation
  const optionAnimations = useRef(
    workOptions.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(10)
    }))
  ).current;

  // Animation cleanup
  useEffect(() => {
    return () => {
      // Clean up animations to prevent memory leaks
      [fadeAnim, slideAnim, headerSlideAnim, navigationSlideAnim].forEach(anim => {
        anim.stopAnimation();
      });
      optionAnimations.forEach(anim => {
        anim.opacity.stopAnimation();
        anim.translateY.stopAnimation();
      });
    };
  }, []);

  const startEntranceAnimation = useCallback(() => {
    try {
      setIsAnimating(true);
      setHasError(false);
      
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      headerSlideAnim.setValue(-20);
      navigationSlideAnim.setValue(30);
      
      optionAnimations.forEach(anim => {
        anim.opacity.setValue(0);
        anim.translateY.setValue(10);
      });

      // Simplified animation sequence for better performance
      const mainAnimation = Animated.parallel([
        // Header animation
        Animated.sequence([
          Animated.timing(headerSlideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        
        // Content slide in
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        
        // Options staggered animation
        Animated.stagger(100, 
          optionAnimations.map(anim => 
            Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateY, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              })
            ])
          )
        ),
        
        // Navigation slide in
        Animated.timing(navigationSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);

      mainAnimation.start(() => setIsAnimating(false));
    } catch (error) {
      console.error('Animation error:', error);
      setHasError(true);
      setIsAnimating(false);
    }
  }, [fadeAnim, slideAnim, headerSlideAnim, navigationSlideAnim, optionAnimations, workOptions.length]);

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      try {
        await resetOnboarding();
        startEntranceAnimation();
      } catch (error) {
        console.error('Initialization error:', error);
        setHasError(true);
      }
    };

    initialize();
  }, [resetOnboarding, startEntranceAnimation]);

  const handleSelect = useCallback((situation: WorkSituation) => {
    if (isAnimating) return;
    
    setSelected(situation);
    
    // Simple selection feedback
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isAnimating, fadeAnim]);

  const handleContinue = useCallback(async () => {
    if (!selected || isAnimating) return;
    
    try {
      setIsAnimating(true);
      await setWorkSituation(selected);
      
      // Simple exit animation
      const exitAnimation = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
      
      exitAnimation.start(() => {
        nextStep();
        
        // Route configuration with proper typing
        const routes: Record<WorkSituation, string> = {
          'own_shop': '/provider-onboarding/service-address',
          'work_at_shop': '/provider-onboarding/shop-search',
          'mobile': '/provider-onboarding/service-address',
          'home_studio': '/provider-onboarding/service-address'
        };
        
        const targetRoute = routes[selected];
        if (targetRoute) {
          router.replace(targetRoute);
        } else {
          // Fallback route
          router.replace('/provider-onboarding/service-address');
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to proceed. Please try again.');
      setIsAnimating(false);
    }
  }, [selected, isAnimating, setWorkSituation, nextStep, fadeAnim, slideAnim, router]);

  // Memoized next step info for better performance
  const getNextStepInfo = useCallback((situation: WorkSituation): NextStepInfo => {
    const info: Record<WorkSituation, NextStepInfo> = {
      'own_shop': { 
        icon: MapPin, 
        text: 'Next: Add your shop location',
        route: '/provider-onboarding/service-address'
      },
      'work_at_shop': { 
        icon: Users, 
        text: 'Next: Find your shop',
        route: '/provider-onboarding/shop-search'
      },
      'mobile': { 
        icon: Car, 
        text: 'Next: Set service areas',
        route: '/provider-onboarding/service-address'
      },
      'home_studio': { 
        icon: Home, 
        text: 'Next: Add your studio address',
        route: '/provider-onboarding/service-address'
      }
    };
    return info[situation] || { icon: MapPin, text: 'Next: Continue setup', route: '/provider-onboarding/service-address' };
  }, []);

  // Error state UI
  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>Please restart the app and try again.</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
              startEntranceAnimation();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
          accessible={true}
          accessibilityLabel="Provider onboarding work situation selection"
        >
          {/* Header Section */}
          <Animated.View 
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: headerSlideAnim }]
              }
            ]}
            accessibilityRole="header"
          >
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(currentStep / totalSteps) * 100}%` }
                  ]} 
                  accessibilityRole="progressbar"
                  accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
                />
              </View>
              <Text style={styles.progressText}>
                Step {currentStep} of {totalSteps}
              </Text>
            </View>
            
            <Text style={styles.question}>How do you work?</Text>
            <Text style={styles.description}>
              Choose your primary work style to customize your experience
            </Text>
          </Animated.View>

          {/* Options Grid */}
          <View style={styles.optionsContainer}>
            {workOptions.map((option, index) => {
              const NextStepIcon = getNextStepInfo(option.id).icon;
              const isSelected = selected === option.id;
              
              return (
                <Animated.View
                  key={option.id}
                  style={[
                    styles.animatedOptionContainer,
                    {
                      opacity: optionAnimations[index].opacity,
                      transform: [
                        { translateY: optionAnimations[index].translateY }
                      ]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      isSelected && styles.selectedCard
                    ]}
                    onPress={() => handleSelect(option.id)}
                    disabled={isAnimating}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${option.title}. ${option.description}. Features: ${option.features.join(', ')}`}
                    accessibilityHint={isSelected ? 'Selected. Double tap to continue' : 'Double tap to select this work style'}
                    testID={`work-option-${option.id}`}
                  >
                    <View style={[
                      styles.iconContainer,
                      isSelected && styles.selectedIconContainer
                    ]}>
                      {option.icon}
                    </View>
                    
                    <View style={styles.optionContent}>
                      <Text style={[
                        styles.optionTitle,
                        isSelected && styles.selectedOptionTitle
                      ]}>
                        {option.title}
                      </Text>
                      
                      <Text style={[
                        styles.optionDescription,
                        isSelected && styles.selectedOptionDescription
                      ]}>
                        {option.description}
                      </Text>
                      
                      <View style={styles.featuresContainer}>
                        {option.features.map((feature, featureIndex) => (
                          <View key={featureIndex} style={styles.featureItem}>
                            <View style={[
                              styles.featureDot,
                              isSelected && styles.selectedFeatureDot
                            ]} />
                            <Text style={[
                              styles.featureText,
                              isSelected && styles.selectedFeatureText
                            ]}>
                              {feature}
                            </Text>
                          </View>
                        ))}
                      </View>
                      
                      {isSelected && (
                        <View style={styles.nextStepInfo}>
                          <NextStepIcon size={16} color={COLORS.primary} />
                          <Text style={styles.nextStepText}>
                            {getNextStepInfo(option.id).text}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {isSelected && (
                      <View style={styles.selectionIndicator}>
                        <View style={styles.selectionDot} />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Navigation */}
        <Animated.View 
          style={[
            styles.animatedNavigationContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: navigationSlideAnim }]
            }
          ]}
          accessibilityRole="toolbar"
        >
          <OnboardingNavigation
            onNext={handleContinue}
            nextDisabled={!selected || isAnimating}
            showBack={false}
            nextTitle={selected ? "Continue" : "Select your work style"}
            loading={isAnimating}
            testID="work-situation-navigation"
            accessibilityLabel="Navigation for work situation selection"
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
    paddingBottom: SPACING.xl,
    minHeight: SCREEN_HEIGHT - 100, // Ensure proper scroll behavior
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: SPACING.xl,
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.glass.background,
    borderRadius: 2,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  question: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  optionsContainer: {
    marginBottom: SPACING.xl,
  },
  animatedOptionContainer: {
    marginBottom: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 140, // Consistent height
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.glass.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    transform: [{ scale: 1.1 }],
  },
  optionContent: {
    flex: 1,
    flexShrink: 1, // Prevent text overflow
  },
  optionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  selectedOptionTitle: {
    color: COLORS.primary,
  },
  optionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  selectedOptionDescription: {
    color: COLORS.text,
  },
  featuresContainer: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.lightGray,
  },
  selectedFeatureDot: {
    backgroundColor: COLORS.primary,
  },
  featureText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
    flexShrink: 1,
  },
  selectedFeatureText: {
    color: COLORS.text,
  },
  nextStepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  nextStepText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    flex: 1,
  },
  selectionIndicator: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  animatedNavigationContainer: {
    marginTop: 'auto',
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    minWidth: 150,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
});