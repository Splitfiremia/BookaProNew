import { useState, useEffect, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { useAsyncStorageBatch } from "@/utils/asyncStorageUtils";
import { useAuth } from "./AuthProvider";
import { 
  Appointment, 
  AppointmentStatus, 
  AppointmentStatusChange, 
  Notification, 
  UserRole,
  APPOINTMENT_PERMISSIONS
} from "@/models/database";
import { AppointmentStateMachine } from "@/utils/bookingService";

// BookingRequest type for compatibility with existing UI
export interface BookingRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientImage?: string;
  providerId: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  notes?: string;
  status: 'requested' | 'confirmed' | 'declined';
  createdAt: string;
}

// TheCut-style Color coding for appointment statuses - Visual Distinctions
export const APPOINTMENT_COLORS = {
  requested: '#FFC107',     // Yellow - pending
  confirmed: '#2196F3',     // Blue - confirmed
  'in-progress': '#FF9800', // Orange - active
  completed: '#4CAF50',     // Green - done
  cancelled: '#F44336',     // Red - cancelled
  'no-show': '#9E9E9E',     // Grey - no show
  rescheduled: '#9C27B0'    // Purple - rescheduled
} as const;

// Mock appointments with TheCut-style data structure
const mockAppointmentsData: Appointment[] = [
  {
    id: "1",
    clientId: "client-1",
    providerId: "provider-1",
    serviceId: "service-1",
    shopId: "shop-1",
    date: "2024-09-16",
    startTime: "17:00",
    endTime: "17:30",
    duration: 30,
    status: "confirmed",
    paymentStatus: "paid",
    serviceAmount: 45,
    tipAmount: 5,
    taxAmount: 4.05,
    totalAmount: 54.05,
    clientNotes: "Regular haircut",
    reminderSent: false,
    confirmationSent: true,
    confirmedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: []
  },
  {
    id: "2",
    clientId: "client-2",
    providerId: "provider-1",
    serviceId: "service-2",
    shopId: "shop-1",
    date: "2024-09-18",
    startTime: "14:00",
    endTime: "16:00",
    duration: 120,
    status: "requested",
    paymentStatus: "paid",
    serviceAmount: 135,
    tipAmount: 0,
    taxAmount: 12.15,
    totalAmount: 147.15,
    clientNotes: "Color and highlights - please use organic products",
    reminderSent: false,
    confirmationSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: []
  },
  {
    id: "3",
    clientId: "client-1",
    providerId: "provider-2",
    serviceId: "service-3",
    shopId: "shop-2",
    date: "2024-09-20",
    startTime: "10:00",
    endTime: "10:45",
    duration: 45,
    status: "in-progress",
    paymentStatus: "paid",
    serviceAmount: 60,
    tipAmount: 12,
    taxAmount: 5.40,
    totalAmount: 77.40,
    clientNotes: "Beard trim and styling",
    reminderSent: true,
    confirmationSent: true,
    confirmedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    startedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    statusHistory: []
  }
];

