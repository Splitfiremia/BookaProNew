import { 
  DayOfWeek, 
  TimeInterval, 
  DayAvailability, 
  ProviderAvailability, 
  AvailableTimeSlot,
  Appointment 
} from '@/models/database';

// Convert day name to DayOfWeek type
export const getDayOfWeek = (date: Date): DayOfWeek => {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

// Convert time string to minutes since midnight
export const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes since midnight to time string
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Check if two time intervals overlap
export const intervalsOverlap = (interval1: TimeInterval, interval2: TimeInterval): boolean => {
  const start1 = timeToMinutes(interval1.start);
  const end1 = timeToMinutes(interval1.end);
  const start2 = timeToMinutes(interval2.start);
  const end2 = timeToMinutes(interval2.end);
  
  return start1 < end2 && start2 < end1;
};

// Validate time intervals for a day
export const validateDayIntervals = (intervals: TimeInterval[]): { isValid: boolean; error?: string } => {
  // Check each interval is valid (start < end)
  for (const interval of intervals) {
    if (timeToMinutes(interval.start) >= timeToMinutes(interval.end)) {
      return { isValid: false, error: 'Start time must be before end time' };
    }
  }
  
  // Check for overlapping intervals
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      if (intervalsOverlap(intervals[i], intervals[j])) {
        return { isValid: false, error: 'Time intervals cannot overlap' };
      }
    }
  }
  
  return { isValid: true };
};

// Generate available time slots for a specific date
export const generateAvailableSlots = (
  date: Date,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[],
  serviceDuration: number = 30, // default 30 minutes
  slotInterval: number = 15 // generate slots every 15 minutes
): AvailableTimeSlot[] => {
  const dayOfWeek = getDayOfWeek(date);
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Find availability for this day
  const dayAvailability = providerAvailability.weeklySchedule.find(d => d.day === dayOfWeek);
  if (!dayAvailability || !dayAvailability.isEnabled) {
    return [];
  }
  
  const slots: AvailableTimeSlot[] = [];
  
  // Generate slots for each available interval
  for (const interval of dayAvailability.intervals) {
    const startMinutes = timeToMinutes(interval.start);
    const endMinutes = timeToMinutes(interval.end);
    
    // Generate slots every slotInterval minutes
    for (let currentMinutes = startMinutes; currentMinutes + serviceDuration <= endMinutes; currentMinutes += slotInterval) {
      const slotStart = minutesToTime(currentMinutes);
      const slotEnd = minutesToTime(currentMinutes + serviceDuration);
      
      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(appointment => {
        if (appointment.date !== dateString || appointment.status === 'cancelled') {
          return false;
        }
        
        const appointmentStart = timeToMinutes(appointment.startTime);
        const appointmentEnd = timeToMinutes(appointment.endTime);
        const slotStartMinutes = currentMinutes;
        const slotEndMinutes = currentMinutes + serviceDuration;
        
        return slotStartMinutes < appointmentEnd && appointmentStart < slotEndMinutes;
      });
      
      // Check if this slot conflicts with breaks
      const hasBreakConflict = providerAvailability.breaks?.some(breakDay => {
        if (breakDay.day !== dayOfWeek) return false;
        
        return breakDay.intervals.some(breakInterval => {
          const breakStart = timeToMinutes(breakInterval.start);
          const breakEnd = timeToMinutes(breakInterval.end);
          const slotStartMinutes = currentMinutes;
          const slotEndMinutes = currentMinutes + serviceDuration;
          
          return slotStartMinutes < breakEnd && breakStart < slotEndMinutes;
        });
      }) || false;
      
      slots.push({
        date: dateString,
        startTime: slotStart,
        endTime: slotEnd,
        duration: serviceDuration,
        isAvailable: !hasConflict && !hasBreakConflict,
        providerId: providerAvailability.providerId
      });
    }
  }
  
  return slots;
};

// Generate available slots for multiple days
export const generateAvailableSlotsForDateRange = (
  startDate: Date,
  endDate: Date,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[],
  serviceDuration: number = 30
): AvailableTimeSlot[] => {
  const slots: AvailableTimeSlot[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const daySlots = generateAvailableSlots(
      new Date(currentDate),
      providerAvailability,
      existingAppointments,
      serviceDuration
    );
    slots.push(...daySlots);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
};

// Create default availability template
export const createDefaultAvailability = (providerId: string): ProviderAvailability => {
  const defaultSchedule: DayAvailability[] = [
    { day: 'monday', isEnabled: true, intervals: [{ start: '09:00', end: '17:00' }] },
    { day: 'tuesday', isEnabled: true, intervals: [{ start: '09:00', end: '17:00' }] },
    { day: 'wednesday', isEnabled: true, intervals: [{ start: '09:00', end: '17:00' }] },
    { day: 'thursday', isEnabled: true, intervals: [{ start: '09:00', end: '17:00' }] },
    { day: 'friday', isEnabled: true, intervals: [{ start: '09:00', end: '17:00' }] },
    { day: 'saturday', isEnabled: true, intervals: [{ start: '09:00', end: '15:00' }] },
    { day: 'sunday', isEnabled: false, intervals: [] }
  ];
  
  return {
    id: `availability-${providerId}-${Date.now()}`,
    providerId,
    weeklySchedule: defaultSchedule,
    breaks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Check if a provider is available at a specific time
export const isProviderAvailable = (
  date: Date,
  startTime: string,
  endTime: string,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[]
): boolean => {
  const dayOfWeek = getDayOfWeek(date);
  const dateString = date.toISOString().split('T')[0];
  
  // Check if provider works on this day
  const dayAvailability = providerAvailability.weeklySchedule.find(d => d.day === dayOfWeek);
  if (!dayAvailability || !dayAvailability.isEnabled) {
    return false;
  }
  
  const requestedStart = timeToMinutes(startTime);
  const requestedEnd = timeToMinutes(endTime);
  
  // Check if requested time falls within any available interval
  const isWithinAvailableHours = dayAvailability.intervals.some(interval => {
    const intervalStart = timeToMinutes(interval.start);
    const intervalEnd = timeToMinutes(interval.end);
    return requestedStart >= intervalStart && requestedEnd <= intervalEnd;
  });
  
  if (!isWithinAvailableHours) {
    return false;
  }
  
  // Check for conflicts with existing appointments
  const hasAppointmentConflict = existingAppointments.some(appointment => {
    if (appointment.date !== dateString || appointment.status === 'cancelled') {
      return false;
    }
    
    const appointmentStart = timeToMinutes(appointment.startTime);
    const appointmentEnd = timeToMinutes(appointment.endTime);
    
    return requestedStart < appointmentEnd && appointmentStart < requestedEnd;
  });
  
  if (hasAppointmentConflict) {
    return false;
  }
  
  // Check for conflicts with breaks
  const hasBreakConflict = providerAvailability.breaks?.some(breakDay => {
    if (breakDay.day !== dayOfWeek) return false;
    
    return breakDay.intervals.some(breakInterval => {
      const breakStart = timeToMinutes(breakInterval.start);
      const breakEnd = timeToMinutes(breakInterval.end);
      
      return requestedStart < breakEnd && breakStart < requestedEnd;
    });
  }) || false;
  
  return !hasBreakConflict;
};

// Format time for display (12-hour format)
export const formatTimeForDisplay = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Parse 12-hour time to 24-hour format
export const parseDisplayTime = (displayTime: string): string => {
  const [time, period] = displayTime.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};