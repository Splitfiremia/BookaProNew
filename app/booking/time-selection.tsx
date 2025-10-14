import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Clock, AlertCircle, RefreshCw, CheckCircle } from "lucide-react-native";
import { useBooking } from "@/providers/BookingProvider";
import { GradientButton } from "@/components/GradientButton";

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isReserved: boolean;
  reservationExpiry?: Date;
  conflictReason?: string;
}

export default function TimeSelectionScreen() {
  const { selectedProvider, selectedServices, setSelectedTime: setBookingTime } = useBooking();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reservedSlot, setReservedSlot] = useState<string | null>(null);
  const [reservationTimer, setReservationTimer] = useState<number>(0);

  // Calculate total service duration
  const calculateTotalDuration = () => {
    if (!selectedProvider?.services) return 0;
    
    const selectedServiceObjects = selectedProvider.services.filter(service => 
      selectedServices.includes(service.id)
    );
    
    let totalMinutes = 0;
    selectedServiceObjects.forEach(service => {
      const duration = parseInt(service.duration.split(' ')[0]);
      if (service.duration.includes('hour')) {
        totalMinutes += duration * 60;
      } else {
        totalMinutes += duration;
      }
    });
    
    return totalMinutes;
  };

  const totalDuration = calculateTotalDuration();

  // Generate time slots
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    const slotInterval = 30; // 30 minutes
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        
        const timeString = time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        // Check if slot can accommodate the total service duration
        const slotEndTime = new Date(time);
        slotEndTime.setMinutes(time.getMinutes() + totalDuration);
        
        // Skip if service would extend beyond business hours
        if (slotEndTime.getHours() >= endHour) {
          continue;
        }
        
        // Simulate some booked slots and conflicts
        const isBooked = Math.random() < 0.3; // 30% chance of being booked
        const hasConflict = Math.random() < 0.1; // 10% chance of conflict
        
        let conflictReason: string | undefined;
        if (hasConflict) {
          conflictReason = 'Overlaps with existing appointment';
        }
        
        slots.push({
          time: timeString,
          isAvailable: !isBooked && !hasConflict,
          isReserved: false,
          conflictReason,
        });
      }
    }
    
    return slots;
  };

  // Real-time availability checking
  const checkRealTimeAvailability = () => {
    setIsCheckingAvailability(true);
    
    // Simulate API call
    setTimeout(() => {
      const slots = generateTimeSlots();
      setAvailableSlots(slots);
      setIsCheckingAvailability(false);
    }, 1500);
  };

  // Reserve time slot (5-minute hold)
  const reserveTimeSlot = (timeString: string) => {
    const updatedSlots = availableSlots.map(slot => {
      if (slot.time === timeString) {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 5);
        return {
          ...slot,
          isReserved: true,
          reservationExpiry: expiry,
        };
      }
      return { ...slot, isReserved: false };
    });
    
    setAvailableSlots(updatedSlots);
    setReservedSlot(timeString);
    setReservationTimer(300); // 5 minutes in seconds
  };

  // Validate time selection
  const validateTimeSelection = (timeString: string) => {
    const errors: string[] = [];
    const slot = availableSlots.find(s => s.time === timeString);
    
    if (!slot) {
      errors.push('Invalid time slot selected');
      return errors;
    }
    
    if (!slot.isAvailable) {
      if (slot.conflictReason) {
        errors.push(slot.conflictReason);
      } else {
        errors.push('Time slot is no longer available');
      }
    }
    
    // Check if slot can accommodate all services
    const slotTime = new Date();
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    slotTime.setHours(hour24, minutes, 0, 0);
    
    const endTime = new Date(slotTime);
    endTime.setMinutes(slotTime.getMinutes() + totalDuration);
    
    if (endTime.getHours() >= 18) {
      errors.push('Selected services extend beyond business hours');
    }
    
    return errors;
  };

  const handleTimeSelect = (timeString: string) => {
    const errors = validateTimeSelection(timeString);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setSelectedTime(timeString);
      setBookingTime(timeString);
      reserveTimeSlot(timeString);
    } else {
      setSelectedTime(null);
      setBookingTime(null);
    }
  };

  const handleContinue = () => {
    if (!selectedTime) {
      Alert.alert('Time Required', 'Please select a time slot to continue.');
      return;
    }

    if (validationErrors.length > 0) {
      Alert.alert('Time Selection Error', validationErrors.join('\n'));
      return;
    }

    if (!reservedSlot || reservationTimer <= 0) {
      Alert.alert('Reservation Expired', 'Please select a time slot again.');
      return;
    }

    setIsLoading(true);
    
    // Simulate booking process
    setTimeout(() => {
      setIsLoading(false);
      router.push('/booking');
    }, 1000);
  };

  // Countdown timer for reservation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (reservationTimer > 0) {
      interval = setInterval(() => {
        setReservationTimer(prev => {
          if (prev <= 1) {
            setReservedSlot(null);
            setSelectedTime(null);
            // Release reservation
            const updatedSlots = availableSlots.map(slot => ({
              ...slot,
              isReserved: false,
              reservationExpiry: undefined,
            }));
            setAvailableSlots(updatedSlots);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [reservationTimer, availableSlots]);

  // Load availability on mount
  useEffect(() => {
    checkRealTimeAvailability();
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const availableSlotsCount = availableSlots.filter(slot => slot.isAvailable).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELECT TIME</Text>
        <TouchableOpacity onPress={checkRealTimeAvailability}>
          <RefreshCw color="#D4AF37" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{selectedProvider?.name}</Text>
          <Text style={styles.durationInfo}>
            Total Duration: {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AVAILABLE TIMES</Text>
            {!selectedTime && (
              <View style={styles.validationIndicator}>
                <AlertCircle color="#FF6B6B" size={16} />
                <Text style={styles.validationText}>Required</Text>
              </View>
            )}
          </View>

          {isCheckingAvailability ? (
            <View style={styles.loadingContainer}>
              <RefreshCw color="#D4AF37" size={24} />
              <Text style={styles.loadingText}>Checking real-time availability...</Text>
            </View>
          ) : (
            <>
              <View style={styles.availabilityInfo}>
                <Clock color="#D4AF37" size={16} />
                <Text style={styles.availabilityText}>
                  {availableSlotsCount} slots available
                </Text>
              </View>

              <View style={styles.timeSlotsContainer}>
                {availableSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  const isReservedByUser = reservedSlot === slot.time;
                  
                  return (
                    <TouchableOpacity
                      key={slot.time}
                      style={[
                        styles.timeSlot,
                        isSelected && styles.timeSlotSelected,
                        !slot.isAvailable && styles.timeSlotUnavailable,
                        isReservedByUser && styles.timeSlotReserved,
                      ]}
                      onPress={() => slot.isAvailable && handleTimeSelect(slot.time)}
                      disabled={!slot.isAvailable || isCheckingAvailability}
                      testID={`time-${slot.time}`}
                    >
                      <Text style={[
                        styles.timeText,
                        isSelected && styles.timeTextSelected,
                        !slot.isAvailable && styles.timeTextUnavailable,
                      ]}>
                        {slot.time}
                      </Text>
                      
                      {isReservedByUser && (
                        <View style={styles.reservedIndicator}>
                          <CheckCircle color="#10B981" size={12} />
                        </View>
                      )}
                      
                      {!slot.isAvailable && slot.conflictReason && (
                        <Text style={styles.conflictText}>
                          {slot.conflictReason}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {availableSlots.length === 0 && (
                <View style={styles.noSlotsContainer}>
                  <AlertCircle color="#FF6B6B" size={24} />
                  <Text style={styles.noSlotsText}>
                    No available time slots for the selected services duration
                  </Text>
                  <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={checkRealTimeAvailability}
                  >
                    <RefreshCw color="#D4AF37" size={16} />
                    <Text style={styles.refreshButtonText}>Refresh Availability</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* Reservation Timer */}
          {reservedSlot && reservationTimer > 0 && (
            <View style={styles.reservationContainer}>
              <View style={styles.reservationHeader}>
                <CheckCircle color="#10B981" size={16} />
                <Text style={styles.reservationTitle}>Slot Reserved</Text>
              </View>
              <Text style={styles.reservationText}>
                {reservedSlot} is held for you
              </Text>
              <Text style={styles.timerText}>
                Expires in: {formatTime(reservationTimer)}
              </Text>
            </View>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <View style={styles.errorContainer}>
              {validationErrors.map((error, index) => (
                <View key={`error-${index}`} style={styles.errorRow}>
                  <AlertCircle color="#FF6B6B" size={16} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Booking Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BOOKING NOTES</Text>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineText}>• Time slots are held for 5 minutes after selection</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineText}>• Availability updates in real-time</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineText}>• Please arrive 10 minutes early</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineText}>• Cancellations require 24-hour notice</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {selectedTime && (
          <View style={styles.selectedTimeContainer}>
            <Text style={styles.selectedTimeLabel}>Selected Time</Text>
            <Text style={styles.selectedTimeText}>{selectedTime}</Text>
            {reservationTimer > 0 && (
              <Text style={styles.expiryText}>
                Reserved for {formatTime(reservationTimer)}
              </Text>
            )}
          </View>
        )}
        
        <GradientButton
          title={isLoading ? "BOOKING..." : "CONTINUE TO DETAILS"}
          onPress={handleContinue}
          loading={isLoading}
          disabled={
            !selectedTime || 
            validationErrors.length > 0 || 
            !reservedSlot || 
            reservationTimer <= 0
          }
          testID="continue-button"
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backText: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  providerInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  providerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  durationInfo: {
    fontSize: 14,
    color: "#D4AF37",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    letterSpacing: 1,
  },
  validationIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  validationText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  availabilityInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  availabilityText: {
    fontSize: 14,
    color: "#D4AF37",
    fontWeight: "500",
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#333",
    minWidth: 100,
    alignItems: "center",
    position: "relative",
  },
  timeSlotSelected: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  timeSlotUnavailable: {
    backgroundColor: "#111",
    borderColor: "#222",
    opacity: 0.5,
  },
  timeSlotReserved: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "#10B981",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  timeTextSelected: {
    color: "#000",
  },
  timeTextUnavailable: {
    color: "#666",
  },
  reservedIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  conflictText: {
    fontSize: 10,
    color: "#FF6B6B",
    marginTop: 4,
    textAlign: "center",
  },
  noSlotsContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  noSlotsText: {
    fontSize: 14,
    color: "#FF6B6B",
    textAlign: "center",
    maxWidth: 250,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  refreshButtonText: {
    fontSize: 14,
    color: "#D4AF37",
    fontWeight: "500",
  },
  reservationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  reservationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  reservationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  reservationText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  timerText: {
    fontSize: 12,
    color: "#999",
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#FF6B6B",
    flex: 1,
  },
  guidelineItem: {
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  selectedTimeContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  selectedTimeLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  selectedTimeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#D4AF37",
  },
  expiryText: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 4,
  },
  continueButton: {
    width: "100%",
  },
});