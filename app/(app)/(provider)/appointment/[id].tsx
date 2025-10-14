import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Clock, MapPin, DollarSign, User, Calendar as CalendarIcon, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { useAppointments } from '@/providers/AppointmentProvider';
import AppointmentStatusManager from '@/components/AppointmentStatusManager';
import { Appointment } from '@/models/database';

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { appointments } = useAppointments();
  const [notes, setNotes] = useState<string>('');

  const appointment = useMemo(() => {
    const aptId = Array.isArray(id) ? id[0] : (id ?? '');
    return appointments.find((apt: Appointment) => apt.id === aptId);
  }, [appointments, id]);

  if (!appointment) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>Appointment not found</Text>
      </View>
    );
  }

  const handleGoToPayment = () => {
    router.push({ pathname: '/(app)/(provider)/complete-payment', params: { appointmentId: appointment.id } });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ChevronLeft size={24} color={COLORS.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.clientCard}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&q=80' }} style={styles.clientImage} />
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>Client {appointment.clientId}</Text>
          <Text style={styles.clientPhone}>{appointment.shopId}</Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Appointment Details</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <CalendarIcon size={20} color="#999" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{appointment.date}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Clock size={20} color="#999" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{appointment.startTime} - {appointment.endTime}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <User size={20} color="#999" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Service</Text>
            <Text style={styles.detailValue}>{appointment.serviceId}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <DollarSign size={20} color="#999" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValue}>${appointment.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.statusManagerWrapper}>
          <AppointmentStatusManager appointment={appointment} onStatusChange={(s) => {
            if (s === 'completed') {
              handleGoToPayment();
            }
          }} />
        </View>
      </View>

      <View style={styles.notesCard}>
        <Text style={styles.sectionTitle}>Appointment Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add notes about this appointment..."
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          testID="appointment-notes"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 50,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  clientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  clientPhone: {
    fontSize: 14,
    color: '#999',
  },
  detailsCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: FONTS.bold,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusManagerWrapper: {
    marginTop: 12,
  },
  notesCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  checkInButton: {
    backgroundColor: COLORS.primary,
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: COLORS.info,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  declineButton: {
    backgroundColor: COLORS.error,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  rescheduleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  rescheduleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.error,
    marginLeft: 8,
  },
});