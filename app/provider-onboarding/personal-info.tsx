import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { FormInput } from '@/components/FormInput';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import { validateEmail, validatePhone } from '@/utils/validation';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    firstName, 
    lastName, 
    phone, 
    email, 
    workSituation,
    setPersonalInfo, 
    nextStep,
    previousStep 
  } = useProviderOnboarding();

  const [formData, setFormData] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    phone: phone || '',
    email: email || '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    phone: false,
    email: false,
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

  const validateForm = () => {
    const newErrors = {
      firstName: formData.firstName.trim() ? '' : 'First name is required',
      lastName: formData.lastName.trim() ? '' : 'Last name is required',
      phone: validatePhone(formData.phone) ? '' : 'Valid phone number is required',
      email: validateEmail(formData.email) ? '' : 'Valid email is required',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field that was blurred
    if (field === 'firstName') {
      setErrors(prev => ({ 
        ...prev, 
        firstName: formData.firstName.trim() ? '' : 'First name is required' 
      }));
    } else if (field === 'lastName') {
      setErrors(prev => ({ 
        ...prev, 
        lastName: formData.lastName.trim() ? '' : 'Last name is required' 
      }));
    } else if (field === 'phone') {
      setErrors(prev => ({ 
        ...prev, 
        phone: validatePhone(formData.phone) ? '' : 'Valid phone number is required' 
      }));
    } else if (field === 'email') {
      setErrors(prev => ({ 
        ...prev, 
        email: validateEmail(formData.email) ? '' : 'Valid email is required' 
      }));
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error if field is now valid
    if (touched[field]) {
      if (field === 'firstName' && value.trim()) {
        setErrors(prev => ({ ...prev, firstName: '' }));
      } else if (field === 'lastName' && value.trim()) {
        setErrors(prev => ({ ...prev, lastName: '' }));
      } else if (field === 'phone' && validatePhone(value)) {
        setErrors(prev => ({ ...prev, phone: '' }));
      } else if (field === 'email' && validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }
  };

  const handleContinue = () => {
    if (validateForm()) {
      setPersonalInfo(
        formData.firstName,
        formData.lastName,
        formData.phone,
        formData.email
      );
      nextStep();
      
      // Navigate based on work situation
      if (workSituation === 'work_at_shop') {
        router.push('/provider-onboarding/shop-search');
      } else {
        router.push('/provider-onboarding/service-address');
      }
    } else {
      // Mark all fields as touched to show all errors
      setTouched({
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      });
    }
  };

  const handleBack = () => {
    previousStep();
    router.back();
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
            <Text style={styles.question}>Tell us about yourself</Text>
            <Text style={styles.description}>
              We&apos;ll use this information to set up your profile and help clients find you.
            </Text>

            <Animated.View style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: formSlideAnim }]
              }
            ]}>
              <FormInput
                label="FIRST NAME"
                value={formData.firstName}
                onChangeText={(value) => handleChange('firstName', value)}
                onBlur={() => handleBlur('firstName')}
                error={touched.firstName ? errors.firstName : null}
                isValid={touched.firstName && !errors.firstName}
                placeholder="Enter your first name"
                testID="first-name-input"
                autoCapitalize="words"
              />

              <FormInput
                label="LAST NAME"
                value={formData.lastName}
                onChangeText={(value) => handleChange('lastName', value)}
                onBlur={() => handleBlur('lastName')}
                error={touched.lastName ? errors.lastName : null}
                isValid={touched.lastName && !errors.lastName}
                placeholder="Enter your last name"
                testID="last-name-input"
                autoCapitalize="words"
              />

              <FormInput
                label="PHONE NUMBER"
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                onBlur={() => handleBlur('phone')}
                error={touched.phone ? errors.phone : null}
                isValid={touched.phone && !errors.phone}
                placeholder="(123) 456-7890"
                keyboardType="phone-pad"
                testID="phone-input"
              />

              <FormInput
                label="EMAIL"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                onBlur={() => handleBlur('email')}
                error={touched.email ? errors.email : null}
                isValid={touched.email && !errors.email}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                testID="email-input"
              />
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
              testID="personal-info-navigation"
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
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
  animatedNavigationContainer: {
    // Container for animated navigation
  },
});