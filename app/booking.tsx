import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Check, CreditCard, DollarSign, Clock, AlertCircle, Calendar, Flashlight } from "lucide-react-native";
import { useBooking } from "@/providers/BookingProvider";
import { useAppointments } from "@/providers/AppointmentProvider";
import { FormInput } from "@/components/FormInput";
import { GradientButton } from "@/components/GradientButton";
import { validateForm, ValidationRules, ValidationErrors, required, phoneNumber, formatPhoneNumber, email, specialRequests } from "@/utils/validation";

export default function BookingScreen() {
  const { selectedProvider, selectedServices, setSelectedServices, selectedDate, selectedTime, setSelectedDate, setSelectedTime } = useBooking();
  const { requestAppointment } = useAppointments();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    email: "",
    specialRequests: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [smsUpdates, setSmsUpdates] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"inShop" | "applePay" | "cashApp" | "card">("inShop");
  const [recurring, setRecurring] = useState<"never" | "weekly" | "biweekly" | "monthly">("never");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);
  
  // Validation rules
  const validationRules: ValidationRules = {
    phoneNumber: [required, phoneNumber],
    email: [required, email],
    specialRequests: [specialRequests],
  };

  // Real-time availability checking
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [conflictingAppointments, setConflictingAppointments] = useState<string[]>([]);
  
  // Handle input changes
  const handleChange = (field: string, value: string) => {
    if (field === "phoneNumber") {
      value = formatPhoneNumber(value);
    }
    setFormData({ ...formData, [field]: value });
    const fieldError = validateForm({ ...formData, [field]: value }, { [field]: validationRules[field] });
    setErrors({ ...errors, [field]: fieldError[field] });
  };

  // Generate dates for the next 30 days (excluding past dates)
  const generateAvailableDates = () => {
    const dates: Array<{ day: string; date: string; fullDate: string; isToday: boolean; isWeekend: boolean; }> = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date < today) continue;
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const businessHour = selectedProvider?.businessHours?.find((bh: any) => bh.day === dayName);
      if (businessHour?.isOpen) {
        dates.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
          date: date.getDate().toString(),
          fullDate: date.toISOString().split('T')[0],
          isToday: i === 0,
          isWeekend: date.getDay() === 0 || date.getDay() === 6
        });
      }
    }
    return dates;
  };

  // Check real-time availability for selected date
  const checkAvailability = async (date: string) => {
    if (!date || !selectedProvider) return;
    setIsCheckingAvailability(true);
    setTimeout(() => {
      const businessHour = selectedProvider.businessHours?.find((bh: any) => 
        bh.day === new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
      );
      if (!businessHour?.isOpen) {
        setAvailableSlots([]);
        setIsCheckingAvailability(false);
        return;
      }
      const slots: string[] = [];
      const startHour = 9; // 9 AM
      const endHour = 18; // 6 PM
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = new Date();
          time.setHours(hour, minute, 0, 0);
          const selectedDateObj = new Date(date);
          const now = new Date();
          if (selectedDateObj.toDateString() === now.toDateString() && time <= now) {
            continue;
          }
          const timeString = time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          const isBooked = Math.random() < 0.3;
          if (!isBooked) {
            slots.push(timeString);
          }
        }
      }
      setAvailableSlots(slots);
      setIsCheckingAvailability(false);
    }, 600);
  };

  // Calculate total duration and check for conflicts
  const calculateDurationAndConflicts = () => {
    if (!selectedProvider?.services || selectedServices.length === 0) {
      return { totalDuration: 0, conflicts: [] };
    }
    const selectedServiceObjects = selectedProvider.services.filter(service => 
      selectedServices.includes(service.id)
    );
    let totalMinutes = 0;
    const conflicts: string[] = [];
    selectedServiceObjects.forEach(service => {
      const duration = parseInt(service.duration.split(' ')[0]);
      if (service.duration.includes('hour')) {
        totalMinutes += duration * 60;
      } else {
        totalMinutes += duration;
      }
    });
    if (totalMinutes > 300) {
      conflicts.push('Total service time exceeds maximum booking duration (5 hours)');
    }
    if (selectedTime && selectedDate) {
      const [time, period] = selectedTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let startHour = hours;
      if (period === 'PM' && hours !== 12) startHour += 12;
      if (period === 'AM' && hours === 12) startHour = 0;
      const endTime = new Date();
      endTime.setHours(startHour, minutes + totalMinutes, 0, 0);
      if (endTime.getHours() >= 18) {
        conflicts.push('Selected services extend beyond business hours');
      }
    }
    return { totalDuration: totalMinutes, conflicts };
  };

  const { totalDuration, conflicts } = calculateDurationAndConflicts();

  useEffect(() => {
    setConflictingAppointments(conflicts);
  }, [conflicts, selectedServices, selectedTime, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate);
    }
  }, [selectedDate, selectedProvider]);

  const dates = useMemo(() => generateAvailableDates(), [selectedProvider]);

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const calculateTotal = () => {
    if (!selectedProvider?.services) return 0;
    return selectedProvider.services
      .filter(service => selectedServices.includes(service.id))
      .reduce((total, service) => total + service.price, 0);
  };

  const pickNextAvailable = () => {
    if (availableSlots.length > 0) {
      setSelectedTime(availableSlots[0]);
    }
  };

  const handleBook = async () => {
    const formErrors = validateForm(formData, validationRules);
    setErrors(formErrors);
    const hasErrors = Object.values(formErrors).some(error => error !== null);
    const bookingErrors: string[] = [];
    if (selectedServices.length === 0) bookingErrors.push('Please select at least one service');
    if (!selectedDate) bookingErrors.push('Please select a date');
    if (!selectedTime) bookingErrors.push('Please select a time');
    if (conflictingAppointments.length > 0) bookingErrors.push(...conflictingAppointments);
    if (selectedTime && !availableSlots.includes(selectedTime)) bookingErrors.push('Selected time slot is no longer available');
    if (hasErrors || bookingErrors.length > 0) {
      if (bookingErrors.length > 0) Alert.alert('Booking Error', bookingErrors.join('\n'));
      return;
    }

    try {
      setIsSubmitting(true);
      const price = calculateTotal();
      const baseAppointment = {
        clientId: 'client-1', // In real app, this would come from auth
        providerId: selectedProvider?.id ?? 'provider-unknown',
        serviceId: selectedServices[0] ?? 'service-unknown',
        shopId: 'shop-1', // In real app, this would come from selected provider's shop
        date: selectedDate ?? '',
        time: selectedTime ?? '',
        startTime: selectedTime ?? '',
        endTime: selectedTime ?? '', // Will be calculated based on duration
        duration: totalDuration,
        paymentStatus: 'pending' as const,
        totalAmount: price,
        serviceAmount: price,
        notes: formData.specialRequests,
      };

      const createdIds: string[] = [];
      const createForDate = async (dateStr: string) => {
        const created = await requestAppointment(baseAppointment);
        createdIds.push(created.id);
      };

      await createForDate(selectedDate!);

      if (recurring !== 'never') {
        const occurrences = 3;
        const addDays = recurring === 'weekly' ? 7 : recurring === 'biweekly' ? 14 : 30;
        let cursor = new Date(selectedDate!);
        for (let i = 0; i < occurrences; i++) {
          cursor = new Date(cursor.getTime() + addDays * 24 * 60 * 60 * 1000);
          await createForDate(cursor.toISOString().split('T')[0]);
        }
      }

      router.push({ pathname: "/appointment-details", params: { id: createdIds[0] ?? 'new', status: 'confirmed' } });
    } catch (e) {
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const NoAvailability = () => (
    <View style={styles.noSlotsContainer}>
      <AlertCircle color="#FF6B6B" size={20} />
      <Text style={styles.noSlotsText}>No available time slots for this date</Text>
      <TouchableOpacity 
        style={[styles.waitlistButton, joinedWaitlist && styles.waitlistButtonJoined]}
        onPress={() => setJoinedWaitlist(true)}
        disabled={joinedWaitlist}
        testID="join-waitlist"
      >
        <Text style={[styles.waitlistText, joinedWaitlist && styles.waitlistTextJoined]}>
          {joinedWaitlist ? 'Added to Waitlist' : 'Join Waitlist'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>CANCEL</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BOOK APPOINTMENT</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{selectedProvider?.name}</Text>
          <Text style={styles.shopName}>{selectedProvider?.shopName}</Text>
          <Text style={styles.address}>{selectedProvider?.address}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SELECT SERVICES</Text>
            {selectedServices.length === 0 && (
              <View style={styles.validationIndicator}>
                <AlertCircle color="#FF6B6B" size={16} />
                <Text style={styles.validationText}>Required</Text>
              </View>
            )}
          </View>
          {selectedProvider?.services?.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceItem,
                selectedServices.includes(service.id) && styles.serviceItemSelected
              ]}
              onPress={() => toggleService(service.id)}
              testID={`service-${service.id}`}
            >
              <View style={[
                styles.checkbox,
                selectedServices.includes(service.id) && styles.checkboxSelected
              ]}>
                {selectedServices.includes(service.id) && (
                  <Check color="#000" size={16} />
                )}
              </View>
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDuration}>{service.duration}</Text>
              </View>
              <Text style={styles.servicePrice}>${service.price}</Text>
            </TouchableOpacity>
          ))}
          
          {selectedServices.length > 0 && (
            <View style={styles.durationSummary}>
              <Clock color="#D4AF37" size={16} />
              <Text style={styles.durationText}>
                Total Duration: {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
              </Text>
            </View>
          )}
          
          {conflictingAppointments.length > 0 && (
            <View style={styles.conflictWarning}>
              <AlertCircle color="#FF6B6B" size={16} />
              <Text style={styles.conflictText}>
                {conflictingAppointments[0]}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SELECT DATE & TIME</Text>
            {(!selectedDate || !selectedTime) && (
              <View style={styles.validationIndicator}>
                <AlertCircle color="#FF6B6B" size={16} />
                <Text style={styles.validationText}>Required</Text>
              </View>
            )}
          </View>
          
          <View style={styles.monthHeader}>
            <Calendar color="#D4AF37" size={16} />
            <Text style={styles.monthText}>NEXT 30 DAYS</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.datesContainer}
          >
            {dates.map((date) => {
              const isPastDate = new Date(date.fullDate) < new Date();
              return (
                <TouchableOpacity
                  key={`date-${date.fullDate}`}
                  style={[
                    styles.dateItem,
                    selectedDate === date.fullDate && styles.dateItemSelected,
                    isPastDate && styles.dateItemDisabled,
                    date.isToday && styles.dateItemToday
                  ]}
                  onPress={() => !isPastDate && setSelectedDate(date.fullDate)}
                  disabled={isPastDate}
                  testID={`date-${date.fullDate}`}
                >
                  <Text style={[
                    styles.dayText,
                    selectedDate === date.fullDate && styles.dateTextSelected,
                    isPastDate && styles.dateTextDisabled
                  ]}>
                    {date.day}
                  </Text>
                  <Text style={[
                    styles.dateText,
                    selectedDate === date.fullDate && styles.dateTextSelected,
                    isPastDate && styles.dateTextDisabled
                  ]}>
                    {date.date}
                  </Text>
                  {date.isToday && (
                    <Text style={styles.todayLabel}>TODAY</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedDate && (
            <View style={styles.timeSection}>
              {isCheckingAvailability ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Checking availability...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.timeHeaderRow}>
                    <Text style={styles.timeSectionTitle}>
                      Available Times ({availableSlots.length} slots)
                    </Text>
                    <TouchableOpacity style={styles.nextAvailableButton} onPress={pickNextAvailable} disabled={availableSlots.length === 0}>
                      <Flashlight color={availableSlots.length === 0 ? '#666' : '#0EA5E9'} size={16} />
                      <Text style={styles.nextAvailableText}>Next Available</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.timeSlotsContainer}>
                    {availableSlots.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeSlot,
                          selectedTime === time && styles.timeSlotSelected
                        ]}
                        onPress={() => setSelectedTime(time)}
                        testID={`time-${time}`}
                      >
                        <Text style={[
                          styles.timeText,
                          selectedTime === time && styles.timeTextSelected
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {availableSlots.length === 0 && (
                    <NoAvailability />
                  )}
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECURRING</Text>
          <View style={styles.recurringOptions}>
            {["never", "weekly", "biweekly", "monthly"].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.recurringOption,
                  recurring === option && styles.recurringOptionSelected
                ]}
                onPress={() => setRecurring(option as any)}
              >
                <Text style={[
                  styles.recurringText,
                  recurring === option && styles.recurringTextSelected
                ]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT INFORMATION</Text>
          
          <FormInput
            label="PHONE NUMBER"
            value={formData.phoneNumber}
            onChangeText={(value) => handleChange("phoneNumber", value)}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
            error={errors.phoneNumber}
            testID="booking-phone-input"
          />
          
          <FormInput
            label="EMAIL ADDRESS"
            value={formData.email}
            onChangeText={(value) => handleChange("email", value)}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            testID="booking-email-input"
          />
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>SPECIAL REQUESTS (OPTIONAL)</Text>
            <TextInput
              style={[
                styles.textArea,
                errors.specialRequests && styles.textAreaError
              ]}
              value={formData.specialRequests}
              onChangeText={(value) => handleChange("specialRequests", value)}
              placeholder="Any special requests or notes for your stylist..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              maxLength={500}
              testID="booking-special-requests"
            />
            <View style={styles.characterCount}>
              <Text style={[
                styles.characterCountText,
                formData.specialRequests.length > 450 && styles.characterCountWarning
              ]}>
                {formData.specialRequests.length}/500
              </Text>
            </View>
            {errors.specialRequests && (
              <Text style={styles.errorText}>{errors.specialRequests}</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.smsContainer}
            onPress={() => setSmsUpdates(!smsUpdates)}
          >
            <View style={[styles.checkbox, smsUpdates && styles.checkboxSelected]}>
              {smsUpdates && <Check color="#000" size={16} />}
            </View>
            <Text style={styles.smsText}>
              By checking this box, you agree to receive SMS appointment updates from A2Z Calendar. 
              Message & data rates may apply.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT</Text>
          
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "inShop" && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod("inShop")}
          >
            <View style={[styles.radio, paymentMethod === "inShop" && styles.radioSelected]} />
            <DollarSign color="#999" size={20} />
            <Text style={styles.paymentText}>In Shop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "applePay" && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod("applePay")}
          >
            <View style={[styles.radio, paymentMethod === "applePay" && styles.radioSelected]} />
            <Text style={styles.paymentText}>Apple Pay</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "cashApp" && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod("cashApp")}
          >
            <View style={[styles.radio, paymentMethod === "cashApp" && styles.radioSelected]} />
            <Text style={styles.paymentText}>Cash App Pay</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "card" && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod("card")}
          >
            <View style={[styles.radio, paymentMethod === "card" && styles.radioSelected]} />
            <CreditCard color="#999" size={20} />
            <Text style={styles.paymentText}>Credit/Debit Card</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.totalText}>${calculateTotal()}</Text>
        <GradientButton
          title={isSubmitting ? "BOOKING..." : "BOOK APPOINTMENT"}
          onPress={handleBook}
          loading={isSubmitting}
          disabled={
            !selectedServices.length || 
            !selectedDate || 
            !selectedTime || 
            !formData.phoneNumber || 
            !formData.email ||
            conflictingAppointments.length > 0 ||
            (selectedTime ? !availableSlots.includes(selectedTime) : false)
          }
          testID="booking-button"
          style={styles.bookButton}
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
  cancelText: {
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
  shopName: {
    fontSize: 16,
    color: "#D4AF37",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    letterSpacing: 1,
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: "#D4AF37",
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  monthHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  timeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nextAvailableButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#0EA5E9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  nextAvailableText: {
    color: "#0EA5E9",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  waitlistButton: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D4AF37",
    backgroundColor: "#1a1a1a",
  },
  waitlistButtonJoined: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  waitlistText: {
    color: "#D4AF37",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  waitlistTextJoined: {
    color: "#10B981",
  },
  monthText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    letterSpacing: 1,
  },
  datesContainer: {
    marginBottom: 20,
  },
  dateItem: {
    width: 60,
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
  },
  dateItemSelected: {
    backgroundColor: "#D4AF37",
  },
  dayText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  dateTextSelected: {
    color: "#000",
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  timeSlotSelected: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  timeText: {
    fontSize: 14,
    color: "#fff",
  },
  timeTextSelected: {
    color: "#000",
    fontWeight: "600",
  },
  recurringOptions: {
    flexDirection: "row",
    gap: 10,
  },
  recurringOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  recurringOptionSelected: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  recurringText: {
    fontSize: 14,
    color: "#fff",
  },
  recurringTextSelected: {
    color: "#000",
    fontWeight: "600",
  },

  smsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  smsText: {
    flex: 1,
    fontSize: 12,
    color: "#999",
    lineHeight: 18,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  paymentOptionSelected: {
    opacity: 1,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D4AF37",
    marginRight: 12,
  },
  radioSelected: {
    borderWidth: 6,
  },
  paymentText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  totalText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 16,
  },
  bookButton: {
    flex: 1,
  },
  headerSpacer: {
    width: 60,
  },
  
  // New validation and enhanced styles
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  serviceItemSelected: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  durationSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 8,
    gap: 8,
  },
  durationText: {
    fontSize: 14,
    color: "#D4AF37",
    fontWeight: "500",
  },
  conflictWarning: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 8,
    gap: 8,
  },
  conflictText: {
    fontSize: 14,
    color: "#FF6B6B",
    flex: 1,
  },
  dateItemDisabled: {
    opacity: 0.4,
    backgroundColor: "#111",
  },
  dateItemToday: {
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  dateTextDisabled: {
    color: "#444",
  },
  todayLabel: {
    fontSize: 8,
    color: "#D4AF37",
    fontWeight: "bold",
    marginTop: 2,
  },
  timeSection: {
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  timeSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D4AF37",
    marginBottom: 12,
  },
  noSlotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  noSlotsText: {
    fontSize: 14,
    color: "#FF6B6B",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    letterSpacing: 1,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#333",
  },
  textAreaError: {
    borderColor: "#FF6B6B",
  },
  characterCount: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  characterCountText: {
    fontSize: 12,
    color: "#666",
  },
  characterCountWarning: {
    color: "#FF6B6B",
  },
  errorText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginTop: 4,
  },
});