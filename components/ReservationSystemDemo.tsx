import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { 
  checkAndReserveSlot, 
  confirmReservation, 
  releaseReservation,
  getActiveReservations,
  ReservationResult,
  ConfirmationResult
} from '@/utils/bookingService';
import { useReservationState } from '@/utils/reservationHooks';
import { ProviderAvailability } from '@/models/database';

// Mock data for demo
const mockProviderAvailability: ProviderAvailability = {
  id: 'availability-1',
  providerId: 'provider-1',
  weeklySchedule: [
    {
      day: 'monday',
      isEnabled: true,
      intervals: [{ start: '09:00', end: '17:00' }]
    },
    {
      day: 'tuesday',
      isEnabled: true,
      intervals: [{ start: '09:00', end: '17:00' }]
    },
    {
      day: 'wednesday',
      isEnabled: true,
      intervals: [{ start: '09:00', end: '17:00' }]
    },
    {
      day: 'thursday',
      isEnabled: true,
      intervals: [{ start: '09:00', end: '17:00' }]
    },
    {
      day: 'friday',
      isEnabled: true,
      intervals: [{ start: '09:00', end: '17:00' }]
    },
    {
      day: 'saturday',
      isEnabled: false,
      intervals: []
    },
    {
      day: 'sunday',
      isEnabled: false,
      intervals: []
    }
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

/**
 * Demo component showing the reservation system in action
 * This demonstrates the complete flow from slot reservation to confirmation
 */
export const ReservationSystemDemo: React.FC = () => {
  const reservationState = useReservationState();
  const [step, setStep] = React.useState<'select' | 'payment' | 'confirmed'>('select');

  // Demo slot selection
  const handleReserveSlot = async () => {
    console.log('Demo: Starting slot reservation...');
    
    reservationState.setIsReserving(true);
    
    // Simulate user selecting a time slot
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const result: ReservationResult = checkAndReserveSlot(
      'provider-1',
      'shop-1', 
      dateStr,
      '10:00',
      60, // 1 hour service
      'client-demo',
      'service-haircut',
      mockProviderAvailability
    );
    
    reservationState.setIsReserving(false);
    
    if (result.success && result.reservationId) {
      console.log('Demo: Slot reserved successfully!', result.reservationId);
      reservationState.setReservation(result.reservationId);
      setStep('payment');
      
      Alert.alert(
        'Slot Reserved!',
        `Your slot has been reserved for 5 minutes. Complete payment to confirm your appointment.`,
        [{ text: 'OK' }]
      );
    } else {
      console.log('Demo: Reservation failed:', result.error);
      reservationState.setError(result.error || 'Unknown error');
      Alert.alert('Reservation Failed', result.error || 'Unknown error');
    }
  };

  // Demo payment completion
  const handleCompletePayment = async () => {
    if (!reservationState.reservationId) return;
    
    console.log('Demo: Processing payment...');
    
    const confirmation: ConfirmationResult = confirmReservation(
      reservationState.reservationId,
      {
        totalAmount: 50,
        serviceAmount: 45,
        tipAmount: 5,
        paymentMethod: 'credit_card'
      }
    );
    
    if (confirmation.success) {
      console.log('Demo: Payment successful! Appointment confirmed:', confirmation.appointmentId);
      setStep('confirmed');
      reservationState.clearReservation();
      
      Alert.alert(
        'Payment Successful!',
        `Your appointment has been confirmed. Appointment ID: ${confirmation.appointmentId}`,
        [{ text: 'OK' }]
      );
    } else {
      console.log('Demo: Payment failed:', confirmation.error);
      reservationState.setError(confirmation.error || 'Payment failed');
      Alert.alert('Payment Failed', confirmation.error || 'Payment failed');
    }
  };

  // Demo cancellation
  const handleCancelReservation = () => {
    if (!reservationState.reservationId) return;
    
    console.log('Demo: Cancelling reservation...');
    
    const released = releaseReservation(reservationState.reservationId);
    
    if (released) {
      console.log('Demo: Reservation cancelled successfully');
      reservationState.clearReservation();
      setStep('select');
      Alert.alert('Reservation Cancelled', 'Your reservation has been cancelled.');
    } else {
      Alert.alert('Error', 'Failed to cancel reservation.');
    }
  };

  // Demo debug info
  const showDebugInfo = () => {
    const activeReservations = getActiveReservations();
    console.log('Demo: Active reservations:', activeReservations);
    
    Alert.alert(
      'Debug Info',
      `Active Reservations: ${activeReservations.length}\n` +
      `Current Reservation: ${reservationState.reservationId || 'None'}\n` +
      `Timer: ${reservationState.timer.formatTime()}\n` +
      `Expired: ${reservationState.timer.isExpired ? 'Yes' : 'No'}`
    );
  };

  const resetDemo = () => {
    reservationState.clearReservation();
    setStep('select');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservation System Demo</Text>
      <Text style={styles.subtitle}>
        This demo shows how the slot reservation system prevents double-booking
      </Text>

      {/* Step 1: Slot Selection */}
      {step === 'select' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Step 1: Select Time Slot</Text>
          <Text style={styles.description}>
            Click below to reserve a slot for tomorrow at 10:00 AM
          </Text>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleReserveSlot}
            disabled={reservationState.isReserving}
          >
            <Text style={styles.buttonText}>
              {reservationState.isReserving ? 'Reserving...' : 'Reserve Slot'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: Payment Screen */}
      {step === 'payment' && reservationState.reservationId && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Step 2: Complete Payment</Text>
          <Text style={styles.description}>
            Your slot is reserved! Complete payment within the time limit.
          </Text>
          
          {/* Countdown Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Time Remaining:</Text>
            <Text style={[
              styles.timerText, 
              reservationState.timer.isExpired && styles.timerExpired
            ]}>
              {reservationState.timer.formatTime()}
            </Text>
          </View>
          
          {!reservationState.timer.isExpired ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleCompletePayment}
              >
                <Text style={styles.buttonText}>Complete Payment ($50)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleCancelReservation}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.expiredText}>
                Reservation expired! Please try booking again.
              </Text>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={resetDemo}
              >
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirmed' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>✅ Appointment Confirmed!</Text>
          <Text style={styles.description}>
            Your appointment has been successfully booked and confirmed.
          </Text>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={resetDemo}
          >
            <Text style={styles.buttonText}>Book Another Appointment</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error Display */}
      {reservationState.reservationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{reservationState.reservationError}</Text>
        </View>
      )}

      {/* Debug Button */}
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={showDebugInfo}
      >
        <Text style={styles.debugButtonText}>Show Debug Info</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22,
  },
  stepContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    lineHeight: 22,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    fontFamily: 'monospace',
  },
  timerExpired: {
    color: '#FF3B30',
  },
  buttonRow: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  expiredText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
  debugButton: {
    backgroundColor: '#6C757D',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});