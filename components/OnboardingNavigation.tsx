import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { GradientButton } from './GradientButton';

interface OnboardingNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  nextTitle?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  showNext?: boolean;
  loading?: boolean;
  testID?: string;
}

export function OnboardingNavigation({
  onBack,
  onNext,
  nextTitle = 'CONTINUE',
  nextDisabled = false,
  showBack = true,
  showNext = true,
  loading = false,
  testID = 'onboarding-navigation'
}: OnboardingNavigationProps) {
  const router = useRouter();
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const nextButtonScale = useRef(new Animated.Value(1)).current;

  const handleBack = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(backButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(backButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    if (nextDisabled || loading) return;
    
    // Animate button press
    Animated.sequence([
      Animated.timing(nextButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(nextButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onNext) {
      onNext();
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      {showBack && (
        <Animated.View style={[styles.animatedBackButton, { transform: [{ scale: backButtonScale }] }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            testID={`${testID}-back`}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#CCCCCC" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {showNext && (
        <Animated.View style={[styles.nextContainer, { transform: [{ scale: nextButtonScale }] }]}>
          <GradientButton
            title={nextTitle}
            onPress={handleNext}
            disabled={nextDisabled}
            loading={loading}
            testID={`${testID}-next`}
            icon={nextTitle === 'CONTINUE' ? <ChevronRight size={20} color="#000" /> : undefined}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  nextContainer: {
    // GradientButton will handle its own styling
  },
  animatedBackButton: {
    // Container for animated back button
  },
});