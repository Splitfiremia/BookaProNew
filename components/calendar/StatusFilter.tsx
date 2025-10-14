import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppointmentStatus } from '@/models/database';
import { APPOINTMENT_COLORS } from '@/providers/AppointmentProvider';

interface StatusFilterProps {
  selectedStatuses: AppointmentStatus[];
  onStatusToggle: (status: AppointmentStatus) => void;
}

const statusOptions: { status: AppointmentStatus; label: string }[] = [
  { status: 'requested', label: 'Requested' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'completed', label: 'Completed' },
  { status: 'cancelled', label: 'Cancelled' },
  { status: 'no-show', label: 'No-show' },
  { status: 'rescheduled', label: 'Rescheduled' },
];

export const StatusFilter: React.FC<StatusFilterProps> = ({ 
  selectedStatuses, 
  onStatusToggle 
}) => {
  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filter by Status:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {statusOptions.map(({ status, label }) => {
          const isSelected = selectedStatuses.includes(status);
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? APPOINTMENT_COLORS[status] : '#f0f0f0',
                  borderColor: APPOINTMENT_COLORS[status],
                }
              ]}
              onPress={() => onStatusToggle(status)}
              testID={`filter-${status}`}
            >
              <Text style={[
                styles.filterChipText,
                { color: isSelected ? '#fff' : '#333' }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
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
  },
});