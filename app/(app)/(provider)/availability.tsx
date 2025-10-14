import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Alert,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Clock, ChevronLeft, Save, Plus, X, Edit3, Copy, AlertCircle } from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAvailability } from '@/providers/AvailabilityProvider';
import { DayOfWeek, TimeInterval } from '@/models/database';
import { formatTimeForDisplay, timeToMinutes } from '@/utils/availability';

interface TimePickerState {
  visible: boolean;
  day: DayOfWeek;
  intervalIndex: number;
  type: 'start' | 'end';
  currentTime: Date;
}

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const timeStringToDate = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const dateToTimeString = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};

export default function AvailabilityScreen() {
  const { action } = useLocalSearchParams();
  const isRescheduling = action === 'reschedule';
  const insets = useSafeAreaInsets();
  
  const {
    availability,
    isLoading,
    hasUnsavedChanges,
    toggleDayEnabled,
    addTimeInterval,
    removeTimeInterval,
    updateTimeInterval,
    copyDaySchedule,
    saveAvailability,
    validateAvailability,
    getConstrainedIntervalsForDay
  } = useAvailability();
  
  const [timePicker, setTimePicker] = useState<TimePickerState>({
    visible: false,
    day: 'monday',
    intervalIndex: 0,
    type: 'start',
    currentTime: new Date(),
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Validate on availability changes
  useEffect(() => {
    if (availability) {
      const validation = validateAvailability();
      setValidationErrors(validation.errors);
    }
  }, [availability, validateAvailability]);
  
  const handleToggleDay = (day: DayOfWeek) => {
    toggleDayEnabled(day);
  };
  
  const handleAddInterval = (day: DayOfWeek) => {
    const daySchedule = availability?.weeklySchedule.find(d => d.day === day);
    if (!daySchedule) return;
    
    const lastInterval = daySchedule.intervals[daySchedule.intervals.length - 1];
    const newStartTime = lastInterval ? addHours(lastInterval.end, 1) : '09:00';
    const newEndTime = addHours(newStartTime, 4); // 4 hour default block
    
    const newInterval: TimeInterval = {
      start: newStartTime,
      end: newEndTime
    };
    
    addTimeInterval(day, newInterval);
  };
  
  const addHours = (timeString: string, hours: number): string => {
    const [h, m] = timeString.split(':').map(Number);
    const newHour = Math.min(23, h + hours);
    return `${newHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  const handleRemoveInterval = (day: DayOfWeek, intervalIndex: number) => {
    const daySchedule = availability?.weeklySchedule.find(d => d.day === day);
    if (!daySchedule) return;
    
    if (daySchedule.intervals.length === 1) {
      Alert.alert('Cannot Remove', 'You must have at least one time interval when the day is enabled.');
      return;
    }
    
    removeTimeInterval(day, intervalIndex);
  };
  
  const handleEditTime = (day: DayOfWeek, intervalIndex: number, type: 'start' | 'end') => {
    const daySchedule = availability?.weeklySchedule.find(d => d.day === day);
    if (!daySchedule || !daySchedule.intervals[intervalIndex]) return;
    
    const interval = daySchedule.intervals[intervalIndex];
    const currentTime = timeStringToDate(type === 'start' ? interval.start : interval.end);
    
    setTimePicker({
      visible: true,
      day,
      intervalIndex,
      type,
      currentTime,
    });
  };
  
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setTimePicker(prev => ({ ...prev, visible: false }));
    }
    
    if (selectedDate) {
      const newTimeString = dateToTimeString(selectedDate);
      const daySchedule = availability?.weeklySchedule.find(d => d.day === timePicker.day);
      
      if (daySchedule && daySchedule.intervals[timePicker.intervalIndex]) {
        const currentInterval = daySchedule.intervals[timePicker.intervalIndex];
        const updatedInterval: TimeInterval = {
          ...currentInterval,
          [timePicker.type]: newTimeString
        };
        
        updateTimeInterval(timePicker.day, timePicker.intervalIndex, updatedInterval);
      }
      
      if (Platform.OS === 'ios') {
        setTimePicker(prev => ({ ...prev, currentTime: selectedDate }));
      }
    }
  };
  
  const closePicker = () => {
    setTimePicker(prev => ({ ...prev, visible: false }));
  };
  

  
  const handleSave = async () => {
    if (validationErrors.length > 0) {
      Alert.alert('Validation Error', validationErrors.join('\n'));
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await saveAvailability();
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Your availability has been saved successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                if (isRescheduling) {
                  router.back();
                } else {
                  router.push('/(app)/(provider)/(tabs)/schedule');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.errors?.join('\n') || 'Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert('Error', 'Failed to save availability');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };
  
  const handleCopySchedule = (fromDay: DayOfWeek, toDay: DayOfWeek) => {
    copyDaySchedule(fromDay, toDay);
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading availability...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!availability) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Failed to load availability</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ChevronLeft size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isRescheduling ? 'Reschedule Appointment' : 'Set Availability'}
        </Text>
        
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size={24} color={COLORS.primary} />
          ) : (
            <Save size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>
      
      {isRescheduling && (
        <View style={styles.rescheduleInfo}>
          <Text style={styles.rescheduleText}>
            Select new available times for this appointment
          </Text>
        </View>
      )}
      
      {validationErrors.length > 0 && (
        <View style={styles.validationErrorContainer}>
          <AlertCircle size={20} color={COLORS.error} />
          <Text style={styles.validationErrorText}>
            {validationErrors.join(', ')}
          </Text>
        </View>
      )}
      
      <View style={styles.scheduleContainer}>
        {DAYS.map(({ key: day, label }) => {
          const daySchedule = availability.weeklySchedule.find(d => d.day === day);
          if (!daySchedule) return null;
          
          return (
            <View key={day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{label}</Text>
                <Switch
                  value={daySchedule.isEnabled}
                  onValueChange={() => handleToggleDay(day)}
                  trackColor={{ false: '#333', true: COLORS.primary }}
                  thumbColor={daySchedule.isEnabled ? '#fff' : '#666'}
                />
              </View>
              
              {daySchedule.isEnabled && (
                <View style={styles.slotsContainer}>
                  {daySchedule.intervals.map((interval, index) => (
                    <View key={index} style={styles.slotRow}>
                      <View style={styles.timeSlotContainer}>
                        <TouchableOpacity
                          style={styles.timeButton}
                          onPress={() => handleEditTime(day, index, 'start')}
                        >
                          <Clock size={14} color={COLORS.primary} />
                          <Text style={styles.timeText}>{formatTimeForDisplay(interval.start)}</Text>
                          <Edit3 size={12} color={COLORS.primary} />
                        </TouchableOpacity>
                        
                        <Text style={styles.timeSeparator}>to</Text>
                        
                        <TouchableOpacity
                          style={styles.timeButton}
                          onPress={() => handleEditTime(day, index, 'end')}
                        >
                          <Clock size={14} color={COLORS.primary} />
                          <Text style={styles.timeText}>{formatTimeForDisplay(interval.end)}</Text>
                          <Edit3 size={12} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity
                        onPress={() => handleRemoveInterval(day, index)}
                        style={styles.removeSlotButton}
                      >
                        <X size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  <View style={styles.slotActions}>
                    <TouchableOpacity
                      style={styles.addSlotButton}
                      onPress={() => handleAddInterval(day)}
                    >
                      <Plus size={16} color={COLORS.primary} />
                      <Text style={styles.addSlotText}>Add Time Block</Text>
                    </TouchableOpacity>
                    
                    {day !== 'monday' && (
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={() => handleCopySchedule('monday', day)}
                      >
                        <Copy size={14} color={COLORS.secondary} />
                        <Text style={styles.copyButtonText}>Copy Monday</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton, 
            hasUnsavedChanges && styles.saveButtonActive,
            (isSaving || validationErrors.length > 0) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={isSaving || validationErrors.length > 0}
        >
          {isSaving ? (
            <ActivityIndicator size={20} color="#000" style={styles.saveIcon} />
          ) : (
            <Save size={20} color="#000" style={styles.saveIcon} />
          )}
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : isRescheduling ? 'Confirm Reschedule' : 'Save Availability'}
          </Text>
        </TouchableOpacity>
        
        {hasUnsavedChanges && (
          <Text style={styles.unsavedText}>You have unsaved changes</Text>
        )}
      </View>
      
      {/* Time Picker Modal */}
      {timePicker.visible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={timePicker.visible}
          onRequestClose={closePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Select {timePicker.type === 'start' ? 'Start' : 'End'} Time
                </Text>
                <TouchableOpacity onPress={closePicker}>
                  <X size={24} color="#000000" />
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={timePicker.currentTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={styles.timePicker}
                textColor="#000000"
                themeVariant="light"
              />
              
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={closePicker}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  rescheduleInfo: {
    backgroundColor: `${COLORS.info}20`,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  rescheduleText: {
    fontSize: 14,
    color: COLORS.info,
    textAlign: 'center',
  },
  scheduleContainer: {
    paddingHorizontal: 16,
  },
  dayCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  slotsContainer: {
    marginTop: 8,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  timeText: {
    fontSize: 14,
    color: COLORS.text,
    marginHorizontal: 6,
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 14,
    color: COLORS.secondary,
    marginHorizontal: 12,
  },
  removeSlotButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: COLORS.error + '20',
  },
  slotActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 6,
  },
  addSlotText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 6,
  },
  copyButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  copyButtonText: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  saveButton: {
    backgroundColor: COLORS.primary + '60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonActive: {
    backgroundColor: COLORS.primary,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  unsavedText: {
    fontSize: 12,
    color: COLORS.warning,
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  timePicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  validationErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  validationErrorText: {
    fontSize: 14,
    color: COLORS.error,
    marginLeft: 8,
    flex: 1,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.primary + '30',
    opacity: 0.6,
  },
});