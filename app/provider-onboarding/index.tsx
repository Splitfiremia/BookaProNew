import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Animated,
  StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding, WorkSituation } from '@/providers/ProviderOnboardingProvider';
import { Building2, Store, Car, Home, MapPin, Users } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

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
  
  const workOptions: { 
    id: WorkSituation; 
    title: string; 
    description: string; 
    icon: React.ReactNode;
    features: string[];
  }[] = [
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
  ];
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const optionsSlideAnim = useRef(new Animated.Value(50)).current;
  const navigationSlideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Individual option animations
  const optionAnimations = useRef(
    workOptions.map(() => ({
      scale: new Animated.Value(1),
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20)
    }))
  ).current;

  const startEntranceAnimation = useCallback(() => {
    setIsAnimating(true);
    
    // Reset all animations
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    headerSlideAnim.setValue(-20);
    optionsSlideAnim.setValue(50);
    navigationSlideAnim.setValue(30);
    scaleAnim.setValue(0.95);
    pulseAnim.setValue(1);
    
    optionAnimations.forEach(anim => {
      anim.scale.setValue(1);
      anim.opacity.setValue(0);
      anim.translateY.setValue(20);
    });

    // Staggered animation sequence
    const animations = Animated.stagger(100, [
      // Background and header animation
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
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      
      // Content animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      
      // Individual options animation (staggered)
      ...optionAnimations.map((anim, index) => 
        Animated.stagger(index * 80, [
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(anim.scale, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ])
        ])
      ),
      
      // Navigation animation
      Animated.parallel([
        Animated.timing(navigationSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(optionsSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animations.start(() => setIsAnimating(false));
  }, [fadeAnim, slideAnim, headerSlideAnim, optionsSlideAnim, navigationSlideAnim, scaleAnim, pulseAnim, optionAnimations]);

  useEffect(() => {
    resetOnboarding();
    startEntranceAnimation();
  }, [resetOnboarding, startEntranceAnimation]);

  const handleSelect = useCallback((situation: WorkSituation) => {
    if (isAnimating) return;
    
    setSelected(situation);
    
    // Selection feedback animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isAnimating, pulseAnim]);

  const handleContinue = useCallback(() => {
    if (!selected || isAnimating) return;
    
    setIsAnimating(true);
    setWorkSituation(selected);
    
    // Exit animation before navigation
    const exitAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);
    
    exitAnimation.start(() => {
      nextStep();
      
      // Route to the appropriate next screen based on selection
      const routes = {
        'own_shop': '/provider-onboarding/service-address',
        'work_at_shop': '/provider-onboarding/shop-search',
        'mobile': '/provider-onboarding/service-address',
        'home_studio': '/provider-onboarding/service-address'
      };
      
      router.replace(routes[selected] || '/provider-onboarding/service-address');
    });
  }, [selected, isAnimating, setWorkSituation, nextStep, fadeAnim, slideAnim, router]);

  const getNextStepInfo = useCallback((situation: WorkSituation) => {
    const info = {
      'own_shop': { icon: MapPin, text: 'Next: Add your shop location' },
      'work_at_shop': { icon: Users, text: 'Next: Find your shop' },
      'mobile': { icon: Car, text: 'Next: Set service areas' },
      'home_studio': { icon: Home, text: 'Next: Add your studio address' }
    };
    return info[situation] || { icon: MapPin, text: 'Next: Continue setup' };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          {/* Header Section */}
          <Animated.View style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: headerSlideAnim }]
            }
          ]}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
            </View>
            
            <Text style={styles.question}>How do you work?</Text>
            <Text style={styles.description}>
              Choose your primary work style to customize your experience
            </Text>
          </Animated.View>

          {/* Options Grid */}
          <Animated.View style={[
            styles.optionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: optionsSlideAnim }]
            }
          ]}>
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
                        { translateY: optionAnimations[index].translateY },
                        { scale: optionAnimations[index].scale }
                      ]
                    }
                  ]}
                >
                  <Animated.View
                    style={[
                      isSelected && {
                        transform: [{ scale: pulseAnim }]
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
                      activeOpacity={0.7}
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
                        <Animated.View 
                          style={[
                            styles.nextStepInfo,
                            {
                              opacity: pulseAnim,
                              transform: [{ scale: pulseAnim }]
                            }
                          ]}
                        >
                          <NextStepIcon size={16} color={COLORS.primary} />
                          <Text style={styles.nextStepText}>
                            {getNextStepInfo(option.id).text}
                          </Text>
                        </Animated.View>
                      )}
                    </View>
                    
                    {isSelected && (
                      <View style={styles.selectionIndicator}>
                        <View style={styles.selectionDot} />
                      </View>
                    )}
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              );
            })}
          </Animated.View>
        </Animated.View>

        {/* Navigation */}
        <Animated.View style={[
          styles.animatedNavigationContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: navigationSlideAnim }]
          }
        ]}>
          <OnboardingNavigation
            onNext={handleContinue}
            nextDisabled={!selected || isAnimating}
            showBack={false}
            nextTitle={selected ? "Continue" : "Select your work style"}
            loading={isAnimating}
            testID="work-situation-navigation"
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
});