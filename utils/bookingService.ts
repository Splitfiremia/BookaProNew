import { 
  ProviderAvailability, 
  AvailableTimeSlot, 
  Appointment,
  DayOfWeek,
  AppointmentStatus,
  AppointmentStatusChange,
  APPOINTMENT_STATE_TRANSITIONS,
  APPOINTMENT_PERMISSIONS,
  UserRole
} from '@/models/database';
import { 
  generateAvailableSlots, 
  generateAvailableSlotsForDateRange,
  isProviderAvailable
} from '@/utils/availability';

/**
 * TheCut-style Appointment State Machine Service
 * Handles all appointment status transitions with proper validation
 */
export class AppointmentStateMachine {
  /**
   * Validates if a status transition is allowed
   */
  static canTransition(fromStatus: AppointmentStatus, toStatus: AppointmentStatus): boolean {
    const allowedTransitions = APPOINTMENT_STATE_TRANSITIONS[fromStatus];
    return allowedTransitions.includes(toStatus);
  }

  /**
   * Validates if a user role can perform a specific action
   */
  static canPerformAction(
    action: keyof typeof APPOINTMENT_PERMISSIONS, 
    userRole: UserRole
  ): boolean {
    const allowedRoles = APPOINTMENT_PERMISSIONS[action];
    return allowedRoles.includes(userRole);
  }

