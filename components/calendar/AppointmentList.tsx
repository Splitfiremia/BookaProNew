import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OptimizedFlatList } from '@/components/OptimizedFlatList';
import { usePerformanceMonitor } from '@/utils/performanceUtils';
import { COLORS, FONTS } from '@/constants/theme';

interface AppointmentWithColor {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  clientNotes?: string;
  color: string;
}

interface AppointmentListProps {
  selectedDate: string;
  appointments: AppointmentWithColor[];
}

// Memoized appointment item component for better performance
const AppointmentItem = memo<{ appointment: AppointmentWithColor }>(({ appointment }) => {
  return (
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
  );
});

AppointmentItem.displayName = 'AppointmentItem';

export const AppointmentList = memo<AppointmentListProps>(({ selectedDate, appointments }) => {
  const { renderCount } = usePerformanceMonitor('AppointmentList');
  console.log('AppointmentList: Rendering #', renderCount, 'with', appointments.length, 'appointments');

  // Memoize render item function
  const renderItem = useCallback(({ item }: { item: AppointmentWithColor }) => (
    <AppointmentItem appointment={item} />
  ), []);

  // Memoize key extractor
  const keyExtractor = useCallback((item: AppointmentWithColor) => item.id, []);

  if (appointments.length === 0) {
    return (
      <View style={styles.appointmentsList}>
        <Text style={styles.appointmentsTitle}>
          Appointments for {selectedDate}
        </Text>
        <Text style={styles.noAppointments}>No appointments for this date</Text>
      </View>
    );
  }

  return (
    <View style={styles.appointmentsList}>
      <Text style={styles.appointmentsTitle}>
        Appointments for {selectedDate}
      </Text>
      <OptimizedFlatList
        data={appointments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        itemHeight={80}
        estimatedItemSize={80}
        maxToRenderPerBatch={8}
        windowSize={8}
        removeClippedSubviews={true}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
});

AppointmentList.displayName = 'AppointmentList';

const styles = StyleSheet.create({
  appointmentsList: {
    padding: 16,
    maxHeight: 300,
    backgroundColor: COLORS.background,
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
    minHeight: 80,
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
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 16,
  },
});

export default AppointmentList;