import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useAppointments } from '@/providers/AppointmentProvider';
import { AppointmentStatus } from '@/models/database';
import { StatusFilter } from '@/components/calendar/StatusFilter';
import { AppointmentList } from '@/components/calendar/AppointmentList';

interface AppointmentCalendarProps {
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  onDateSelect,
  selectedDate
}) => {
  const { getAppointmentsWithColors } = useAppointments();
  const [selectedStatuses, setSelectedStatuses] = useState<AppointmentStatus[]>([
    'requested', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'
  ]);

  const appointmentsWithColors = getAppointmentsWithColors();

  // Filter appointments based on selected statuses
  const filteredAppointments = useMemo(() => {
    return appointmentsWithColors.filter(apt => selectedStatuses.includes(apt.status));
  }, [appointmentsWithColors, selectedStatuses]);

  // Create marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: { [key: string]: any } = {};

    // Group appointments by date
    const appointmentsByDate = filteredAppointments.reduce((acc, apt) => {
      if (!acc[apt.date]) {
        acc[apt.date] = [];
      }
      acc[apt.date].push(apt);
      return acc;
    }, {} as { [key: string]: typeof filteredAppointments });

    // Mark dates with appointments
    Object.keys(appointmentsByDate).forEach(date => {
      const dayAppointments = appointmentsByDate[date];
      const dots = dayAppointments.slice(0, 3).map(apt => ({
        color: apt.color,
        selectedDotColor: apt.color,
      }));

      marked[date] = {
        dots,
        selected: date === selectedDate,
        selectedColor: date === selectedDate ? '#2196F3' : undefined,
      };
    });

    // Mark selected date even if no appointments
    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#2196F3',
      };
    }

    return marked;
  }, [filteredAppointments, selectedDate]);

  const handleStatusToggle = (status: AppointmentStatus) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleDayPress = (day: DateData) => {
    onDateSelect?.(day.dateString);
  };

  // Get appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    return filteredAppointments.filter(apt => apt.date === selectedDate);
  }, [filteredAppointments, selectedDate]);

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
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#2196F3',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#2196F3',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          arrowColor: '#2196F3',
          disabledArrowColor: '#d9e1e8',
          monthTextColor: '#2d4150',
          indicatorColor: '#2196F3',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13
        }}
      />

      {selectedDate && (
        <AppointmentList
          selectedDate={selectedDate}
          appointments={selectedDateAppointments}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default AppointmentCalendar;