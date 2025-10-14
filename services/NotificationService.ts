import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationData {
  type: 'appointment_requested' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_reminder' | 'payment_received' | 'general';
  appointmentId?: string;
  providerId?: string;
  clientId?: string;
  shopId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing notification service...');
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return;
      }

      // Get push token (only on mobile)
      if (Platform.OS !== 'web') {
        try {
          const tokenData = await Notifications.getExpoPushTokenAsync();
          this.expoPushToken = tokenData.data;
          console.log('Expo push token:', this.expoPushToken);
        } catch (error) {
          console.error('Failed to get push token:', error);
        }
      }

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      this.isInitialized = true;
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  private async setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync('appointments', {
      name: 'Appointments',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      description: 'Notifications for appointment updates',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      description: 'Appointment reminders',
    });

    await Notifications.setNotificationChannelAsync('general', {
      name: 'General',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      description: 'General app notifications',
    });
  }

  async scheduleLocalNotification(data: PushNotificationData, delaySeconds: number = 0): Promise<string | null> {
    try {
      const channelId = this.getChannelId(data.type);
      
      const content = {
        title: data.title,
        body: data.body,
        data: {
          ...data.data,
          type: data.type,
          appointmentId: data.appointmentId,
          providerId: data.providerId,
          clientId: data.clientId,
          shopId: data.shopId,
        },
        sound: 'default' as const,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && { channelId }),
      };

      let notificationId: string;
      
      if (delaySeconds > 0) {
        // For delayed notifications, use a simple timeout approach
        setTimeout(async () => {
          await Notifications.presentNotificationAsync(content);
        }, delaySeconds * 1000);
        notificationId = `delayed-${Date.now()}`;
      } else {
        notificationId = await Notifications.presentNotificationAsync(content);
      }

      console.log('Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
      return null;
    }
  }

  async scheduleAppointmentReminder(
    appointmentId: string,
    title: string,
    body: string,
    reminderTime: Date,
    additionalData?: Record<string, any>
  ): Promise<string | null> {
    try {
      if (!reminderTime || !(reminderTime instanceof Date)) {
        console.error('Invalid reminder time provided');
        return null;
      }

      const now = new Date();
      const delayMs = reminderTime.getTime() - now.getTime();
      
      if (delayMs <= 0) {
        console.warn('Reminder time is in the past, scheduling immediate notification');
        return this.scheduleLocalNotification({
          type: 'appointment_reminder',
          appointmentId,
          title,
          body,
          data: additionalData,
        });
      }

      const delaySeconds = Math.floor(delayMs / 1000);
      return this.scheduleLocalNotification({
        type: 'appointment_reminder',
        appointmentId,
        title,
        body,
        data: additionalData,
      }, delaySeconds);
    } catch (error) {
      console.error('Failed to schedule appointment reminder:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }

  getPushToken(): string | null {
    return this.expoPushToken;
  }

  private getChannelId(type: PushNotificationData['type']): string {
    switch (type) {
      case 'appointment_requested':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
        return 'appointments';
      case 'appointment_reminder':
        return 'reminders';
      default:
        return 'general';
    }
  }

  // Simulate sending push notification to server (for testing)
  async sendPushNotification(
    targetToken: string,
    data: PushNotificationData
  ): Promise<boolean> {
    try {
      if (!data || !data.title || !data.body) {
        console.error('Invalid notification data provided');
        return false;
      }

      // In a real app, this would send to your backend server
      // which would then send to Expo's push notification service
      console.log('Would send push notification:', {
        to: targetToken,
        title: data.title,
        body: data.body,
        data: data.data,
      });
      
      // For demo purposes, schedule a local notification instead
      await this.scheduleLocalNotification(data, 1);
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // Helper methods for common notification types
  async notifyAppointmentRequest(
    clientName: string,
    serviceName: string,
    appointmentTime: string,
    appointmentId: string,
    providerId: string
  ): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'appointment_requested',
      appointmentId,
      providerId,
      title: 'New Appointment Request',
      body: `${clientName} requested ${serviceName} at ${appointmentTime}`,
      data: { clientName, serviceName, appointmentTime },
    });
  }

  async notifyAppointmentConfirmed(
    providerName: string,
    serviceName: string,
    appointmentTime: string,
    appointmentId: string,
    clientId: string
  ): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'appointment_confirmed',
      appointmentId,
      clientId,
      title: 'Appointment Confirmed',
      body: `${providerName} confirmed your ${serviceName} appointment for ${appointmentTime}`,
      data: { providerName, serviceName, appointmentTime },
    });
  }

  async notifyAppointmentCancelled(
    appointmentId: string,
    reason: string,
    clientId?: string,
    providerId?: string
  ): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'appointment_cancelled',
      appointmentId,
      clientId,
      providerId,
      title: 'Appointment Cancelled',
      body: `Your appointment has been cancelled. ${reason}`,
      data: { reason },
    });
  }

  async notifyPaymentReceived(
    amount: number,
    clientName: string,
    serviceName: string,
    appointmentId: string,
    providerId: string
  ): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'payment_received',
      appointmentId,
      providerId,
      title: 'Payment Received',
      body: `Received $${amount} from ${clientName} for ${serviceName}`,
      data: { amount, clientName, serviceName },
    });
  }
}

export default NotificationService.getInstance();