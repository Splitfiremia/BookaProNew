import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, GLASS_STYLES } from '@/constants/theme';

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
];

export default function SelectTimeScreen() {
  const router = useRouter();
  const { providerId, serviceId, date } = useLocalSearchParams<{ 
    providerId: string; 
    serviceId: string; 
    date: string;
  }>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (selectedTime) {
      router.push(`/(app)/(client)/booking/confirm?providerId=${providerId}&serviceId=${serviceId}&date=${date}&time=${selectedTime}`);
    }
  };

  const unavailableTimes = ['10:30 AM', '2:00 PM', '3:30 PM'];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Time</Text>
          <Text style={styles.subtitle}>Available time slots for {date}</Text>
        </View>

        <View style={styles.timeSlotsContainer}>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ccc' }]} />
              <Text style={styles.legendText}>Unavailable</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
          </View>

          <View style={styles.slotsGrid}>
            {timeSlots.map((time) => {
              const isUnavailable = unavailableTimes.includes(time);
              const isSelected = selectedTime === time;
              
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    isSelected && styles.selectedSlot,
                    isUnavailable && styles.unavailableSlot
                  ]}
                  onPress={() => !isUnavailable && handleTimeSelect(time)}
                  disabled={isUnavailable}
                >
                  <Clock 
                    size={16} 
                    color={isSelected ? '#fff' : isUnavailable ? '#999' : '#666'} 
                  />
                  <Text style={[
                    styles.timeText,
                    isSelected && styles.selectedTimeText,
                    isUnavailable && styles.unavailableTimeText
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedTime && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedTime}
        >
          <Text style={styles.continueButtonText}>Continue to Confirmation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  timeSlotsContainer: {
    padding: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
    padding: 12,
    ...GLASS_STYLES.card,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    ...GLASS_STYLES.card,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '47%',
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  selectedSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unavailableSlot: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '500',
    fontFamily: FONTS.regular,
  },
  selectedTimeText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
  unavailableTimeText: {
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    ...GLASS_STYLES.button.primary,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  continueButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
});