  /**
   * Gets all possible next states for a given appointment status
   */
  static getNextStates(currentStatus: AppointmentStatus): AppointmentStatus[] {
    return APPOINTMENT_STATE_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Gets available actions for a user role and appointment status
   */
  static getAvailableActions(
    currentStatus: AppointmentStatus, 
    userRole: UserRole
  ): Array<{
    action: keyof typeof APPOINTMENT_PERMISSIONS;
    targetStatus: AppointmentStatus;
    label: string;
    requiresReason: boolean;
  }> {
    const actions: Array<{
      action: keyof typeof APPOINTMENT_PERMISSIONS;
      targetStatus: AppointmentStatus;
      label: string;
      requiresReason: boolean;
    }> = [];

    const nextStates = this.getNextStates(currentStatus);

    // Map status transitions to actions
    nextStates.forEach(targetStatus => {
      switch (targetStatus) {
        case 'confirmed':
          if (this.canPerformAction('confirm', userRole)) {
            actions.push({
              action: 'confirm',
              targetStatus: 'confirmed',
              label: 'Confirm Appointment',
              requiresReason: false
            });
          }
          break;
        case 'in-progress':
          if (this.canPerformAction('start', userRole)) {
            actions.push({
              action: 'start',
              targetStatus: 'in-progress',
              label: 'Start Service',
              requiresReason: false
            });
          }
          break;
        case 'completed':
          if (this.canPerformAction('complete', userRole)) {
            actions.push({
              action: 'complete',
              targetStatus: 'completed',
              label: 'Complete Service',
              requiresReason: false
            });
          }
          break;
        case 'cancelled':
          if (this.canPerformAction('cancel', userRole)) {
            actions.push({
              action: 'cancel',
              targetStatus: 'cancelled',
              label: 'Cancel Appointment',
              requiresReason: true
            });
          }
          break;
        case 'no-show':
          if (this.canPerformAction('mark_no_show', userRole)) {
            actions.push({
              action: 'mark_no_show',
              targetStatus: 'no-show',
              label: 'Mark No-Show',
              requiresReason: true
            });
          }
          break;
        case 'rescheduled':
          if (this.canPerformAction('reschedule', userRole)) {
            actions.push({
              action: 'reschedule',
              targetStatus: 'rescheduled',
              label: 'Reschedule',
              requiresReason: false
            });
          }
          break;
      }
    });

    return actions;
  }

  /**
   * Creates a status change record with proper validation
   */
  static createStatusChange(
    appointmentId: string,
    fromStatus: AppointmentStatus | null,
    toStatus: AppointmentStatus,
    changedBy: string,
    changedByRole: UserRole,
    action: keyof typeof APPOINTMENT_PERMISSIONS,
    reason?: string,
    metadata?: Record<string, any>
  ): AppointmentStatusChange {
    return {
      id: `status-change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      appointmentId,
      fromStatus,
      toStatus,
      changedBy,
      changedByRole,
      action,
      reason,
      metadata,
      timestamp: new Date().toISOString(),
      clientNotified: false,
      providerNotified: false
    };
  }

  /**
   * Validates an appointment transition request
   */
  static validateTransition(
    appointment: Appointment,
    newStatus: AppointmentStatus,
    userRole: UserRole,
    action: keyof typeof APPOINTMENT_PERMISSIONS
  ): { valid: boolean; error?: string } {
    // Check if transition is allowed by state machine
    if (!this.canTransition(appointment.status, newStatus)) {
      return {
        valid: false,
        error: `Cannot transition from ${appointment.status} to ${newStatus}`
      };
    }

    // Check if user has permission for this action
    if (!this.canPerformAction(action, userRole)) {
      return {
        valid: false,
        error: `User role ${userRole} cannot perform action ${action}`
      };
    }

    return { valid: true };
  }

  /**
   * Gets appointment color based on status (for UI)
   */
  static getStatusColor(status: AppointmentStatus): string {
    const colors = {
      'requested': '#FFC107',    // Yellow - pending
      'confirmed': '#2196F3',    // Blue - confirmed
      'in-progress': '#FF9800',  // Orange - active
      'completed': '#4CAF50',    // Green - done
      'cancelled': '#F44336',    // Red - cancelled
      'no-show': '#9E9E9E',      // Grey - no show
      'rescheduled': '#9C27B0'   // Purple - rescheduled
    };
    
    return colors[status] || '#666666';
  }

  /**
   * Gets user-friendly status text
   */
  static getStatusText(status: AppointmentStatus): string {
    const texts = {
      'requested': 'Requested',
      'confirmed': 'Confirmed',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no-show': 'No Show',
      'rescheduled': 'Rescheduled'
    };
    
    return texts[status] || 'Unknown';
  }
}

// Reservation system types
export interface SlotReservation {
  id: string;
  providerId: string;
  shopId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  clientId: string;
  serviceId: string;
  expiresAt: string; // ISO timestamp
  createdAt: string;
}

export interface ReservationResult {
  success: boolean;
  reservationId?: string;
  expiresAt?: string;
  error?: string;
}

export interface ConfirmationResult {
  success: boolean;
  appointmentId?: string;
  error?: string;
}

// In-memory storage for active reservations (in production, use Redis or similar)
let activeReservations: SlotReservation[] = [];

// Mock appointments for testing with new data structure
let mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: 'client-1',
    providerId: 'provider-1',
    serviceId: 'service-1',
    shopId: 'shop-1',
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    status: 'confirmed',
    paymentStatus: 'paid',
    serviceAmount: 45,
    tipAmount: 0,
    taxAmount: 4.05,
    totalAmount: 49.05,
    reminderSent: false,
    confirmationSent: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    statusHistory: []
  },
  {
    id: '2',
    clientId: 'client-2',
    providerId: 'provider-1',
    serviceId: 'service-2',
    shopId: 'shop-1',
    date: '2024-01-15',
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    status: 'confirmed',
    paymentStatus: 'paid',
    serviceAmount: 68,
    tipAmount: 0,
    taxAmount: 6.12,
    totalAmount: 74.12,
    reminderSent: false,
    confirmationSent: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    statusHistory: []
  }
];

/**
 * Get available time slots for a provider on a specific date
 */
export const getProviderAvailableSlots = (
  providerId: string,
  date: Date,
  serviceDuration: number,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments
): AvailableTimeSlot[] => {
  console.log('BookingService: Getting available slots for provider', providerId, 'on', date.toDateString());
  
  // Filter appointments for this provider and date
  const providerAppointments = existingAppointments.filter(
    apt => apt.providerId === providerId && apt.status !== 'cancelled'
  );
  
  return generateAvailableSlots(
    date,
    providerAvailability,
    providerAppointments,
    serviceDuration,
    15 // 15-minute intervals
  );
};

/**
 * Get available time slots for a provider over a date range
 */
export const getProviderAvailableSlotsRange = (
  providerId: string,
  startDate: Date,
  endDate: Date,
  serviceDuration: number,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments
): AvailableTimeSlot[] => {
  console.log('BookingService: Getting available slots for provider', providerId, 'from', startDate.toDateString(), 'to', endDate.toDateString());
  
  // Filter appointments for this provider
  const providerAppointments = existingAppointments.filter(
    apt => apt.providerId === providerId && apt.status !== 'cancelled'
  );
  
  return generateAvailableSlotsForDateRange(
    startDate,
    endDate,
    providerAvailability,
    providerAppointments,
    serviceDuration
  );
};

/**
 * Check if a provider can take an appointment at a specific time
 */
export const canProviderTakeAppointment = (
  providerId: string,
  date: Date,
  startTime: string,
  endTime: string,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments
): boolean => {
  console.log('BookingService: Checking if provider', providerId, 'can take appointment on', date.toDateString(), 'from', startTime, 'to', endTime);
  
  // Filter appointments for this provider
  const providerAppointments = existingAppointments.filter(
    apt => apt.providerId === providerId && apt.status !== 'cancelled'
  );
  
  return isProviderAvailable(
    date,
    startTime,
    endTime,
    providerAvailability,
    providerAppointments
  );
};

/**
 * Get the next available slot for a provider
 */
export const getNextAvailableSlot = (
  providerId: string,
  serviceDuration: number,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments,
  startFromDate: Date = new Date()
): AvailableTimeSlot | null => {
  console.log('BookingService: Finding next available slot for provider', providerId);
  
  // Look ahead up to 30 days
  const endDate = new Date(startFromDate);
  endDate.setDate(endDate.getDate() + 30);
  
  const availableSlots = getProviderAvailableSlotsRange(
    providerId,
    startFromDate,
    endDate,
    serviceDuration,
    providerAvailability,
    existingAppointments
  );
  
  // Return the first available slot
  const nextSlot = availableSlots.find(slot => slot.isAvailable);
  
  if (nextSlot) {
    console.log('BookingService: Next available slot found:', nextSlot.date, nextSlot.startTime);
  } else {
    console.log('BookingService: No available slots found in the next 30 days');
  }
  
  return nextSlot || null;
};

/**
 * Get available slots grouped by date
 */
export const getAvailableSlotsByDate = (
  providerId: string,
  startDate: Date,
  endDate: Date,
  serviceDuration: number,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments
): Record<string, AvailableTimeSlot[]> => {
  console.log('BookingService: Getting available slots grouped by date');
  
  const slots = getProviderAvailableSlotsRange(
    providerId,
    startDate,
    endDate,
    serviceDuration,
    providerAvailability,
    existingAppointments
  );
  
  // Group slots by date
  const slotsByDate: Record<string, AvailableTimeSlot[]> = {};
  
  slots.forEach(slot => {
    if (!slotsByDate[slot.date]) {
      slotsByDate[slot.date] = [];
    }
    slotsByDate[slot.date].push(slot);
  });
  
  return slotsByDate;
};

/**
 * Get provider's working days for the current week
 */
export const getProviderWorkingDays = (
  providerAvailability: ProviderAvailability
): DayOfWeek[] => {
  return providerAvailability.weeklySchedule
    .filter(day => day.isEnabled && day.intervals.length > 0)
    .map(day => day.day);
};

/**
 * Check if provider works on a specific day of the week
 */
export const doesProviderWorkOnDay = (
  dayOfWeek: DayOfWeek,
  providerAvailability: ProviderAvailability
): boolean => {
  const daySchedule = providerAvailability.weeklySchedule.find(d => d.day === dayOfWeek);
  return daySchedule ? daySchedule.isEnabled && daySchedule.intervals.length > 0 : false;
};

/**
 * Get provider's earliest and latest working hours for a day
 */
export const getProviderWorkingHours = (
  dayOfWeek: DayOfWeek,
  providerAvailability: ProviderAvailability
): { earliest: string; latest: string } | null => {
  const daySchedule = providerAvailability.weeklySchedule.find(d => d.day === dayOfWeek);
  
  if (!daySchedule || !daySchedule.isEnabled || daySchedule.intervals.length === 0) {
    return null;
  }
  
  const intervals = daySchedule.intervals;
  const earliest = intervals.reduce((min, interval) => 
    interval.start < min ? interval.start : min, intervals[0].start
  );
  const latest = intervals.reduce((max, interval) => 
    interval.end > max ? interval.end : max, intervals[0].end
  );
  
  return { earliest, latest };
};

/**
 * Calculate total working hours per week for a provider
 */
export const calculateWeeklyWorkingHours = (
  providerAvailability: ProviderAvailability
): number => {
  let totalMinutes = 0;
  
  providerAvailability.weeklySchedule.forEach(daySchedule => {
    if (daySchedule.isEnabled) {
      daySchedule.intervals.forEach(interval => {
        const [startHours, startMinutes] = interval.start.split(':').map(Number);
        const [endHours, endMinutes] = interval.end.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        totalMinutes += endTotalMinutes - startTotalMinutes;
      });
    }
  });
  
  return totalMinutes / 60; // Convert to hours
};

// ============================================================================
// REACT QUERY MUTATIONS FOR RESERVATION SYSTEM
// ============================================================================

/**
 * React Query mutation options for slot reservation
 */
export const useReserveSlotMutation = () => {
  // This would typically use React Query's useMutation
  // For now, we'll return the function directly
  return {
    mutate: checkAndReserveSlot,
    mutateAsync: async (params: Parameters<typeof checkAndReserveSlot>[0] extends string ? Parameters<typeof checkAndReserveSlot> : never) => {
      return checkAndReserveSlot(...params);
    }
  };
};

/**
 * React Query mutation options for confirming reservation
 */
export const useConfirmReservationMutation = () => {
  return {
    mutate: confirmReservation,
    mutateAsync: async (reservationId: string, paymentData: Parameters<typeof confirmReservation>[1]) => {
      return confirmReservation(reservationId, paymentData);
    }
  };
};

// ============================================================================
// SLOT RESERVATION SYSTEM - Prevents Double Booking
// ============================================================================

/**
 * Clean up expired reservations
 */
const cleanupExpiredReservations = (): void => {
  const now = new Date().toISOString();
  const initialCount = activeReservations.length;
  
  activeReservations = activeReservations.filter(reservation => {
    const isExpired = reservation.expiresAt < now;
    if (isExpired) {
      console.log('BookingService: Cleaning up expired reservation:', reservation.id);
    }
    return !isExpired;
  });
  
  const cleanedCount = initialCount - activeReservations.length;
  if (cleanedCount > 0) {
    console.log(`BookingService: Cleaned up ${cleanedCount} expired reservations`);
  }
};

/**
 * Check if a time slot conflicts with existing appointments or reservations
 */
const hasTimeConflict = (
  providerId: string,
  date: string,
  startTime: string,
  endTime: string,
  existingAppointments: Appointment[] = mockAppointments
): boolean => {
  // Clean up expired reservations first
  cleanupExpiredReservations();
  
  // Check against confirmed appointments (exclude cancelled, completed, no-show)
  const appointmentConflict = existingAppointments.some(apt => {
    if (apt.providerId !== providerId || apt.date !== date) return false;
    if (['cancelled', 'no-show', 'completed'].includes(apt.status)) return false;
    
    // Check for time overlap
    const aptStart = apt.startTime;
    const aptEnd = apt.endTime;
    
    return (
      (startTime >= aptStart && startTime < aptEnd) ||
      (endTime > aptStart && endTime <= aptEnd) ||
      (startTime <= aptStart && endTime >= aptEnd)
    );
  });
  
  // Check against active reservations
  const reservationConflict = activeReservations.some(reservation => {
    if (reservation.providerId !== providerId || reservation.date !== date) return false;
    
    // Check for time overlap
    return (
      (startTime >= reservation.startTime && startTime < reservation.endTime) ||
      (endTime > reservation.startTime && endTime <= reservation.endTime) ||
      (startTime <= reservation.startTime && endTime >= reservation.endTime)
    );
  });
  
  return appointmentConflict || reservationConflict;
};

/**
 * Check and reserve a time slot for booking
 * This prevents double-booking by temporarily holding the slot
 */
export const checkAndReserveSlot = (
  providerId: string,
  shopId: string,
  date: string, // Format: "YYYY-MM-DD"
  startTime: string, // Format: "HH:MM"
  duration: number, // Duration in minutes
  clientId: string,
  serviceId: string,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments
): ReservationResult => {
  console.log('BookingService: Attempting to reserve slot for provider', providerId, 'on', date, 'at', startTime);
  
  // Calculate end time
  const [hours, minutes] = startTime.split(':').map(Number);
  const endDate = new Date();
  endDate.setHours(hours, minutes + duration, 0, 0);
  const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  
  // Check if provider is available at this time (basic availability check)
  const dateObj = new Date(date);
  const isAvailable = canProviderTakeAppointment(
    providerId,
    dateObj,
    startTime,
    endTime,
    providerAvailability,
    existingAppointments
  );
  
  if (!isAvailable) {
    console.log('BookingService: Provider not available at requested time');
    return {
      success: false,
      error: 'Provider is not available at the requested time'
    };
  }
  
  // Check for conflicts with existing appointments and reservations
  if (hasTimeConflict(providerId, date, startTime, endTime, existingAppointments)) {
    console.log('BookingService: Time slot conflicts with existing appointment or reservation');
    return {
      success: false,
      error: 'This time slot is no longer available'
    };
  }
  
  // Create reservation
  const reservationId = `reservation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
  
  const reservation: SlotReservation = {
    id: reservationId,
    providerId,
    shopId,
    date,
    startTime,
    endTime,
    duration,
    clientId,
    serviceId,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString()
  };
  
  activeReservations.push(reservation);
  
  console.log('BookingService: Slot reserved successfully:', reservationId, 'expires at', expiresAt.toISOString());
  
  return {
    success: true,
    reservationId,
    expiresAt: expiresAt.toISOString()
  };
};

/**
 * Confirm a reservation and create the actual appointment
 */
export const confirmReservation = (
  reservationId: string,
  paymentData: {
    totalAmount: number;
    serviceAmount: number;
    tipAmount?: number;
    paymentMethod: string;
  }
): ConfirmationResult => {
  console.log('BookingService: Attempting to confirm reservation:', reservationId);
  
  // Clean up expired reservations first
  cleanupExpiredReservations();
  
  // Find the reservation
  const reservationIndex = activeReservations.findIndex(r => r.id === reservationId);
  
  if (reservationIndex === -1) {
    console.log('BookingService: Reservation not found or expired:', reservationId);
    return {
      success: false,
      error: 'Reservation not found or has expired. Please try booking again.'
    };
  }
  
  const reservation = activeReservations[reservationIndex];
  
  // Check if reservation has expired
  const now = new Date().toISOString();
  if (reservation.expiresAt < now) {
    console.log('BookingService: Reservation has expired:', reservationId);
    // Remove expired reservation
    activeReservations.splice(reservationIndex, 1);
    return {
      success: false,
      error: 'Reservation has expired. Please try booking again.'
    };
  }
  
  // Create the actual appointment with new data structure
  const appointmentId = `appointment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const taxAmount = Math.round(paymentData.serviceAmount * 0.09 * 100) / 100; // 9% tax
  
  const appointment: Appointment = {
    id: appointmentId,
    clientId: reservation.clientId,
    providerId: reservation.providerId,
    serviceId: reservation.serviceId,
    shopId: reservation.shopId,
    date: reservation.date,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    duration: reservation.duration,
    status: 'requested', // Start as requested, not confirmed
    paymentStatus: 'paid',
    serviceAmount: paymentData.serviceAmount,
    tipAmount: paymentData.tipAmount || 0,
    taxAmount,
    totalAmount: paymentData.totalAmount,
    reminderSent: false,
    confirmationSent: false,
    createdAt: now,
    updatedAt: now,
    statusHistory: [AppointmentStateMachine.createStatusChange(
      appointmentId,
      null,
      'requested',
      reservation.clientId,
      'client',
      'request',
      'Payment completed and appointment requested'
    )]
  };
  
  // Add appointment to mock data
  mockAppointments.push(appointment);
  
  // Remove the reservation
  activeReservations.splice(reservationIndex, 1);
  
  console.log('BookingService: Appointment confirmed successfully:', appointmentId);
  
  return {
    success: true,
    appointmentId
  };
};

/**
 * Release a reservation manually (e.g., when user cancels)
 */
export const releaseReservation = (reservationId: string): boolean => {
  console.log('BookingService: Releasing reservation:', reservationId);
  
  const reservationIndex = activeReservations.findIndex(r => r.id === reservationId);
  
  if (reservationIndex === -1) {
    console.log('BookingService: Reservation not found:', reservationId);
    return false;
  }
  
  activeReservations.splice(reservationIndex, 1);
  console.log('BookingService: Reservation released successfully');
  return true;
};

/**
 * Get reservation details by ID
 */
export const getReservation = (reservationId: string): SlotReservation | null => {
  cleanupExpiredReservations();
  return activeReservations.find(r => r.id === reservationId) || null;
};

/**
 * Get all active reservations (for debugging)
 */
export const getActiveReservations = (): SlotReservation[] => {
  cleanupExpiredReservations();
  return [...activeReservations];
};

/**
 * Calculate remaining time for a reservation in seconds
 */
export const getReservationTimeRemaining = (reservationId: string): number => {
  const reservation = getReservation(reservationId);
  if (!reservation) return 0;
  
  const now = new Date().getTime();
  const expiresAt = new Date(reservation.expiresAt).getTime();
  const remainingMs = expiresAt - now;
  
  return Math.max(0, Math.floor(remainingMs / 1000));
};

/**
 * Enhanced availability check that includes active reservations
 */
export const getProviderAvailableSlotsWithReservations = (
  providerId: string,
  date: Date,
  serviceDuration: number,
  providerAvailability: ProviderAvailability,
  existingAppointments: Appointment[] = mockAppointments
): AvailableTimeSlot[] => {
  console.log('BookingService: Getting available slots with reservation check for provider', providerId);
  
  // Clean up expired reservations
  cleanupExpiredReservations();
  
  // Get base available slots
  const baseSlots = getProviderAvailableSlots(
    providerId,
    date,
    serviceDuration,
    providerAvailability,
    existingAppointments
  );
  
  const dateStr = date.toISOString().split('T')[0];
  
  // Filter out slots that conflict with active reservations
  return baseSlots.map(slot => {
    if (!slot.isAvailable) return slot;
    
    const hasReservationConflict = activeReservations.some(reservation => {
      if (reservation.providerId !== providerId || reservation.date !== dateStr) return false;
      
      // Check for time overlap
      return (
        (slot.startTime >= reservation.startTime && slot.startTime < reservation.endTime) ||
        (slot.endTime > reservation.startTime && slot.endTime <= reservation.endTime) ||
        (slot.startTime <= reservation.startTime && slot.endTime >= reservation.endTime)
      );
    });
    
    return {
      ...slot,
      isAvailable: !hasReservationConflict
    };
  });
};

// ============================================================================
// THECUT-STYLE BOOKING LINKS
// ============================================================================

/**
 * Generate a shareable booking link for a provider
 */
export const generateProviderBookingLink = (
  providerId: string,
  shopId?: string,
  serviceId?: string
): string => {
  const baseUrl = 'https://bookerPro.app/book';
  const params = new URLSearchParams({
    provider: providerId,
    ...(shopId && { shop: shopId }),
    ...(serviceId && { service: serviceId })
  });
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Parse booking link parameters
 */
export const parseBookingLink = (url: string): {
  providerId?: string;
  shopId?: string;
  serviceId?: string;
} => {
  try {
    const urlObj = new URL(url);
    return {
      providerId: urlObj.searchParams.get('provider') || undefined,
      shopId: urlObj.searchParams.get('shop') || undefined,
      serviceId: urlObj.searchParams.get('service') || undefined,
    };
  } catch {
    return {};
  }
};

/**
 * TheCut-style instant booking (simplified flow)
 */
export const instantBookAppointment = async (
  providerId: string,
  serviceId: string,
  date: string,
  startTime: string,
  clientId: string,
  paymentData: {
    totalAmount: number;
    serviceAmount: number;
    tipAmount?: number;
    paymentMethod: string;
  }
): Promise<ConfirmationResult> => {
  console.log('BookingService: Instant booking for provider', providerId);
  
  // Skip reservation step - directly create appointment
  const appointmentId = `appointment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  const taxAmount = Math.round(paymentData.serviceAmount * 0.09 * 100) / 100;
  
  // Calculate end time (assume 30min default)
  const [hours, minutes] = startTime.split(':').map(Number);
  const endDate = new Date();
  endDate.setHours(hours, minutes + 30, 0, 0);
  const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  
  const appointment: Appointment = {
    id: appointmentId,
    clientId,
    providerId,
    serviceId,
    shopId: 'default-shop', // Could be derived from provider
    date,
    startTime,
    endTime,
    duration: 30,
    status: 'confirmed', // TheCut style - directly confirmed
    paymentStatus: 'paid',
    serviceAmount: paymentData.serviceAmount,
    tipAmount: paymentData.tipAmount || 0,
    taxAmount,
    totalAmount: paymentData.totalAmount,
    reminderSent: false,
    confirmationSent: true,
    confirmedAt: now,
    createdAt: now,
    updatedAt: now,
    statusHistory: [AppointmentStateMachine.createStatusChange(
      appointmentId,
      null,
      'confirmed',
      clientId,
      'client',
      'confirm',
      'Instant booking via provider link'
    )]
  };
  
  mockAppointments.push(appointment);
  
  console.log('BookingService: Instant appointment created:', appointmentId);
  
  return {
    success: true,
    appointmentId
  };
};

// ============================================================================
// USAGE EXAMPLES AND INTEGRATION NOTES
// ============================================================================

/**
 * Example usage of the reservation system:
 * 
 * 1. When user selects a time slot:
 *    const result = checkAndReserveSlot(
 *      providerId, shopId, date, startTime, duration, 
 *      clientId, serviceId, providerAvailability
 *    );
 *    if (result.success) {
 *      // Navigate to payment screen with reservationId
 *      // Start countdown timer
 *    }
 * 
 * 2. On payment screen:
 *    const timer = useReservationTimer(reservationId);
 *    // Show countdown: timer.formatTime()
 *    // If timer.isExpired, redirect back to booking
 * 
 * 3. After successful payment:
 *    const confirmation = confirmReservation(reservationId, paymentData);
 *    if (confirmation.success) {
 *      // Navigate to confirmation screen
 *    }
 * 
 * 4. If user cancels or navigates away:
 *    releaseReservation(reservationId);
 */