import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, Clock, User, DollarSign, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/theme';

const SERVICES = [
  { id: '1', name: 'Haircut', price: 45, duration: 30 },
  { id: '2', name: 'Beard Trim', price: 25, duration: 15 },
  { id: '3', name: 'Hair Color', price: 85, duration: 90 },
  { id: '4', name: 'Hair Treatment', price: 65, duration: 60 },
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export default function ProviderBookingScreen() {
  const { clientId } = useLocalSearchParams();
  
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const handleConfirmBooking = () => {
    if (!selectedService || !selectedTime) {
      return;
    }
    
    // In a real app, create the booking
    console.log('Creating booking:', {
      clientId,
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      notes
    });
    
    router.push('/(app)/(provider)/(tabs)/schedule');
  };
  
  const selectedServiceData = SERVICES.find(s => s.id === selectedService);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Service Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Service</Text>
        <View style={styles.servicesGrid}>
          {SERVICES.map(service => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedService === service.id && styles.serviceCardActive
              ]}
              onPress={() => setSelectedService(service.id)}
            >
              <Text style={[
                styles.serviceName,
                selectedService === service.id && styles.serviceNameActive
              ]}>
                {service.name}
              </Text>
              <View style={styles.serviceDetails}>
                <Text style={[
                  styles.servicePrice,
                  selectedService === service.id && styles.servicePriceActive
                ]}>
                  ${service.price}
                </Text>
                <Text style={[
                  styles.serviceDuration,
                  selectedService === service.id && styles.serviceDurationActive
                ]}>
                  {service.duration} min
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <View style={styles.dateCard}>
          <Calendar size={20} color="#999" />
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      </View>
      
      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Time</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map(time => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                selectedTime === time && styles.timeSlotActive
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[
                styles.timeText,
                selectedTime === time && styles.timeTextActive
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add any special requests or notes..."
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </View>
      
      {/* Summary */}
      {selectedServiceData && selectedTime && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <User size={16} color="#999" />
            <Text style={styles.summaryText}>Client #{clientId}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Clock size={16} color="#999" />
            <Text style={styles.summaryText}>
              {selectedDate.toLocaleDateString()} at {selectedTime}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <DollarSign size={16} color="#999" />
            <Text style={styles.summaryText}>
              {selectedServiceData.name} - ${selectedServiceData.price}
            </Text>
          </View>
        </View>
      )}
      
      {/* Confirm Button */}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!selectedService || !selectedTime) && styles.confirmButtonDisabled
        ]}
        onPress={handleConfirmBooking}
        disabled={!selectedService || !selectedTime}
      >
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  placeholder: {
    width: 60,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: FONTS.bold,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    margin: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  serviceCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  serviceNameActive: {
    color: COLORS.primary,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  servicePrice: {
    fontSize: 14,
    color: '#999',
  },
  servicePriceActive: {
    color: COLORS.primary,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#666',
  },
  serviceDurationActive: {
    color: COLORS.primary,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  timeSlot: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 6,
    margin: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  timeSlotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.text,
  },
  timeTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: FONTS.bold,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});