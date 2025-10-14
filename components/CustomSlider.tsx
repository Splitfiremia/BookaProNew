import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, PanResponder, Animated, StyleSheet, Platform, LayoutChangeEvent } from 'react-native';
import { COLORS } from '@/constants/theme';

interface CustomSliderProps {
  minimumValue: number;
  maximumValue: number;
  value: number;
  step?: number;
  onValueChange: (value: number) => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
  testID?: string;
  disabled?: boolean;
}

export function CustomSlider({
  minimumValue,
  maximumValue,
  value,
  step = 1,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
  minimumTrackTintColor = COLORS.primary,
  maximumTrackTintColor = COLORS.gray,
  thumbTintColor = COLORS.primary,
  style,
  testID,
  disabled = false
}: CustomSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const currentValueRef = useRef(value);
  const sliderWidthRef = useRef(0);

  // Validate props
  useEffect(() => {
    if (minimumValue >= maximumValue) {
      console.error('CustomSlider: minimumValue must be less than maximumValue');
    }
    if (value < minimumValue || value > maximumValue) {
      console.warn('CustomSlider: value is outside min/max range');
    }
  }, [minimumValue, maximumValue, value]);

  // Calculate value from position with bounds checking
  const getValueFromPosition = useCallback((x: number) => {
    if (sliderWidthRef.current === 0) return minimumValue;
    
    const percentage = Math.max(0, Math.min(1, x / sliderWidthRef.current));
    const rawValue = minimumValue + percentage * (maximumValue - minimumValue);
    
    // Apply step if specified
    let steppedValue = rawValue;
    if (step > 0) {
      steppedValue = Math.round(rawValue / step) * step;
    }
    
    // Ensure value is within bounds
    return Math.max(minimumValue, Math.min(maximumValue, steppedValue));
  }, [minimumValue, maximumValue, step]);

  // Calculate position from value
  const getPositionFromValue = useCallback((val: number) => {
    if (sliderWidthRef.current === 0 || maximumValue === minimumValue) return 0;
    
    const percentage = (val - minimumValue) / (maximumValue - minimumValue);
    return percentage * sliderWidthRef.current;
  }, [minimumValue, maximumValue]);

  // Update animated value smoothly
  const updateAnimatedValue = useCallback((newValue: number, animated = true) => {
    const position = getPositionFromValue(newValue);
    
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: position,
        duration: 150,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(position);
    }
  }, [animatedValue, getPositionFromValue]);

  // Handle layout changes
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    const newSliderWidth = Math.max(0, width - 20); // Account for thumb size
    setSliderWidth(newSliderWidth);
    sliderWidthRef.current = newSliderWidth;
    
    // Update position for current value
    updateAnimatedValue(currentValueRef.current, false);
  }, [updateAnimatedValue]);

  // Update when value prop changes (if not currently sliding)
  useEffect(() => {
    if (!isSliding && value !== currentValueRef.current) {
      currentValueRef.current = value;
      updateAnimatedValue(value);
    }
  }, [value, isSliding, updateAnimatedValue]);

  // Pan responder for touch interactions
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: (evt) => {
      if (disabled) return;
      
      setIsSliding(true);
      onSlidingStart?.();
      
      let x;
      if (Platform.OS === 'web') {
        x = evt.nativeEvent.locationX;
      } else {
        // For mobile, use the touch position relative to the track
        x = evt.nativeEvent.locationX;
      }
      
      const newValue = getValueFromPosition(x);
      currentValueRef.current = newValue;
      onValueChange(newValue);
      
      updateAnimatedValue(newValue, false);
    },
    
    onPanResponderMove: (evt, gestureState) => {
      if (disabled || sliderWidthRef.current === 0) return;
      
      let x;
      if (Platform.OS === 'web') {
        x = evt.nativeEvent.locationX;
      } else {
        // For mobile, calculate position based on gesture movement
        const trackX = evt.nativeEvent.locationX;
        x = Math.max(0, Math.min(sliderWidthRef.current, trackX));
      }
      
      const newValue = getValueFromPosition(x);
      
      // Only update if value actually changed
      if (newValue !== currentValueRef.current) {
        currentValueRef.current = newValue;
        onValueChange(newValue);
        updateAnimatedValue(newValue, false);
      }
    },
    
    onPanResponderRelease: () => {
      if (disabled) return;
      
      setIsSliding(false);
      onSlidingComplete?.(currentValueRef.current);
    },
    
    onPanResponderTerminate: () => {
      if (disabled) return;
      
      setIsSliding(false);
      onSlidingComplete?.(currentValueRef.current);
    },
  }), [
    disabled,
    getValueFromPosition,
    onValueChange,
    onSlidingStart,
    onSlidingComplete,
    updateAnimatedValue
  ]);

  // Interpolated values for animations
  const thumbPosition = animatedValue.interpolate({
    inputRange: [0, Math.max(1, sliderWidth)],
    outputRange: [0, Math.max(1, sliderWidth)],
    extrapolate: 'clamp',
  });

  const trackFillWidth = animatedValue.interpolate({
    inputRange: [0, Math.max(1, sliderWidth)],
    outputRange: [0, Math.max(1, sliderWidth)],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.container,
        style,
        disabled && styles.disabled
      ]}
      onLayout={handleLayout}
      testID={testID}
    >
      <View 
        style={styles.trackContainer}
        {...panResponder.panHandlers}
      >
        {/* Background track */}
        <View 
          style={[
            styles.track, 
            { backgroundColor: maximumTrackTintColor }
          ]} 
        />
        
        {/* Fill track */}
        <Animated.View
          style={[
            styles.trackFill,
            {
              backgroundColor: minimumTrackTintColor,
              width: trackFillWidth,
            },
          ]}
        />
        
        {/* Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: thumbTintColor,
              transform: [{ translateX: thumbPosition }],
              shadowOpacity: isSliding ? 0.4 : 0.25,
            },
            disabled && styles.thumbDisabled,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 10,
    right: 10,
  },
  trackFill: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 10,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    left: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabled: {
    opacity: 0.5,
  },
  thumbDisabled: {
    shadowOpacity: 0.1,
    elevation: 1,
  },
});