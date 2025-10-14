import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding, WeeklyAvailability, TimeSlot } from '@/providers/ProviderOnboardingProvider';
import { Clock } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

// Days of the week
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Day = typeof DAYS[number];

// Time slots for selection
const TIME_SLOTS: { label: string; value: string }[] = [
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM', value: '13:00' },
  { label: '2:00 PM', value: '14:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '4:00 PM', value: '16:00' },
  { label: '5:00 PM', value: '17:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '7:00 PM', value: '19:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
];

export default function AvailabilityScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    availability,
    setAvailability,
    updateDayAvailability,
    nextStep,
    completeOnboarding
  } = useProviderOnboarding();

  // Initialize state with current availability or default
  const [availabilityState, setAvailabilityState] = useState<WeeklyAvailability>(
    availability || {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }
  );

  // Track which days are enabled
  const [enabledDays, setEnabledDays] = useState<Record<Day, boolean>>(
    DAYS.reduce((acc, day) => {
      acc[day] = availability?.[day]?.length > 0 || false;
      return acc;
    }, {} as Record<Day, boolean>)
  );

  // Track selected time slots for each day
  const [selectedTimes, setSelectedTimes] = useState<Record<Day, string[]>>(
    DAYS.reduce((acc, day) => {
      const daySlots = availability?.[day] || [];
      const times = daySlots.flatMap(slot => {
        const startHour = slot.start.split(':')[0];
        const endHour = slot.end.split(':')[0];
        
        // Generate all hours between start and end
        const hours = [];
        for (let h = parseInt(startHour); h < parseInt(endHour); h++) {
          hours.push(h.toString().padStart(2, '0') + ':00');
        }
        return hours;
      });
      
      acc[day] = times;
      return acc;
    }, {} as Record<Day, string[]>)
  );

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const availabilitySlideAnim = useRef(new Animated.Value(50)).current;
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
      // Availability animation
      Animated.timing(availabilitySlideAnim, {
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
  }, [fadeAnim, slideAnim, headerSlideAnim, availabilitySlideAnim, navigationSlideAnim]);

  const toggleDay = (day: Day) => {
    setEnabledDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));

    // If disabling a day, clear its time slots
    if (enabledDays[day]) {
      setSelectedTimes(prev => ({
        ...prev,
        [day]: []
      }));
    }
  };

  const toggleTimeSlot = (day: Day, time: string) => {
    setSelectedTimes(prev => {
      const dayTimes = [...prev[day]];
      
      if (dayTimes.includes(time)) {
        // Remove the time
        return {
          ...prev,
          [day]: dayTimes.filter(t => t !== time)
        };
      } else {
        // Add the time
        return {
          ...prev,
          [day]: [...dayTimes, time].sort()
        };
      }
    });
  };

  // Convert selected times to time slots (start-end pairs)
  const convertToTimeSlots = (times: string[]): TimeSlot[] => {
    if (times.length === 0) return [];
    
    // Sort times
    const sortedTimes = [...times].sort();
    
    // Group consecutive hours
    const slots: TimeSlot[] = [];
    let currentSlot: { start: string; end: string | null } = { 
      start: sortedTimes[0], 
      end: null 
    };
    
    for (let i = 1; i < sortedTimes.length; i++) {
      const currentHour = parseInt(sortedTimes[i-1].split(':')[0]);
      const nextHour = parseInt(sortedTimes[i].split(':')[0]);
      
      // Check if hours are consecutive
      if (nextHour === currentHour + 1) {
        // Continue current slot
        if (i === sortedTimes.length - 1) {
          // Last item, close the slot
          currentSlot.end = `${(nextHour + 1).toString().padStart(2, '0')}:00`;
          slots.push(currentSlot as TimeSlot);
        }
      } else {
        // Close current slot and start a new one
        currentSlot.end = `${(currentHour + 1).toString().padStart(2, '0')}:00`;
        slots.push(currentSlot as TimeSlot);
        currentSlot = { start: sortedTimes[i], end: null };
        
        // If this is the last item, add it as a single-hour slot
        if (i === sortedTimes.length - 1) {
          currentSlot.end = `${(nextHour + 1).toString().padStart(2, '0')}:00`;
          slots.push(currentSlot as TimeSlot);
        }
      }
    }
    
    // Handle case with only one time selected
    if (sortedTimes.length === 1) {
      const hour = parseInt(sortedTimes[0].split(':')[0]);
      slots.push({ 
        start: sortedTimes[0], 
        end: `${(hour + 1).toString().padStart(2, '0')}:00` 
      });
    }
    
    return slots;
  };

  const saveAvailability = () => {
    // Convert selected times to time slots for each day
    const newAvailability: WeeklyAvailability = { ...availabilityState };
    
    DAYS.forEach(day => {
      if (enabledDays[day]) {
        newAvailability[day] = convertToTimeSlots(selectedTimes[day]);
      } else {
        newAvailability[day] = [];
      }
    });
    
    setAvailability(newAvailability);
    return newAvailability;
  };

  const handleContinue = () => {
    const newAvailability = saveAvailability();
    nextStep();
    router.replace('/provider-onboarding/summary');
  };

  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
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
          <Text style={styles.question}>Set your availability</Text>
          <Text style={styles.description}>
            Select the days and hours you're available to provide services.
          </Text>

          <Animated.View style={[
            styles.availabilityContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: availabilitySlideAnim }]
            }
          ]}>
            {DAYS.map((day, index) => (
              <Animated.View 
                key={day} 
                style={[
                  styles.dayContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: Animated.add(
                          availabilitySlideAnim,
                          new Animated.Value(index * 8)
                        )
                      }
                    ]
                  }
                ]}
              >
                <View style={styles.dayHeader}>
                  <View style={styles.dayTitleContainer}>
                    <Text style={styles.dayTitle}>{formatDayName(day)}</Text>
                  </View>
                  <Switch
                    value={enabledDays[day]}
                    onValueChange={() => toggleDay(day)}
                    trackColor={{ false: COLORS.gray, true: `${COLORS.primary}30` }}
                    thumbColor={enabledDays[day] ? COLORS.primary : COLORS.lightGray}
                    testID={`day-switch-${day}`}
                  />
                </View>

                {enabledDays[day] && (
                  <View style={styles.timeSlots}>
                    {TIME_SLOTS.map(slot => (
                      <TouchableOpacity
                        key={slot.value}
                        style={[
                          styles.timeSlot,
                          selectedTimes[day].includes(slot.value) && styles.selectedTimeSlot
                        ]}
                        onPress={() => toggleTimeSlot(day, slot.value)}
                        testID={`time-slot-${day}-${slot.value}`}
                      >
                        <Clock 
                          size={16} 
                          color={selectedTimes[day].includes(slot.value) ? COLORS.background : COLORS.lightGray} 
                        />
                        <Text 
                          style={[
                            styles.timeText,
                            selectedTimes[day].includes(slot.value) && styles.selectedTimeText
                          ]}
                        >
                          {slot.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Animated.View>
            ))}
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
            testID="availability-navigation"
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
  availabilityContainer: {
    marginBottom: SPACING.xl,
  },
  dayContainer: {
    marginBottom: SPACING.lg,
    ...GLASS_STYLES.card,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  dayTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.background,
    borderRadius: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
  },
  timeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    marginLeft: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  selectedTimeText: {
    color: COLORS.background,
    fontWeight: 'bold' as const,
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