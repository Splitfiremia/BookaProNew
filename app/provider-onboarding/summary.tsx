import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated } from 'react-native';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useRouter } from 'expo-router';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding, ProviderService, TimeSlot } from '@/providers/ProviderOnboardingProvider';
import { Clock, DollarSign, User, Briefcase } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function SummaryScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps,
    providerType,
    firstName,
    lastName,
    workSituation,
    address,
    city,
    state,
    zip,
    travelRadius,
    shopId,
    shopName,
    services,
    profileImage,
    bio,
    availability,
    completeOnboarding,
    previousStep,
    isLoading
  } = useProviderOnboarding();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const summarySlideAnim = useRef(new Animated.Value(50)).current;
  const navigationSlideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Staggered animation sequence
    const animations = Animated.stagger(100, [
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
      // Summary animation
      Animated.timing(summarySlideAnim, {
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
  }, [fadeAnim, slideAnim, headerSlideAnim, summarySlideAnim, navigationSlideAnim]);

  const handleComplete = async () => {
    try {
      await completeOnboarding();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // In a real app, you would show an error message to the user
    }
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  const formatWorkSituation = (situation: string | null): string => {
    if (!situation) return '';
    
    switch (situation) {
      case 'own_shop': return 'I have my own shop/studio';
      case 'work_at_shop': return 'I work at a shop';
      case 'mobile': return 'I am mobile/I travel to clients';
      case 'home_studio': return 'I work from a home studio';
      default: return situation;
    }
  };

  const formatAddress = (): string => {
    if (workSituation === 'work_at_shop' && shopName) {
      return shopName;
    } else if (workSituation === 'mobile') {
      return `Travel radius: ${travelRadius} miles`;
    } else if (address) {
      return `${address}, ${city}, ${state} ${zip}`;
    }
    return '';
  };

  const formatTimeSlot = (slot: TimeSlot): string => {
    const formatTime = (time: string) => {
      const [hour] = time.split(':');
      const hourNum = parseInt(hour);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;
      return `${hour12}${period}`;
    };
    
    return `${formatTime(slot.start)} - ${formatTime(slot.end)}`;
  };

  const getDaysWithAvailability = () => {
    return Object.entries(availability)
      .filter(([_, slots]) => slots.length > 0)
      .map(([day, slots]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        slots
      }));
  };

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
          <Text style={styles.question}>Review your profile</Text>
          <Text style={styles.description}>
            Please review your information before completing your profile setup.
          </Text>

          <Animated.View style={[
            styles.summaryContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: summarySlideAnim }]
            }
          ]}>
            {/* Profile Section */}
            <Animated.View 
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: Animated.add(
                        summarySlideAnim,
                        new Animated.Value(0)
                      )
                    }
                  ]
                }
              ]}
            >
              <View style={styles.sectionHeader}>
                <User size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              
              <View style={styles.profileSection}>
                <ImageWithFallback
                  source={{ uri: profileImage || undefined }}
                  style={styles.profileImage}
                  fallbackIcon="user"
                />
                
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{firstName} {lastName}</Text>
                  <Text style={styles.profileType}>{providerType}</Text>
                  {bio ? (
                    <Text style={styles.profileBio} numberOfLines={2}>
                      {bio}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Animated.View>

            {/* Work Situation Section */}
            <Animated.View 
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: Animated.add(
                        summarySlideAnim,
                        new Animated.Value(10)
                      )
                    }
                  ]
                }
              ]}
            >
              <View style={styles.sectionHeader}>
                <Briefcase size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Work Information</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Work Situation:</Text>
                <Text style={styles.infoValue}>{formatWorkSituation(workSituation)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue}>{formatAddress()}</Text>
              </View>
            </Animated.View>

            {/* Services Section */}
            {services.length > 0 && (
              <Animated.View 
                style={[
                  styles.section,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: Animated.add(
                          summarySlideAnim,
                          new Animated.Value(20)
                        )
                      }
                    ]
                  }
                ]}
              >
                <View style={styles.sectionHeader}>
                  <DollarSign size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Services</Text>
                </View>
                
                {services.map((service: ProviderService) => (
                  <View key={service.id} style={styles.serviceItem}>
                    <View style={styles.serviceNamePrice}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.servicePrice}>${service.price.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* Availability Section */}
            <Animated.View 
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: Animated.add(
                        summarySlideAnim,
                        new Animated.Value(30)
                      )
                    }
                  ]
                }
              ]}
            >
              <View style={styles.sectionHeader}>
                <Clock size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Availability</Text>
              </View>
              
              {getDaysWithAvailability().length > 0 ? (
                getDaysWithAvailability().map(({ day, slots }) => (
                  <View key={day} style={styles.availabilityItem}>
                    <Text style={styles.availabilityDay}>{day}</Text>
                    <View style={styles.availabilitySlots}>
                      {slots.map((slot: TimeSlot, index: number) => (
                        <Text key={index} style={styles.availabilitySlot}>
                          {formatTimeSlot(slot)}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noAvailability}>No availability set</Text>
              )}
            </Animated.View>
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
            onNext={handleComplete}
            nextTitle="COMPLETE PROFILE"
            loading={isLoading}
            testID="summary-navigation"
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
  summaryContainer: {
    marginBottom: SPACING.xl,
  },
  section: {
    ...GLASS_STYLES.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: SPACING.md,
  },
  profileImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  profileImagePlaceholderText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  profileType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.regular,
  },
  profileBio: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    width: 120,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold' as const,
    color: COLORS.lightGray,
    fontFamily: FONTS.bold,
  },
  infoValue: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  serviceItem: {
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  serviceNamePrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  serviceName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  servicePrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  serviceDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  availabilityItem: {
    marginBottom: SPACING.sm,
  },
  availabilityDay: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  availabilitySlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  availabilitySlot: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    backgroundColor: COLORS.glass.background,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.xs,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.regular,
  },
  noAvailability: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontStyle: 'italic' as const,
    fontFamily: FONTS.regular,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
  editButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  editButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    textDecorationLine: 'underline' as const,
    fontFamily: FONTS.regular,
  },
  animatedNavigationContainer: {
    // Container for animated navigation
  },
});