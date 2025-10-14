import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { CustomSlider } from '@/components/CustomSlider';
import { useRouter } from 'expo-router';

import { FormInput } from '@/components/FormInput';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';

export default function ServiceAddressScreen() {
  const router = useRouter();
  const { 
    workSituation,
    address,
    city,
    state,
    zip,
    travelRadius,
    setAddress,
    setTravelRadius,
    nextStep 
  } = useProviderOnboarding();

  const [formData, setFormData] = useState({
    address: address || '',
    city: city || '',
    state: state || '',
    zip: zip || '',
  });

  const [radius, setRadius] = useState(travelRadius || 10);
  
  const [errors, setErrors] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const formSlideAnim = useRef(new Animated.Value(40)).current;
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
      // Form animation
      Animated.timing(formSlideAnim, {
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
  }, [fadeAnim, slideAnim, headerSlideAnim, formSlideAnim, navigationSlideAnim]);

  const [touched, setTouched] = useState({
    address: false,
    city: false,
    state: false,
    zip: false,
  });

  // Determine if we need to show address fields based on work situation
  const showAddressFields = workSituation === 'own_shop' || workSituation === 'home_studio';
  const showTravelRadius = workSituation === 'mobile';
  
  // Set screen title based on work situation
  const getScreenTitle = () => {
    switch (workSituation) {
      case 'own_shop':
        return 'Where is your shop located?';
      case 'home_studio':
        return 'Where is your home studio located?';
      case 'mobile':
        return 'What is your service area?';
      default:
        return 'Where do you provide your services?';
    }
  };

  const getScreenDescription = () => {
    switch (workSituation) {
      case 'own_shop':
        return 'Enter the address of your shop or studio.';
      case 'home_studio':
        return 'Your address will only be shared with confirmed clients.';
      case 'mobile':
        return "Set the maximum distance you're willing to travel to clients.";
      default:
        return 'Let us know where you provide your services.';
    }
  };

  const validateForm = () => {
    if (showTravelRadius) {
      return true; // No validation needed for travel radius
    }
    
    if (showAddressFields) {
      const newErrors = {
        address: formData.address.trim() ? '' : 'Address is required',
        city: formData.city.trim() ? '' : 'City is required',
        state: formData.state.trim() ? '' : 'State is required',
        zip: formData.zip.trim() ? '' : 'ZIP code is required',
      };

      setErrors(newErrors);
      return !Object.values(newErrors).some(error => error);
    }
    
    return true;
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field that was blurred
    if (field === 'address') {
      setErrors(prev => ({ 
        ...prev, 
        address: formData.address.trim() ? '' : 'Address is required' 
      }));
    } else if (field === 'city') {
      setErrors(prev => ({ 
        ...prev, 
        city: formData.city.trim() ? '' : 'City is required' 
      }));
    } else if (field === 'state') {
      setErrors(prev => ({ 
        ...prev, 
        state: formData.state.trim() ? '' : 'State is required' 
      }));
    } else if (field === 'zip') {
      setErrors(prev => ({ 
        ...prev, 
        zip: formData.zip.trim() ? '' : 'ZIP code is required' 
      }));
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error if field is now valid
    if (touched[field] && value.trim()) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContinue = () => {
    if (validateForm()) {
      if (showAddressFields) {
        setAddress(formData.address, formData.city, formData.state, formData.zip);
      }
      
      if (showTravelRadius) {
        setTravelRadius(radius);
      }
      
      nextStep();
      
      // If they work at a shop, they already went through shop search
      // If they're independent, they need to set up services
      router.push('/provider-onboarding/services');
    } else {
      // Mark all fields as touched to show all errors
      setTouched({
        address: true,
        city: true,
        state: true,
        zip: true,
      });
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
            <Text style={styles.question}>{getScreenTitle()}</Text>
            <Text style={styles.description}>{getScreenDescription()}</Text>

            {showAddressFields && (
              <Animated.View style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: formSlideAnim }]
                }
              ]}>
                <FormInput
                  label="ADDRESS"
                  value={formData.address}
                  onChangeText={(value) => handleChange('address', value)}
                  onBlur={() => handleBlur('address')}
                  error={touched.address ? errors.address : null}
                  isValid={touched.address && !errors.address}
                  placeholder="Enter your street address"
                  testID="address-input"
                />

                <FormInput
                  label="CITY"
                  value={formData.city}
                  onChangeText={(value) => handleChange('city', value)}
                  onBlur={() => handleBlur('city')}
                  error={touched.city ? errors.city : null}
                  isValid={touched.city && !errors.city}
                  placeholder="Enter your city"
                  testID="city-input"
                />

                <View style={styles.rowContainer}>
                  <View style={styles.stateContainer}>
                    <FormInput
                      label="STATE"
                      value={formData.state}
                      onChangeText={(value) => handleChange('state', value)}
                      onBlur={() => handleBlur('state')}
                      error={touched.state ? errors.state : null}
                      isValid={touched.state && !errors.state}
                      placeholder="State"
                      testID="state-input"
                      maxLength={2}
                      autoCapitalize="characters"
                    />
                  </View>
                  
                  <View style={styles.zipContainer}>
                    <FormInput
                      label="ZIP CODE"
                      value={formData.zip}
                      onChangeText={(value) => handleChange('zip', value)}
                      onBlur={() => handleBlur('zip')}
                      error={touched.zip ? errors.zip : null}
                      isValid={touched.zip && !errors.zip}
                      placeholder="ZIP"
                      testID="zip-input"
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                </View>
              </Animated.View>
            )}

            {showTravelRadius && (
              <Animated.View style={[
                styles.radiusContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: formSlideAnim }]
                }
              ]}>
                <Text style={styles.radiusLabel}>Maximum Travel Distance</Text>
                <Text style={styles.radiusValue}>{radius} miles</Text>
                
                <CustomSlider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={50}
                  step={1}
                  value={radius}
                  onValueChange={setRadius}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.gray}
                  thumbTintColor={COLORS.primary}
                  testID="radius-slider"
                />
                
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>1 mile</Text>
                  <Text style={styles.sliderLabel}>50 miles</Text>
                </View>
              </Animated.View>
            )}
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
              testID="service-address-navigation"
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
  formContainer: {
    marginBottom: SPACING.xl,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stateContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  zipContainer: {
    flex: 1.5,
  },
  radiusContainer: {
    marginBottom: SPACING.xl,
  },
  radiusLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  radiusValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    fontFamily: FONTS.bold,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  sliderLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
  animatedNavigationContainer: {
    // Container for animated navigation
  },
});