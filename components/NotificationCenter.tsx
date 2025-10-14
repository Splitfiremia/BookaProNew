import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Bell, CheckCircle, Clock, X, Calendar, AlertCircle } from 'lucide-react-native';
import { useAppointments } from '@/providers/AppointmentProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Notification } from '@/models/database';

interface NotificationCenterProps {
  visible?: boolean;
  onClose?: () => void;
}

// Enhanced notification item with priority and status indicators
const NotificationItem: React.FC<{ 
  notification: Notification; 
  onMarkRead: (id: string) => void;
  onPress?: (notification: Notification) => void;
}> = ({ notification, onMarkRead, onPress }) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment_requested':
        return <Clock size={20} color="#FFC107" />;
      case 'appointment_confirmed':
        return <CheckCircle size={20} color="#4CAF50" />;
      case 'appointment_cancelled':
        return <X size={20} color="#F44336" />;
      case 'appointment_reminder':
        return <Calendar size={20} color="#2196F3" />;
      case 'payment_received':
        return <CheckCircle size={20} color="#4CAF50" />;
      default:
        return <Bell size={20} color="#666" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'appointment_requested':
        return '#FFC107';
      case 'appointment_confirmed':
        return '#4CAF50';
      case 'appointment_cancelled':
        return '#F44336';
      case 'appointment_reminder':
        return '#2196F3';
      case 'payment_received':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handlePress = () => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    onPress?.(notification);
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification,
        { borderLeftColor: getNotificationColor(notification.type) }
      ]}
      onPress={handlePress}
      testID={`notification-${notification.id}`}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(notification.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={[
          styles.notificationTitle,
          !notification.read && styles.unreadTitle
        ]}>
          {notification.title}
        </Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>
          {formatTime(notification.createdAt)}
        </Text>
      </View>
      {!notification.read && (
        <View style={[
          styles.unreadDot,
          { backgroundColor: getNotificationColor(notification.type) }
        ]} />
      )}
    </TouchableOpacity>
  );
};

// Notification Engine with real-time updates
export const NotificationCenter: React.FC<NotificationCenterProps> = ({ visible = true, onClose }) => {
  const { user } = useAuth();
  const { notifications, unreadNotifications, markNotificationRead } = useAppointments();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [lastNotificationCount, setLastNotificationCount] = useState<number>(0);

  // Real-time notification monitoring
  useEffect(() => {
    if (unreadNotifications.length > lastNotificationCount) {
      console.log('New notifications received:', unreadNotifications.length - lastNotificationCount);
      // In a real implementation, this could trigger push notifications or sound alerts
    }
    setLastNotificationCount(unreadNotifications.length);
  }, [unreadNotifications.length]); // Remove lastNotificationCount dependency to prevent infinite loop

  const handleMarkRead = async (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    await markNotificationRead(notificationId);
  };

  const handleMarkAllRead = async () => {
    console.log('Marking all notifications as read');
    for (const notification of unreadNotifications) {
      await markNotificationRead(notification.id);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    console.log('Notification pressed:', notification.id, notification.type);
    setSelectedNotification(notification);
  };

  // Filter notifications for current user
  const userNotifications = notifications.filter(notif => notif.userId === user?.id);
  const sortedNotifications = userNotifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Group notifications by date
  const groupedNotifications = sortedNotifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as { [key: string]: Notification[] });

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Bell size={24} color="#333" />
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadNotifications.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadNotifications.length}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {unreadNotifications.length > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.notificationsList}>
        {sortedNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No notifications yet</Text>
            <Text style={styles.emptyStateSubtext}>
              {user?.role === 'provider' ? 'New appointment requests will appear here' :
               user?.role === 'client' ? 'Appointment confirmations will appear here' :
               'Shop updates and notifications will appear here'}
            </Text>
          </View>
        ) : (
          Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
            <View key={date}>
              <Text style={styles.dateHeader}>
                {date === new Date().toDateString() ? 'Today' :
                 date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' :
                 date}
              </Text>
              {dayNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onPress={handleNotificationPress}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Notification Detail Modal */}
      <Modal
        visible={selectedNotification !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View style={styles.detailOverlay}>
          <View style={styles.detailContent}>
            {selectedNotification && (
              <>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>{selectedNotification.title}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedNotification(null)}
                    style={styles.detailCloseButton}
                  >
                    <X size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.detailMessage}>{selectedNotification.message}</Text>
                <Text style={styles.detailTime}>
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </Text>
                {selectedNotification.appointmentId && (
                  <Text style={styles.detailAppointment}>
                    Appointment ID: {selectedNotification.appointmentId}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );

  // If visible prop is provided, wrap in modal
  if (visible !== undefined) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  badge: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    marginRight: 12,
  },
  markAllText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  notificationsList: {
    flex: 1,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderLeftWidth: 3,
    alignItems: 'flex-start',
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '85%',
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
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  detailCloseButton: {
    padding: 4,
  },
  detailMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  detailTime: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  detailAppointment: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 8,
  },
  modalWrapper: {
    flex: 1,
  },
});

export default NotificationCenter;

// Hook for notification badge count
export const useNotificationBadge = () => {
  const context = useAppointments();
  if (!context.isInitialized) return 0;
  return context.unreadNotifications.length;
};

// Hook for real-time notification updates
export const useRealTimeNotifications = () => {
  const context = useAppointments();
  const [hasNewNotifications, setHasNewNotifications] = useState<boolean>(false);
  
  useEffect(() => {
    if (context.isInitialized && context.unreadNotifications.length > 0) {
      setHasNewNotifications(true);
      // Auto-reset after 3 seconds
      const timer = setTimeout(() => setHasNewNotifications(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [context.unreadNotifications.length]); // Remove context.isInitialized dependency to prevent infinite loop
  
  return {
    notifications: context.notifications,
    unreadNotifications: context.unreadNotifications,
    hasNewNotifications,
    unreadCount: context.unreadNotifications.length
  };
};