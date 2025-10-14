import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Animated } from 'react-native';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    bio,
    profileImage,
    setBio,
    setProfileImage,
    nextStep 
  } = useProviderOnboarding();

  const [bioText, setBioText] = useState(bio || '');
  const [imageUri, setImageUri] = useState<string | null>(profileImage);
  const [error, setError] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const imageSlideAnim = useRef(new Animated.Value(40)).current;
  const bioSlideAnim = useRef(new Animated.Value(50)).current;
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
      // Image animation
      Animated.timing(imageSlideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      // Bio animation
      Animated.timing(bioSlideAnim, {
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
  }, [fadeAnim, slideAnim, headerSlideAnim, imageSlideAnim, bioSlideAnim, navigationSlideAnim]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setError('');
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Camera permission is required to take a photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setError('');
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Failed to take photo. Please try again.');
    }
  };

  const handleContinue = () => {
    // Save profile data
    setBio(bioText.trim());
    if (imageUri) {
      setProfileImage(imageUri);
    }
    
    nextStep();
    router.replace('availability');
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
          <Text style={styles.question}>Build your profile</Text>
          <Text style={styles.description}>
            Add a profile photo and write a bio to help clients get to know you.
          </Text>

          <Animated.View style={[
            styles.profileImageContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: imageSlideAnim }]
            }
          ]}>
            <View style={styles.imageContainer}>
              {imageUri && imageUri.trim() !== '' ? (
                <ImageWithFallback source={{ uri: imageUri }} style={styles.profileImage} fallbackIcon="user" />
              ) : (
                <View style={styles.placeholderImage}>
                  <Upload size={40} color={COLORS.lightGray} />
                </View>
              )}
            </View>

            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity 
                style={styles.imageButton} 
                onPress={pickImage}
                testID="pick-image-button"
              >
                <Upload size={20} color={COLORS.primary} />
                <Text style={styles.imageButtonText}>Upload Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.imageButton} 
                onPress={takePhoto}
                testID="take-photo-button"
              >
                <Camera size={20} color={COLORS.primary} />
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </Animated.View>

          <Animated.View style={[
            styles.bioContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: bioSlideAnim }]
            }
          ]}>
            <Text style={styles.inputLabel}>ABOUT YOU</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="Tell clients about your experience, specialties, and style..."
              placeholderTextColor="#666666"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={bioText}
              onChangeText={setBioText}
              maxLength={500}
              testID="bio-input"
            />
            <Text style={styles.charCount}>{bioText.length}/500</Text>
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
            testID="profile-navigation"
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
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.glass.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.glass.background,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}20`,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.xs,
  },
  imageButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold' as const,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  bioContainer: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold' as const,
    color: COLORS.input.label,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  bioInput: {
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    minHeight: 150,
    textAlignVertical: 'top',
    fontFamily: FONTS.regular,
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.lightGray,
    textAlign: 'right',
    marginTop: SPACING.xs,
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