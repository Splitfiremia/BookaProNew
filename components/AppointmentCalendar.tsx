import React, { useState, useMemo, memo, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, InteractionManager } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useAppointments, APPOINTMENT_COLORS } from '@/providers/AppointmentProvider';
import { AppointmentStatus } from '@/models/database';
import { useDebounce, useThrottle, usePerformanceMonitor } from '@/utils/performanceUtils';
import { OptimizedFlatList } from '@/components/OptimizedFlatList';

import { COLORS, FONTS } from '@/constants/theme';

interface AppointmentCalendarProps {
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

interface StatusFilterProps {
  selectedStatuses: AppointmentStatus[];
  onStatusToggle: (status: AppointmentStatus) => void;
}

// Memoized status filter chip component
const StatusFilterChip = memo<{
  status: AppointmentStatus;
  label: string;
  isSelected: boolean;
  onToggle: (status: AppointmentStatus) => void;
}>(({ status, label, isSelected, onToggle }) => {
  const handlePress = useCallback(() => onToggle(status), [status, onToggle]);
  
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected ? APPOINTMENT_COLORS[status] : COLORS.glass.background,
          borderColor: APPOINTMENT_COLORS[status],
        }
      ]}
      onPress={handlePress}
      testID={`filter-${status}`}
    >
      <Text style={[
        styles.filterChipText,
        { color: isSelected ? COLORS.background : COLORS.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

StatusFilterChip.displayName = 'StatusFilterChip';

const StatusFilter = memo<StatusFilterProps>(({ selectedStatuses, onStatusToggle }) => {
  const statusOptions = useMemo(() => [
    { status: 'requested' as AppointmentStatus, label: 'Requested' },
    { status: 'confirmed' as AppointmentStatus, label: 'Confirmed' },
    { status: 'in-progress' as AppointmentStatus, label: 'In Progress' },
    { status: 'completed' as AppointmentStatus, label: 'Completed' },
    { status: 'cancelled' as AppointmentStatus, label: 'Cancelled' },
    { status: 'no-show' as AppointmentStatus, label: 'No-show' },
    { status: 'rescheduled' as AppointmentStatus, label: 'Rescheduled' },
  ], []);

  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filter by Status:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterScroll}
        removeClippedSubviews={true}
      >
        {statusOptions.map(({ status, label }) => (
          <StatusFilterChip
            key={status}
            status={status}
            label={label}
            isSelected={selectedStatuses.includes(status)}
            onToggle={onStatusToggle}
          />
        ))}
      </ScrollView>
    </View>
  );
});

StatusFilter.displayName = 'StatusFilter';

// Memoized appointment item component
const AppointmentItem = memo<{
  appointment: {
    id: string;
    startTime: string;
    endTime: string;
    clientNotes?: string;
    status: AppointmentStatus;
    color: string;
  };
}>(({ appointment }) => (
  <View style={styles.appointmentItem}>
    <View style={[
      styles.statusIndicator, 
      { backgroundColor: appointment.color }
    ]} />
    <View style={styles.appointmentDetails}>
      <Text style={styles.appointmentTime}>
        {appointment.startTime} - {appointment.endTime}
      </Text>
      <Text style={styles.appointmentService}>
        {appointment.clientNotes ?? 'Service appointment'}
      </Text>
      <Text style={styles.appointmentStatus}>
        Status: {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
      </Text>
    </View>
  </View>
));

AppointmentItem.displayName = 'AppointmentItem';

export const AppointmentCalendar = memo<AppointmentCalendarProps>(({
  onDateSelect,
  selectedDate
}) => {
  const { renderCount } = usePerformanceMonitor('AppointmentCalendar');
  console.log('AppointmentCalendar: Rendering #', renderCount);
  
  const { getAppointmentsWithColors } = useAppointments();
  const [isCalendarReady, setIsCalendarReady] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<AppointmentStatus[]>([
    'requested', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'
  ]);
  const markedDatesCache = useRef<{ [key: string]: any }>({});
  const lastAppointmentsHash = useRef<string>('');

  // Initialize calendar after interactions complete
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setIsCalendarReady(true);
    });
    return () => task.cancel();
  }, []);

  // Memoize appointments data with deep comparison to prevent unnecessary recalculations
  const appointmentsWithColors = useMemo(() => {
    const appointments = getAppointmentsWithColors();
    const appointmentsHash = JSON.stringify(appointments.map(apt => ({ id: apt.id, date: apt.date, status: apt.status })));
    
    // Only update if appointments actually changed
    if (appointmentsHash !== lastAppointmentsHash.current) {
      lastAppointmentsHash.current = appointmentsHash;
      console.log('AppointmentCalendar: Appointments data updated');
    }
    
    return appointments;
  }, [getAppointmentsWithColors]);

  // Filter appointments based on selected statuses
  const filteredAppointments = useMemo(() => {
    return appointmentsWithColors.filter(apt => selectedStatuses.includes(apt.status));
  }, [appointmentsWithColors, selectedStatuses]);

  // Create marked dates for calendar with aggressive caching
  const markedDates = useMemo(() => {
    const cacheKey = `${JSON.stringify(selectedStatuses)}_${selectedDate}_${lastAppointmentsHash.current}`;
    
    // Return cached result if available
    if (markedDatesCache.current[cacheKey]) {
      console.log('AppointmentCalendar: Using cached marked dates');
      return markedDatesCache.current[cacheKey];
    }

    console.log('AppointmentCalendar: Computing marked dates');
    const marked: { [key: string]: any } = {};

    // Group appointments by date using Map for better performance
    const appointmentsByDate = new Map<string, typeof filteredAppointments>();
    
    // Use for loop for better performance than forEach
    for (let i = 0; i < filteredAppointments.length; i++) {
      const apt = filteredAppointments[i];
      if (!apt || !apt.date) continue;
      
      const existing = appointmentsByDate.get(apt.date);
      if (existing) {
        existing.push(apt);
      } else {
        appointmentsByDate.set(apt.date, [apt]);
      }
    }

    // Mark dates with appointments - limit to 3 dots for performance
    for (const [date, dayAppointments] of appointmentsByDate) {
      const dots = dayAppointments.slice(0, 3).map(apt => ({
        color: apt.color,
        selectedDotColor: apt.color,
      }));

      marked[date] = {
        dots,
        selected: date === selectedDate,
        selectedColor: date === selectedDate ? COLORS.primary : undefined,
      };
    }

    // Mark selected date even if no appointments
    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: COLORS.primary,
      };
    }

    // Cache the result
    markedDatesCache.current[cacheKey] = marked;
    
    // Clean old cache entries to prevent memory leaks
    const cacheKeys = Object.keys(markedDatesCache.current);
    if (cacheKeys.length > 10) {
      const oldestKey = cacheKeys[0];
      delete markedDatesCache.current[oldestKey];
    }

    return marked;
  }, [filteredAppointments, selectedDate, selectedStatuses]);

  // Debounce status toggle to prevent rapid re-renders
  const handleStatusToggleImmediate = useCallback((status: AppointmentStatus) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  }, []);
  
  const handleStatusToggle = useDebounce(handleStatusToggleImmediate, 150);

  // Throttle day press to prevent rapid calendar updates
  const handleDayPressImmediate = useCallback((day: DateData) => {
    onDateSelect?.(day.dateString);
  }, [onDateSelect]);
  
  const handleDayPress = useThrottle(handleDayPressImmediate, 100);

  // Get appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    return filteredAppointments.filter(apt => apt.date === selectedDate);
  }, [filteredAppointments, selectedDate]);

  // Memoize calendar theme to prevent recreation
  const calendarTheme = useMemo(() => ({
    backgroundColor: COLORS.background,
    calendarBackground: COLORS.background,
    textSectionTitleColor: COLORS.secondary,
    selectedDayBackgroundColor: COLORS.primary,
    selectedDayTextColor: COLORS.background,
    todayTextColor: COLORS.primary,
    dayTextColor: COLORS.text,
    textDisabledColor: COLORS.secondary,
    dotColor: COLORS.primary,
    selectedDotColor: COLORS.background,
    arrowColor: COLORS.primary,
    disabledArrowColor: COLORS.secondary,
    monthTextColor: COLORS.text,
    indicatorColor: COLORS.primary,
    textDayFontFamily: FONTS.regular,
    textMonthFontFamily: FONTS.bold,
    textDayHeaderFontFamily: FONTS.regular,
    textDayFontWeight: '300' as const,
    textMonthFontWeight: 'bold' as const,
    textDayHeaderFontWeight: '300' as const,
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 13
  }), []);

  // Render appointment item for FlatList
  const renderAppointmentItem = useCallback(({ item }: { item: any }) => (
    <AppointmentItem appointment={item} />
  ), []);

  const keyExtractor = useCallback((item: any) => item.id, []);

  if (!isCalendarReady) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusFilter 
        selectedStatuses={selectedStatuses} 
        onStatusToggle={handleStatusToggle} 
      />
      
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType={'multi-dot'}
        theme={calendarTheme}
        // Performance optimizations
        enableSwipeMonths={true}
        hideExtraDays={true}
        disableMonthChange={false}
        firstDay={1}
        showWeekNumbers={false}
        disableArrowLeft={false}
        disableArrowRight={false}
        disableAllTouchEventsForDisabledDays={true}
      />

      {selectedDate && (
        <View style={styles.appointmentsList}>
          <Text style={styles.appointmentsTitle}>
            Appointments for {selectedDate}
          </Text>
          {selectedDateAppointments.length === 0 ? (
            <Text style={styles.noAppointments}>No appointments for this date</Text>
          ) : (
            <OptimizedFlatList
              data={selectedDateAppointments}
              renderItem={renderAppointmentItem}
              keyExtractor={keyExtractor}
              estimatedItemSize={80}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={true}
              style={styles.appointmentsFlatList}
            />
          )}
        </View>
      )}
    </View>
  );
});

AppointmentCalendar.displayName = 'AppointmentCalendar';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.regular,
  },
  appointmentsList: {
    padding: 16,
    maxHeight: 300,
    backgroundColor: COLORS.background,
  },
  appointmentsFlatList: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  appointmentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  noAppointments: {
    fontSize: 14,
    color: COLORS.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: FONTS.regular,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  appointmentService: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  appointmentStatus: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
});

export default AppointmentCalendar;