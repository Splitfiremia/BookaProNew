import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import { Plus, Trash2 } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

// Using the existing import for useProviderOnboarding

type ServiceFormData = {
  id: string;
  name: string;
  price: string;
  duration: string;
};

export default function ServicesScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    services,
    updateService: providerUpdateService,
    nextStep 
  } = useProviderOnboarding();

  const [servicesList, setServicesList] = useState<ServiceFormData[]>(
    services?.length ? services.map(s => ({
      id: s.id,
      name: s.name,
      price: s.price.toString(),
      duration: s.duration.toString()
    })) : [{ id: Date.now().toString(), name: '', price: '', duration: '' }]
  );

  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const servicesSlideAnim = useRef(new Animated.Value(50)).current;
  const navigationSlideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Staggered animation sequence
    const animations = Animated.stagger(120, [
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
      // Services animation
      Animated.timing(servicesSlideAnim, {
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
  }, [fadeAnim, slideAnim, headerSlideAnim, servicesSlideAnim, navigationSlideAnim]);

  const handleAddService = () => {
    setServicesList([
      ...servicesList,
      { id: Date.now().toString(), name: '', price: '', duration: '' }
    ]);
  };

  const handleRemoveService = (id: string) => {
    if (servicesList.length === 1) {
      // Don't remove the last service, just clear it
      setServicesList([{ id: Date.now().toString(), name: '', price: '', duration: '' }]);
      return;
    }
    setServicesList(servicesList.filter(service => service.id !== id));
  };

  const handleUpdateService = (id: string, field: keyof ServiceFormData, value: string) => {
    setServicesList(servicesList.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ));

    // Clear error when user types
    if (errors[id]?.[field]) {
      setErrors({
        ...errors,
        [id]: {
          ...errors[id],
          [field]: ''
        }
      });
    }
  };

  const validateServices = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let isValid = true;

    servicesList.forEach(service => {
      const serviceErrors: Record<string, string> = {};
      
      if (!service.name.trim()) {
        serviceErrors.name = 'Service name is required';
        isValid = false;
      }
      
      if (!service.price.trim()) {
        serviceErrors.price = 'Price is required';
        isValid = false;
      } else if (isNaN(parseFloat(service.price))) {
        serviceErrors.price = 'Price must be a number';
        isValid = false;
      }
      
      if (!service.duration.trim()) {
        serviceErrors.duration = 'Duration is required';
        isValid = false;
      } else if (isNaN(parseInt(service.duration, 10))) {
        serviceErrors.duration = 'Duration must be a number';
        isValid = false;
      }
      
      if (Object.keys(serviceErrors).length > 0) {
        newErrors[service.id] = serviceErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateServices()) {
      // Clear existing services and add new ones
      servicesList.forEach(service => {
        const formattedService = {
          id: service.id,
          name: service.name.trim(),
          price: parseFloat(service.price),
          duration: parseInt(service.duration, 10)
        };
        
        // Update existing service or add new one
        providerUpdateService(service.id, formattedService);
      });
      nextStep();
      router.replace('profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
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
            <Text style={styles.question}>Set your services and prices</Text>
            <Text style={styles.description}>
              Add the services you offer, their prices, and how long they take.
            </Text>

            <Animated.View style={[
              styles.servicesContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: servicesSlideAnim }]
              }
            ]}>
              {servicesList.map((service, index) => (
                <Animated.View 
                  key={service.id} 
                  style={[
                    styles.serviceCard,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: Animated.add(
                            servicesSlideAnim,
                            new Animated.Value(index * 15)
                          )
                        }
                      ]
                    }
                  ]}
                >
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceNumber}>Service {index + 1}</Text>
                    {servicesList.length > 1 && (
                      <TouchableOpacity 
                        onPress={() => handleRemoveService(service.id)}
                        style={styles.removeButton}
                        testID={`remove-service-${index}`}
                      >
                        <Trash2 size={20} color={COLORS.error} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>SERVICE NAME</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors[service.id]?.name ? styles.inputError : null
                      ]}
                      placeholder="e.g. Haircut, Beard Trim, etc."
                      placeholderTextColor="#666666"
                      value={service.name}
                      onChangeText={(value) => handleUpdateService(service.id, 'name', value)}
                      testID={`service-name-${index}`}
                    />
                    {errors[service.id]?.name ? (
                      <Text style={styles.errorText}>{errors[service.id].name}</Text>
                    ) : null}
                  </View>

                  <View style={styles.rowContainer}>
                    <View style={styles.halfInputContainer}>
                      <Text style={styles.inputLabel}>PRICE ($)</Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors[service.id]?.price ? styles.inputError : null
                        ]}
                        placeholder="0.00"
                        placeholderTextColor="#666666"
                        keyboardType="decimal-pad"
                        value={service.price}
                        onChangeText={(value) => handleUpdateService(service.id, 'price', value)}
                        testID={`service-price-${index}`}
                      />
                      {errors[service.id]?.price ? (
                        <Text style={styles.errorText}>{errors[service.id].price}</Text>
                      ) : null}
                    </View>

                    <View style={styles.halfInputContainer}>
                      <Text style={styles.inputLabel}>DURATION (MIN)</Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors[service.id]?.duration ? styles.inputError : null
                        ]}
                        placeholder="30"
                        placeholderTextColor="#666666"
                        keyboardType="number-pad"
                        value={service.duration}
                        onChangeText={(value) => handleUpdateService(service.id, 'duration', value)}
                        testID={`service-duration-${index}`}
                      />
                      {errors[service.id]?.duration ? (
                        <Text style={styles.errorText}>{errors[service.id].duration}</Text>
                      ) : null}
                    </View>
                  </View>
                </Animated.View>
              ))}

              <TouchableOpacity 
                style={styles.addServiceButton} 
                onPress={handleAddService}
                testID="add-service-button"
              >
                <Plus size={20} color={COLORS.primary} />
                <Text style={styles.addServiceText}>Add Another Service</Text>
              </TouchableOpacity>
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
              onBack={() => router.back()}
              onNext={handleContinue}
              testID="services-navigation"
            />
          </Animated.View>
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
  keyboardAvoidingView: {
    flex: 1,
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
  servicesContainer: {
    marginBottom: SPACING.xl,
  },
  serviceCard: {
    ...GLASS_STYLES.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  serviceNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
  },
  inputLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold' as const,
    color: COLORS.input.label,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  input: {
    ...GLASS_STYLES.input,
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}20`,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  addServiceText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
  animatedNavigationContainer: {
    // Container for animated navigation
  },
});