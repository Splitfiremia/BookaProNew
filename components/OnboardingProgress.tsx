import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
  showStepTitle?: boolean;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  currentStep, 
  totalSteps,
  stepTitles = [],
  showStepTitle = false
}) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimations = useRef(
    Array.from({ length: totalSteps }, () => new Animated.Value(1))
  ).current;

  useEffect(() => {
    // Animate progress bar with smooth easing
    Animated.timing(progressAnimation, {
      toValue: (currentStep - 1) / (totalSteps - 1),
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Animate step indicators with staggered timing
    const timeouts: NodeJS.Timeout[] = [];
    scaleAnimations.forEach((anim, index) => {
      const isActive = index + 1 <= currentStep;
      const isCurrent = index + 1 === currentStep;
      
      const timeout = setTimeout(() => {
        Animated.spring(anim, {
          toValue: isCurrent ? 1.3 : isActive ? 1.1 : 1,
          useNativeDriver: true,
          tension: 120,
          friction: 6,
        }).start();
      }, index * 50); // Stagger animations
      
      timeouts.push(timeout);
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [currentStep, totalSteps, progressAnimation, scaleAnimations]);
  const indicators = Array.from({ length: totalSteps }, (_, index) => {
    const isActive = index + 1 <= currentStep;
    const isCurrent = index + 1 === currentStep;
    const isCompleted = index + 1 < currentStep;
    
    return (
      <Animated.View 
        key={index}
        style={[
          styles.indicatorContainer,
          { transform: [{ scale: scaleAnimations[index] }] }
        ]}
      >
        <View 
          style={[
            styles.indicator,
            isCompleted ? styles.completedIndicator : 
            isCurrent ? styles.currentIndicator :
            isActive ? styles.activeIndicator : styles.inactiveIndicator
          ]}
          testID={`progress-indicator-${index}`}
        >
          {isCompleted && (
            <Text style={styles.checkmark}>✓</Text>
          )}
          {isCurrent && !isCompleted && (
            <View style={styles.currentDot} />
          )}
        </View>
      </Animated.View>
    );
  });

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const progressOpacity = progressAnimation.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0.3, 1, 1],
  });

  return (
    <View style={styles.container} testID="onboarding-progress">
      {showStepTitle && stepTitles[currentStep - 1] && (
        <Text style={styles.stepTitle}>{stepTitles[currentStep - 1]}</Text>
      )}
      
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack} />
        <Animated.View 
          style={[
            styles.progressBar,
            { 
              width: progressWidth,
              opacity: progressOpacity
            }
          ]} 
        />
        <View style={styles.indicatorsContainer}>
          <>{indicators}</>
        </View>
      </View>
      
      <View style={styles.stepCounter}>
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    position: 'relative',
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
  progressTrack: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 90, 95, 0.2)',
    borderRadius: 2,
  },
  progressBar: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#FF5A5F',
    borderRadius: 2,
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  indicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  inactiveIndicator: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 90, 95, 0.3)',
  },
  activeIndicator: {
    backgroundColor: 'rgba(255, 90, 95, 0.2)',
    borderColor: '#FF5A5F',
  },
  currentIndicator: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  completedIndicator: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepCounter: {
    marginTop: 12,
  },
  stepText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});