const [AppointmentProviderInternal, useAppointmentsInternal] = createContextHook(() => {
  const { user } = useAuth();
  const { multiGet, set } = useAsyncStorageBatch();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize immediately to prevent hydration timeout
  useEffect(() => {
    let isMounted = true;
    
    // Set initialized immediately with mock data to prevent blocking
    setAppointments(mockAppointmentsData);
    setIsLoading(false);
    setIsInitialized(true);
    
    // Load stored data asynchronously in the background
    const loadStoredData = async () => {
      if (!isMounted) return;
      
      try {
        // Very short timeout to prevent blocking
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 30)
        );
        
        const result = await Promise.race([
          multiGet(['appointments', 'notifications']),
          timeoutPromise
        ]) as { appointments: Appointment[] | null; notifications: Notification[] | null };
        
        const { appointments: storedAppointments, notifications: storedNotifications } = result;
        
        if (!isMounted) return;
        
        if (storedAppointments) {
          console.log('Loaded stored appointments:', storedAppointments.length);
          setAppointments(storedAppointments);
        }
        
        if (storedNotifications) {
          setNotifications(storedNotifications);
        }
        
      } catch (error) {
        console.log('AppointmentProvider: Using mock data due to timeout/error');
      }
    };
    
    // Load in next tick to avoid blocking initial render
    setTimeout(loadStoredData, 0);
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to prevent infinite loop

  // Save data to storage using batched operations
  const saveAppointments = useCallback(async (newAppointments: Appointment[]) => {
    try {
      await set("appointments", newAppointments);
      console.log('Appointments saved to storage');
    } catch (error) {
      console.error('Error saving appointments:', error);
    }
  }, [set]);

  const saveNotifications = useCallback(async (newNotifications: Notification[]) => {
    try {
      await set("notifications", newNotifications);
      console.log('Notifications saved to storage');
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, [set]);

  // Create status change record using TheCut-style state machine
  const createStatusChange = useCallback((
    appointmentId: string, 
    fromStatus: AppointmentStatus | null, 
    toStatus: AppointmentStatus, 
    action: keyof typeof APPOINTMENT_PERMISSIONS,
    reason?: string,
    metadata?: Record<string, any>
  ): AppointmentStatusChange => {
    return AppointmentStateMachine.createStatusChange(
      appointmentId,
      fromStatus,
      toStatus,
      user?.id || 'unknown',
      user?.role || 'client',
      action,
      reason,
      metadata
    );
  }, [user]);

  // Create notification for real-time updates
  const createNotification = useCallback((userId: string, type: Notification['type'], title: string, message: string, appointmentId?: string): Notification => {
    return {
      id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      type,
      title,
      message,
      appointmentId,
      read: false,
      createdAt: new Date().toISOString()
    };
  }, []);

  // Update appointment status with TheCut-style state machine validation
  const updateAppointmentStatus = useCallback(async (
    appointmentId: string, 
    newStatus: AppointmentStatus, 
    action: keyof typeof APPOINTMENT_PERMISSIONS,
    reason?: string,
    notes?: string,
    metadata?: Record<string, any>
  ) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
      console.error('Appointment not found:', appointmentId);
      throw new Error('Appointment not found');
    }

    const validation = AppointmentStateMachine.validateTransition(
      appointment,
      newStatus,
      user?.role || 'client',
      action
    );

    if (!validation.valid) {
      console.error('Invalid appointment transition:', validation.error);
      throw new Error(validation.error);
    }

    const statusChange = createStatusChange(
      appointmentId, 
      appointment.status, 
      newStatus, 
      action,
      reason,
      metadata
    );
    
    const now = new Date().toISOString();
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === appointmentId) {
        const updates: Partial<Appointment> = {
          status: newStatus,
          updatedAt: now,
          statusHistory: [...apt.statusHistory, statusChange]
        };

        if (newStatus === 'confirmed') {
          updates.confirmedAt = now;
          updates.confirmationSent = false;
        } else if (newStatus === 'in-progress') {
          updates.startedAt = now;
        } else if (newStatus === 'completed') {
          updates.completedAt = now;
        } else if (newStatus === 'cancelled' && reason) {
          updates.cancellationReason = reason;
        } else if (newStatus === 'no-show' && reason) {
          updates.noShowReason = reason;
        } else if (newStatus === 'rescheduled') {
          if (reason) updates.rescheduleReason = reason;
        }

        if (notes) {
          if (user?.role === 'client') {
            updates.clientNotes = notes;
          } else if (user?.role === 'provider' || user?.role === 'owner') {
            updates.providerNotes = notes;
          }
        }

        return { ...apt, ...updates };
      }
      return apt;
    });

    setAppointments(updatedAppointments);
    await saveAppointments(updatedAppointments);

    const newNotifications: Notification[] = [];
    const clientId = appointment.clientId;
    const providerId = appointment.providerId;

    if (newStatus === 'confirmed') {
      newNotifications.push(
        createNotification(clientId, 'appointment_confirmed', 'Appointment Confirmed', 'Your appointment has been confirmed.', appointmentId)
      );
    } else if (newStatus === 'cancelled') {
      newNotifications.push(
        createNotification(clientId, 'appointment_cancelled', 'Appointment Cancelled', reason || 'Your appointment was cancelled.', appointmentId),
        createNotification(providerId, 'appointment_cancelled', 'Appointment Cancelled', reason || 'The appointment was cancelled.', appointmentId)
      );
    } else if (newStatus === 'rescheduled') {
      newNotifications.push(
        createNotification(clientId, 'appointment_requested', 'Appointment Rescheduled', 'Your appointment has been rescheduled. Please review.', appointmentId),
        createNotification(providerId, 'appointment_requested', 'Appointment Rescheduled', 'An appointment was rescheduled.', appointmentId)
      );
    } else if (newStatus === 'completed') {
      newNotifications.push(
        createNotification(providerId, 'payment_received', 'Service Completed', 'Mark payment as received if applicable.', appointmentId)
      );
    } else if (newStatus === 'requested') {
      newNotifications.push(
        createNotification(providerId, 'appointment_requested', 'New Appointment Request', 'You have a new appointment request.', appointmentId)
      );
    }

    if (newNotifications.length > 0) {
      const updatedNotifications = [...notifications, ...newNotifications];
      setNotifications(updatedNotifications);
      await saveNotifications(updatedNotifications);
    }

    console.log('Updated appointment status:', appointmentId, `${appointment.status} -> ${newStatus}`);
  }, [appointments, createStatusChange, saveAppointments, notifications, saveNotifications, createNotification, user]);

  // Role-Based UI (RBUI) - appointment filtering
  const getAppointmentsForUser = useCallback((userRole: UserRole, userId: string) => {
    switch (userRole) {
      case 'client':
        return appointments.filter(apt => apt.clientId === userId);
      case 'provider':
        return appointments.filter(apt => apt.providerId === userId);
      case 'owner':
        return appointments;
      default:
        return [];
    }
  }, [appointments]);

  // Status-based filtering with color coding
  const getAppointmentsByStatus = useCallback((status: AppointmentStatus) => {
    const userAppointments = user ? getAppointmentsForUser(user.role, user.id || '') : [];
    return userAppointments.filter(apt => apt.status === status);
  }, [getAppointmentsForUser, user]);

  // Get appointments with color coding for visual distinctions
  const getAppointmentsWithColors = useCallback(() => {
    const userAppointments = user ? getAppointmentsForUser(user.role, user.id || '') : [];
    return userAppointments.map(apt => ({
      ...apt,
      color: APPOINTMENT_COLORS[apt.status]
    }));
  }, [getAppointmentsForUser, user]);

  // Request new appointment (Client Flow) - TheCut style
  const requestAppointment = useCallback(async (
    appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'statusHistory'>
  ) => {
    const now = new Date().toISOString();
    const appointmentId = `appointment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const statusChange = createStatusChange(
      appointmentId,
      null,
      'requested',
      'request',
      'New appointment request created'
    );

    const newAppointment: Appointment = {
      ...appointmentData,
      id: appointmentId,
      status: 'requested',
      createdAt: now,
      updatedAt: now,
      statusHistory: [statusChange]
    };
    
    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    await saveAppointments(updatedAppointments);

    const newNotif = createNotification(
      newAppointment.providerId,
      'appointment_requested',
      'New Appointment Request',
      'You have a new appointment request.',
      newAppointment.id
    );
    const updatedNotifications = [...notifications, newNotif];
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
    
    console.log('Created new appointment request:', newAppointment.id);
    return newAppointment;
  }, [appointments, saveAppointments, createStatusChange, createNotification, notifications, saveNotifications]);

  // General appointment update function (non-status changes)
  const updateAppointment = useCallback(async (appointmentId: string, updates: Partial<Appointment>) => {
    // Prevent status updates through this method - use updateAppointmentStatus instead
    const { status, statusHistory, ...safeUpdates } = updates;
    
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === appointmentId) {
        return {
          ...apt,
          ...safeUpdates,
          updatedAt: new Date().toISOString(),
        };
      }
      return apt;
    });
    
    setAppointments(updatedAppointments);
    await saveAppointments(updatedAppointments);
    
    console.log('Updated appointment (non-status):', appointmentId, safeUpdates);
  }, [appointments, saveAppointments]);

  // TheCut-style convenience methods for common status updates
  const confirmAppointment = useCallback(async (appointmentId: string, notes?: string) => {
    await updateAppointmentStatus(appointmentId, 'confirmed', 'confirm', undefined, notes);
  }, [updateAppointmentStatus]);

  const startAppointment = useCallback(async (appointmentId: string, notes?: string) => {
    await updateAppointmentStatus(appointmentId, 'in-progress', 'start', undefined, notes);
  }, [updateAppointmentStatus]);

  const completeAppointment = useCallback(async (appointmentId: string, tipAmount?: number, notes?: string) => {
    const metadata = tipAmount ? { tipAmount } : undefined;
    await updateAppointmentStatus(appointmentId, 'completed', 'complete', undefined, notes, metadata);
  }, [updateAppointmentStatus]);

  const cancelAppointment = useCallback(async (appointmentId: string, reason?: string, notes?: string) => {
    await updateAppointmentStatus(appointmentId, 'cancelled', 'cancel', reason, notes);
  }, [updateAppointmentStatus]);

  const markNoShow = useCallback(async (appointmentId: string, reason?: string, notes?: string) => {
    await updateAppointmentStatus(appointmentId, 'no-show', 'mark_no_show', reason, notes);
  }, [updateAppointmentStatus]);

  const rescheduleAppointment = useCallback(async (
    appointmentId: string, 
    reason?: string, 
    newDate?: string, 
    newStartTime?: string
  ) => {
    const metadata = { newDate, newStartTime };
    await updateAppointmentStatus(appointmentId, 'rescheduled', 'reschedule', reason, undefined, metadata);
  }, [updateAppointmentStatus]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  // Get unread notifications for current user
  const unreadNotifications = useMemo(() => {
    return user ? notifications.filter(notif => notif.userId === user.id && !notif.read) : [];
  }, [notifications, user]);

  // Convert appointments to booking requests format for compatibility
  const bookingRequests = useMemo((): BookingRequest[] => {
    if (!user || user.role !== 'provider' || !appointments || !Array.isArray(appointments)) {
      return [];
    }
    
    return appointments
      .filter(apt => apt && apt.providerId === user.id && apt.status === 'requested')
      .map(apt => ({
        id: apt.id,
        clientId: apt.clientId,
        clientName: `Client ${apt.clientId}`,
        clientImage: undefined,
        providerId: apt.providerId,
        serviceName: `Service ${apt.serviceId}`,
        date: apt.date,
        time: apt.startTime,
        duration: apt.duration,
        price: apt.serviceAmount,
        notes: apt.clientNotes,
        status: 'requested' as const,
        createdAt: apt.createdAt,
      }));
  }, [appointments, user]);

  // Confirm booking request (converts to confirmed appointment)
  const confirmBookingRequest = useCallback(async (requestId: string, notes?: string) => {
    await updateAppointmentStatus(requestId, 'confirmed', 'confirm', undefined, notes);
  }, [updateAppointmentStatus]);

  // Decline booking request (converts to cancelled appointment)
  const declineBookingRequest = useCallback(async (requestId: string, reason?: string) => {
    await updateAppointmentStatus(requestId, 'cancelled', 'cancel', reason || 'Declined by provider');
  }, [updateAppointmentStatus]);

  const contextValue = useMemo(() => {
    // Ensure all required properties are defined
    const safeValue = {
      appointments: appointments || [],
      notifications: notifications || [],
      unreadNotifications: unreadNotifications || [],
      isLoading: Boolean(isLoading),
      isInitialized: Boolean(isInitialized),
      // Core appointment management
      requestAppointment: requestAppointment || (() => Promise.resolve({} as Appointment)),
      updateAppointment: updateAppointment || (() => Promise.resolve()),
      updateAppointmentStatus: updateAppointmentStatus || (() => Promise.resolve()),
      confirmAppointment: confirmAppointment || (() => Promise.resolve()),
      startAppointment: startAppointment || (() => Promise.resolve()),
      completeAppointment: completeAppointment || (() => Promise.resolve()),
      cancelAppointment: cancelAppointment || (() => Promise.resolve()),
      markNoShow: markNoShow || (() => Promise.resolve()),
      rescheduleAppointment: rescheduleAppointment || (() => Promise.resolve()),
      // Booking requests (for compatibility)
      bookingRequests: bookingRequests || [],
      confirmBookingRequest: confirmBookingRequest || (() => Promise.resolve()),
      declineBookingRequest: declineBookingRequest || (() => Promise.resolve()),
      // Filtering and querying
      getAppointmentsForUser: getAppointmentsForUser || (() => []),
      getAppointmentsByStatus: getAppointmentsByStatus || (() => []),
      getAppointmentsWithColors: getAppointmentsWithColors || (() => []),
      // Notifications
      markNotificationRead: markNotificationRead || (() => Promise.resolve()),
      // Constants
      APPOINTMENT_COLORS: APPOINTMENT_COLORS || {},
    };
    
    console.log('AppointmentProvider: Context value created with', {
      appointmentsCount: safeValue.appointments.length,
      isLoading: safeValue.isLoading,
      isInitialized: safeValue.isInitialized
    });
    
    return safeValue;
  }, [
    appointments,
    notifications,
    unreadNotifications,
    isLoading,
    isInitialized,
    requestAppointment,
    updateAppointment,
    updateAppointmentStatus,
    confirmAppointment,
    startAppointment,
    completeAppointment,
    cancelAppointment,
    markNoShow,
    rescheduleAppointment,
    bookingRequests,
    confirmBookingRequest,
    declineBookingRequest,
    getAppointmentsForUser,
    getAppointmentsByStatus,
    getAppointmentsWithColors,
    markNotificationRead,
  ]);

  return contextValue;
});

// Robust hook wrapper to avoid undefined context usage
export function useAppointments(): ReturnType<typeof useAppointmentsInternal> {
  const ctx = useAppointmentsInternal();
  if (!ctx) {
    console.warn('useAppointments called outside of AppointmentProvider. Returning safe fallbacks.');

    const noop = async () => Promise.resolve();
    const noopReturnAppointment = async () => Promise.reject(new Error('AppointmentProvider is not mounted')) as Promise<Appointment>;

    return {
      appointments: [],
      notifications: [],
      unreadNotifications: [],
      isLoading: false,
      isInitialized: false,
      requestAppointment: noopReturnAppointment,
      updateAppointment: noop,
      updateAppointmentStatus: noop,
      confirmAppointment: noop,
      startAppointment: noop,
      completeAppointment: noop,
      cancelAppointment: noop,
      markNoShow: noop,
      rescheduleAppointment: noop,
      bookingRequests: [],
      confirmBookingRequest: noop,
      declineBookingRequest: noop,
      getAppointmentsForUser: () => [],
      getAppointmentsByStatus: () => [],
      getAppointmentsWithColors: () => [],
      markNotificationRead: noop,
      APPOINTMENT_COLORS,
    } as unknown as ReturnType<typeof useAppointmentsInternal>;
  }
  return ctx;
}

// Export the provider with the original name
export const AppointmentProvider = AppointmentProviderInternal;

// Helper hook for filtering appointments by user role and status
export function useFilteredAppointments(status?: AppointmentStatus) {
  const context = useAppointments();
  const { user } = useAuth();

  return useMemo(() => {
    if (!context || !context.isInitialized || !user) return [];
    
    if (status) {
      return context.getAppointmentsByStatus(status);
    }
    
    return context.getAppointmentsForUser(user.role, user.id || '');
  }, [context, status, user]);
}

// Helper hook for real-time appointment updates (simulated)
export function useRealTimeAppointments() {
  const context = useAppointments();
  
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Simulating real-time sync...');
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { appointments: context.appointments, notifications: context.notifications };
}

// Helper hook for provider-specific appointment management (Provider Flow)
export function useProviderAppointments() {
  const context = useAppointments();
  const { user } = useAuth();
  
  const providerAppointments = useMemo(() => {
    if (!context || !context.isInitialized || user?.role !== 'provider' || !user.id) return [];
    return context.getAppointmentsForUser('provider', user.id);
  }, [context, user]);

  const pendingRequests = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return context.getAppointmentsByStatus('requested');
  }, [context]);

  const confirmedAppointments = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return context.getAppointmentsByStatus('confirmed');
  }, [context]);

  const todaysAppointments = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    const today = new Date().toISOString().split('T')[0];
    return confirmedAppointments.filter((apt: Appointment) => apt.date === today);
  }, [confirmedAppointments, context]);

  const appointmentNotifications = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return context.unreadNotifications.filter((notif: Notification) => 
      notif.type === 'appointment_requested' || 
      notif.type === 'appointment_cancelled'
    );
  }, [context]);

  return {
    providerAppointments,
    pendingRequests,
    confirmedAppointments,
    todaysAppointments,
    appointmentNotifications,
    confirmAppointment: context.confirmAppointment,
    startAppointment: context.startAppointment,
    completeAppointment: context.completeAppointment,
    cancelAppointment: context.cancelAppointment,
    markNoShow: context.markNoShow,
    rescheduleAppointment: context.rescheduleAppointment,
  };
}

// Helper hook for shop owner appointment oversight (Shop Owner Flow)
export function useShopOwnerAppointments() {
  const context = useAppointments();
  const { user } = useAuth();
  
  const allShopAppointments = useMemo(() => {
    if (!context || !context.isInitialized || user?.role !== 'owner' || !user.id) return [];
    return context.getAppointmentsForUser('owner', user.id);
  }, [context, user]);

  const appointmentsWithColors = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return context.getAppointmentsWithColors();
  }, [context]);

  const appointmentsByStatus = useMemo(() => {
    if (!context || !context.isInitialized) {
      return {
        requested: [],
        confirmed: [],
        'in-progress': [],
        completed: [],
        cancelled: [],
        'no-show': [],
        rescheduled: [],
      } as Record<AppointmentStatus, any[]>;
    }
    return {
      requested: context.getAppointmentsByStatus('requested'),
      confirmed: context.getAppointmentsByStatus('confirmed'),
      'in-progress': context.getAppointmentsByStatus('in-progress'),
      completed: context.getAppointmentsByStatus('completed'),
      cancelled: context.getAppointmentsByStatus('cancelled'),
      'no-show': context.getAppointmentsByStatus('no-show'),
      rescheduled: context.getAppointmentsByStatus('rescheduled'),
    } as Record<AppointmentStatus, any[]>;
  }, [context]);

  const todaysAppointments = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    const today = new Date().toISOString().split('T')[0];
    return allShopAppointments.filter((apt: Appointment) => apt.date === today);
  }, [allShopAppointments, context]);

  const revenueData = useMemo(() => {
    if (!context || !context.isInitialized) return { totalAppointments: 0, estimatedRevenue: 0 };
    const completedAppointments = appointmentsByStatus.completed;
    return {
      totalAppointments: completedAppointments.length,
      estimatedRevenue: completedAppointments.length * 50,
    };
  }, [appointmentsByStatus.completed, context]);

  return {
    allShopAppointments,
    appointmentsWithColors,
    appointmentsByStatus,
    todaysAppointments,
    revenueData,
    unreadNotifications: context.unreadNotifications,
  };
}

// Helper hook for client appointment management (Client Flow)
export function useClientAppointments() {
  const context = useAppointments();
  const { user } = useAuth();
  
  const clientAppointments = useMemo(() => {
    if (!context || !context.isInitialized || user?.role !== 'client' || !user.id) return [];
    return context.getAppointmentsForUser('client', user.id);
  }, [context, user]);

  const upcomingAppointments = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return clientAppointments.filter((apt: Appointment) => 
      apt.status === 'confirmed' || apt.status === 'requested' || apt.status === 'in-progress' || apt.status === 'rescheduled'
    );
  }, [clientAppointments, context]);

  const pastAppointments = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return clientAppointments.filter((apt: Appointment) => 
      apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no-show'
    );
  }, [clientAppointments, context]);

  const pendingRequests = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return clientAppointments.filter((apt: Appointment) => apt.status === 'requested');
  }, [clientAppointments, context]);

  const appointmentNotifications = useMemo(() => {
    if (!context || !context.isInitialized) return [];
    return context.unreadNotifications.filter((notif: Notification) => 
      notif.type === 'appointment_confirmed' || 
      notif.type === 'appointment_cancelled' ||
      notif.type === 'appointment_reminder'
    );
  }, [context]);

  return {
    clientAppointments,
    upcomingAppointments,
    pastAppointments,
    pendingRequests,
    appointmentNotifications,
    requestAppointment: context.requestAppointment,
    cancelAppointment: context.cancelAppointment,
  };
}