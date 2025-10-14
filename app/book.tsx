import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, Clock, CreditCard, ArrowLeft } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { mockProviders } from '@/mocks/providers';
import { parseBookingLink, instantBookAppointment } from '@/utils/bookingService';
import { useAuth } from '@/providers/AuthProvider';

// TheCut-style simplified booking page
export default function BookScreen() {
  const { provider, shop, service } = useLocalSearchParams<{
    provider?: string;
    shop?: string;
    service?: string;
  }>();
  
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isBooking, setIsBooking] = useState<boolean>(false);
  
  // Find provider data
  const providerData = mockProviders.find(p => p.id === provider);
  const selectedService = providerData?.services.find(s => s.id === service) || providerData?.services[0];
  
  // Mock available times for today and tomorrow
  const availableTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];
  
  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      display: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  });
  
  useEffect(() => {
    // Auto-select today
    if (availableDates.length > 0) {
      setSelectedDate(availableDates[0].date);
    }
  }, []);
  
  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !user || !selectedService) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }
    
    setIsBooking(true);
    
    try {
      // Convert time to 24-hour format
      const time24 = convertTo24Hour(selectedTime);
      
      const result = await instantBookAppointment(
        provider || '',
        selectedService.id,
        selectedDate,
        time24,
        user.id || '',
        {
          totalAmount: selectedService.price,
          serviceAmount: selectedService.price,
          tipAmount: 0,
          paymentMethod: 'card'
        }
      );
      
      if (result.success) {
        Alert.alert(
          'Booking Confirmed!',
          `Your appointment with ${providerData?.name} has been confirmed for ${selectedTime} on ${availableDates.find(d => d.date === selectedDate)?.display}.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(app)/(client)/(tabs)/appointments')
            }
          ]
        );
      } else {
        Alert.alert('Booking Failed', result.error || 'Please try again');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };
  
  const convertTo24Hour = (time12: string): string => {
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
  };
  
  if (!providerData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Provider not found</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Provider Info */}
        <View style={styles.providerCard}>
          <Image source={{ uri: providerData.profileImage }} style={styles.providerImage} />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{providerData.name}</Text>
            <Text style={styles.shopName}>{providerData.shopName}</Text>
            {selectedService && (
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{selectedService.name}</Text>
                <Text style={styles.serviceDetails}>
                  {selectedService.duration} • ${selectedService.price}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Date Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {availableDates.map((dateOption) => (
              <TouchableOpacity
                key={dateOption.date}
                style={[
                  styles.dateButton,
                  selectedDate === dateOption.date && styles.selectedDateButton
                ]}
                onPress={() => setSelectedDate(dateOption.date)}
              >
                <Text style={[
                  styles.dateButtonText,
                  selectedDate === dateOption.date && styles.selectedDateButtonText
                ]}>
                  {dateOption.display}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Time Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Select Time</Text>
          </View>
          
          <View style={styles.timeGrid}>
            {availableTimes.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  selectedTime === time && styles.selectedTimeButton
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeButtonText,
                  selectedTime === time && styles.selectedTimeButtonText
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Summary */}
        {selectedDate && selectedTime && selectedService && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service:</Text>
              <Text style={styles.summaryValue}>{selectedService.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>
                {availableDates.find(d => d.date === selectedDate)?.display}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time:</Text>
              <Text style={styles.summaryValue}>{selectedTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>{selectedService.duration}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${selectedService.price}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedDate || !selectedTime || isBooking) && styles.bookButtonDisabled
          ]}
          onPress={handleBookAppointment}
          disabled={!selectedDate || !selectedTime || isBooking}
        >
          <CreditCard size={20} color={COLORS.background} />
          <Text style={styles.bookButtonText}>
            {isBooking ? 'Booking...' : 'Book & Pay Now'}
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  providerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SPACING.md,
  },
  providerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  providerName: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  shopName: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.lightGray,
    marginBottom: SPACING.sm,
  },
  serviceInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  serviceName: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
    marginBottom: SPACING.xs,
  },
  serviceDetails: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.lightGray,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  dateScroll: {
    marginBottom: SPACING.md,
  },
  dateButton: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedDateButton: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  dateButtonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
  selectedDateButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeButton: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTimeButton: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  timeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
  selectedTimeButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.lightGray,
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  bookButtonText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.background,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});