import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { Calendar, Clock, AlertCircle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useBooking } from "@/providers/BookingProvider";
import { GradientButton } from "@/components/GradientButton";

// Move static data outside component to prevent re-renders
const HOLIDAYS = {
  "2024-12-25": "Christmas Day",
  "2024-01-01": "New Year's Day",
  "2024-07-04": "Independence Day",
  "2024-11-28": "Thanksgiving",
} as Record<string, string>;

// TypeScript interfaces
interface BusinessHours {
  day: string;
  isOpen: boolean;
  hours: string;
}

interface Provider {
  name: string;
  businessHours?: BusinessHours[];
}

interface DateItem {
  day: string;
  date: string;
  fullDate: string;
  isToday: boolean;
  isWeekend: boolean;
  isAvailable: boolean;
  isHoliday: boolean;
  holidayName?: string;
}

export default function CalendarSelectionScreen() {
  const { selectedProvider, selectedServices, setSelectedDate: setBookingDate } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<string | null>(null);

  // Stable holidays reference
  const holidays = useMemo(() => HOLIDAYS, []);

  // Generate calendar dates for current month - optimized with proper dependencies
  const generateCalendarDates = useCallback((): DateItem[] => {
    const dates: DateItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time for accurate comparison
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Add dates for the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0); // Normalize time
      const fullDate = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if provider is open on this day
      const businessHour = selectedProvider?.businessHours?.find((bh: BusinessHours) => bh.day === dayName);
      const isProviderOpen = businessHour?.isOpen || false;
      
      // Check if it's a past date (compare normalized dates)
      const isPastDate = date < today;
      
      // Check if it's a holiday
      const isHoliday = holidays[fullDate] !== undefined;
      
      // Determine availability
      const isAvailable = !isPastDate && isProviderOpen && !isHoliday;
      
      dates.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: day.toString(),
        fullDate,
        isToday: date.toDateString() === today.toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isAvailable,
        isHoliday,
        holidayName: holidays[fullDate],
      });
    }
    
    return dates;
  }, [currentMonth.getMonth(), currentMonth.getFullYear(), selectedProvider?.businessHours, holidays]);

  const dates = useMemo(() => generateCalendarDates(), [generateCalendarDates]);

  // Validate date selection
  const validateDateSelection = useCallback((dateString: string): string[] => {
    const errors: string[] = [];
    const selectedDateObj = dates.find(d => d.fullDate === dateString);
    
    if (!selectedDateObj) {
      errors.push('Invalid date selected');
      return errors;
    }
    
    if (!selectedDateObj.isAvailable) {
      if (selectedDateObj.isHoliday) {
        errors.push(`Provider is closed on ${selectedDateObj.holidayName}`);
      } else {
        const dayName = new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
        const businessHour = selectedProvider?.businessHours?.find((bh: BusinessHours) => bh.day === dayName);
        if (!businessHour?.isOpen) {
          errors.push(`Provider is closed on ${dayName}s`);
        } else {
          errors.push('This date is no longer available');
        }
      }
    }
    
    // Check if date is too far in advance (90 days)
    const selectedDate = new Date(dateString);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    maxDate.setHours(23, 59, 59, 999); // End of day
    
    if (selectedDate > maxDate) {
      errors.push('Bookings can only be made up to 90 days in advance');
    }
    
    return errors;
  }, [dates, selectedProvider]);

  // Debounced date selection handler
  const handleDateSelect = useCallback((dateString: string) => {
    if (isCheckingAvailability) return;
    
    setPendingSelection(dateString);
    setIsCheckingAvailability(true);
    
    const timeoutId = setTimeout(() => {
      const errors = validateDateSelection(dateString);
      setValidationErrors(errors);
      
      if (errors.length === 0) {
        setSelectedDate(dateString);
        setBookingDate(dateString);
      } else {
        setSelectedDate(null);
        setBookingDate(null);
        // Show immediate feedback for errors
        if (errors.length > 0) {
          Alert.alert('Date Unavailable', errors[0]);
        }
      }
      
      setIsCheckingAvailability(false);
      setPendingSelection(null);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [isCheckingAvailability, validateDateSelection, setBookingDate]);

  const handleContinue = async () => {
    if (!selectedDate) {
      Alert.alert('Date Required', 'Please select an available date to continue.');
      return;
    }

    if (validationErrors.length > 0) {
      Alert.alert('Date Selection Error', validationErrors.join('\n'));
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate validation process - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/booking/time-selection');
    } catch (error) {
      Alert.alert('Error', 'Failed to proceed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    
    // Don't allow going back before current month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const normalizedNewMonth = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
    const normalizedThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    if (normalizedNewMonth < normalizedThisMonth) {
      return;
    }
    
    // Don't allow going more than 3 months ahead
    const maxMonth = new Date();
    maxMonth.setMonth(today.getMonth() + 3);
    maxMonth.setHours(23, 59, 59, 999);
    
    if (newMonth > maxMonth) {
      return;
    }
    
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setBookingDate(null);
    setValidationErrors([]);
  }, [currentMonth, setBookingDate]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const normalizedCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const normalizedThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const canGoPrev = normalizedCurrentMonth > normalizedThisMonth;
  const maxMonth = new Date();
  maxMonth.setMonth(today.getMonth() + 3);
  maxMonth.setHours(23, 59, 59, 999);
  const canGoNext = currentMonth < maxMonth;

  // Accessibility labels
  const getDateAccessibilityLabel = useCallback((date: DateItem): string => {
    let label = `${date.date}, ${date.day}`;
    if (date.isToday) label += ', Today';
    if (date.isHoliday) label += `, Holiday: ${date.holidayName}`;
    if (!date.isAvailable) label += ', Unavailable';
    if (date.isAvailable) label += ', Available';
    return label;
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SELECT DATE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{selectedProvider?.name}</Text>
          <Text style={styles.serviceCount}>
            {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CHOOSE DATE</Text>
            {!selectedDate && (
              <View style={styles.validationIndicator}>
                <AlertCircle color="#FF6B6B" size={16} />
                <Text style={styles.validationText}>Required</Text>
              </View>
            )}
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={[styles.monthButton, !canGoPrev && styles.monthButtonDisabled]}
              onPress={() => navigateMonth('prev')}
              disabled={!canGoPrev}
              accessibilityLabel="Previous month"
              accessibilityRole="button"
            >
              <ChevronLeft color={canGoPrev ? "#D4AF37" : "#666"} size={24} />
            </TouchableOpacity>
            
            <View style={styles.monthDisplay}>
              <Calendar color="#D4AF37" size={20} />
              <Text style={styles.monthText}>{monthName}</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.monthButton, !canGoNext && styles.monthButtonDisabled]}
              onPress={() => navigateMonth('next')}
              disabled={!canGoNext}
              accessibilityLabel="Next month"
              accessibilityRole="button"
            >
              <ChevronRight color={canGoNext ? "#D4AF37" : "#666"} size={24} />
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarContainer}>
            {/* Day headers */}
            <View style={styles.dayHeaders}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <Text key={day} style={styles.dayHeader}>{day}</Text>
              ))}
            </View>

            {/* Calendar dates */}
            <View style={styles.datesGrid}>
              {dates.map((date) => {
                const isSelected = selectedDate === date.fullDate;
                const isDisabled = !date.isAvailable;
                const isPending = pendingSelection === date.fullDate;
                
                return (
                  <TouchableOpacity
                    key={date.fullDate}
                    style={[
                      styles.dateItem,
                      isSelected && styles.dateItemSelected,
                      isDisabled && styles.dateItemDisabled,
                      date.isToday && styles.dateItemToday,
                      date.isWeekend && !isDisabled && styles.dateItemWeekend,
                      date.isHoliday && styles.dateItemHoliday,
                      isPending && styles.dateItemPending,
                    ]}
                    onPress={() => !isDisabled && handleDateSelect(date.fullDate)}
                    disabled={isDisabled || isCheckingAvailability}
                    accessibilityLabel={getDateAccessibilityLabel(date)}
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: isDisabled,
                      selected: isSelected
                    }}
                    testID={`date-${date.fullDate}`}
                  >
                    <Text style={[
                      styles.dateText,
                      isSelected && styles.dateTextSelected,
                      isDisabled && styles.dateTextDisabled,
                      date.isToday && !isSelected && styles.dateTextToday,
                    ]}>
                      {date.date}
                    </Text>
                    
                    {date.isToday && !isSelected && (
                      <View style={styles.todayDot} />
                    )}
                    
                    {date.isHoliday && (
                      <View style={styles.holidayIndicator} />
                    )}
                    
                    {(isCheckingAvailability && isPending) && (
                      <View style={styles.loadingIndicator} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

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

          {/* Business Hours Display */}
          {selectedProvider?.businessHours && (
            <View style={styles.businessHoursContainer}>
              <Text style={styles.businessHoursTitle}>BUSINESS HOURS</Text>
              {selectedProvider.businessHours.map((hours: BusinessHours) => (
                <View key={hours.day} style={styles.businessHourRow}>
                  <Text style={[
                    styles.dayName,
                    !hours.isOpen && styles.closedDay
                  ]}>
                    {hours.day}
                  </Text>
                  <Text style={[
                    styles.hoursText,
                    !hours.isOpen && styles.closedHours
                  ]}>
                    {hours.isOpen ? hours.hours : 'Closed'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Legend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LEGEND</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#D4AF37" }]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#666" }]} />
              <Text style={styles.legendText}>Unavailable</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#FF6B6B" }]} />
              <Text style={styles.legendText}>Holiday</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {selectedDate && (
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateLabel}>Selected Date</Text>
            <Text style={styles.selectedDateText}>
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        )}
        
        <GradientButton
          title={isLoading ? "VALIDATING..." : "CONTINUE"}
          onPress={handleContinue}
          loading={isLoading}
          disabled={!selectedDate || validationErrors.length > 0 || isCheckingAvailability}
          testID="continue-button"
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

// Styles remain the same as your original
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
  headerSpacer: {
    width: 60,
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
  serviceCount: {
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
    marginBottom: 20,
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
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonDisabled: {
    opacity: 0.3,
  },
  monthDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  calendarContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
  },
  dayHeaders: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dateItem: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderRadius: 8,
    position: "relative",
  },
  dateItemSelected: {
    backgroundColor: "#D4AF37",
  },
  dateItemDisabled: {
    opacity: 0.3,
  },
  dateItemToday: {
    borderWidth: 2,
    borderColor: "#10B981",
  },
  dateItemWeekend: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  dateItemHoliday: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
  },
  dateItemPending: {
    backgroundColor: "rgba(212, 175, 55, 0.3)",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  dateTextSelected: {
    color: "#000",
    fontWeight: "bold",
  },
  dateTextDisabled: {
    color: "#666",
  },
  dateTextToday: {
    color: "#10B981",
    fontWeight: "bold",
  },
  todayDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10B981",
  },
  holidayIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF6B6B",
  },
  loadingIndicator: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(212, 175, 55, 0.3)",
    borderRadius: 8,
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
  businessHoursContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
  },
  businessHoursTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    letterSpacing: 1,
    marginBottom: 12,
  },
  businessHourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  dayName: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  closedDay: {
    color: "#666",
  },
  hoursText: {
    fontSize: 14,
    color: "#D4AF37",
  },
  closedHours: {
    color: "#666",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#999",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  selectedDateContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  selectedDateLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D4AF37",
  },
  continueButton: {
    width: "100%",
  },
});
  
  
      
    
       
      