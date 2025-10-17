import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import ImageWithFallback from '@/components/ImageWithFallback';
import NotificationService from '@/services/NotificationService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bell, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useProviderAppointments } from '@/providers/AppointmentProvider';
import ProviderFunctionButtons from '@/components/ProviderFunctionButtons';
import { router } from 'expo-router';
import { testUsers } from '@/mocks/users';
import { mockProviders } from '@/mocks/providers';

export default function ProviderHomeScreen() {
  const { user } = useAuth();
  const { pendingRequests, confirmAppointment, cancelAppointment } = useProviderAppointments();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const initNotifications = async () => {
      await NotificationService.initialize();
      console.log('Notification service initialized for provider');
    };
    initNotifications();
  }, []);
  
  const enrichedPendingRequests = useMemo(() => {
    if (!pendingRequests || !Array.isArray(pendingRequests)) {
      console.warn('pendingRequests is not available or not an array:', pendingRequests);
      return [];
    }
    return pendingRequests.map(request => {
      const client = testUsers.find(u => u.id === request.clientId);
      const provider = mockProviders.find(p => p.id === request.providerId);
      const service = provider?.services.find(s => s.id === request.serviceId);
      
      return {
        ...request,
        clientName: client?.name || 'Unknown Client',
        clientImage: client?.profileImage,
        serviceName: service?.name || 'Unknown Service',
        price: service?.price || 0,
        time: request.startTime,
      };
    });
  }, [pendingRequests]);
  
  const upcomingAppointments = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      service: 'Haircut & Style',
      time: '10:00 AM',
      date: 'Today'
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      service: 'Beard Trim',
      time: '2:30 PM',
      date: 'Today'
    },
    {
      id: '3',
      clientName: 'Emily Davis',
      service: 'Hair Color',
      time: '11:15 AM',
      date: 'Tomorrow'
    }
  ];

  const earningsData = {
    today: 245,
    thisWeek: 1280,
    thisMonth: 4750
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'Provider'}!</Text>
            <Text style={styles.subtitle}>theCal PRO</Text>
            <Text style={styles.trialText}>Trial ends 9/28/25 (14 days)</Text>
            <TouchableOpacity>
              <Text style={styles.learnMoreText}>LEARN MORE</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Function Buttons */}
        <ProviderFunctionButtons />
        
        {/* Booking Requests Section */}
        {enrichedPendingRequests.length > 0 && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Booking Requests</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/(provider)/(tabs)/requests')}>
                <Text style={styles.seeAllText}>See All ({enrichedPendingRequests.length})</Text>
              </TouchableOpacity>
            </View>
            
            {enrichedPendingRequests.slice(0, 3).map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.clientInfo}>
                    <ImageWithFallback
                      source={{ uri: request.clientImage || undefined }}
                      style={styles.clientImage}
                      fallbackIcon="user"
                    />
                    <View>
                      <Text style={styles.clientName}>{request.clientName}</Text>
                      <Text style={styles.requestService}>{request.serviceName}</Text>
                    </View>
                  </View>
                  <Text style={styles.requestPrice}>${request.price}</Text>
                </View>
                
                <View style={styles.requestDetails}>
                  <View style={styles.requestDetailItem}>
                    <Clock size={16} color={COLORS.text} />
                    <Text style={styles.requestDetailText}>{request.time}</Text>
                  </View>
                  <Text style={styles.requestDate}>{request.date}</Text>
                </View>
                
                <View style={styles.requestActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => cancelAppointment(request.id, 'Declined by provider')}
                  >
                    <XCircle size={18} color={COLORS.error} />
                    <Text style={[styles.actionButtonText, styles.declineButtonText]}>Decline</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={() => confirmAppointment(request.id)}
                  >
                    <CheckCircle size={18} color={"#FFFFFF"} />
                    <Text style={[styles.actionButtonText, styles.confirmButtonText]}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Upcoming Appointments Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(provider)/(tabs)/schedule')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingAppointments.map((appointment) => (
            <TouchableOpacity 
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => router.push(`/(app)/(provider)/appointment/${appointment.id}`)}
            >
              <View>
                <Text style={styles.appointmentClient}>{appointment.clientName}</Text>
                <Text style={styles.appointmentService}>{appointment.service}</Text>
                <Text style={styles.appointmentTime}>{appointment.time} • {appointment.date}</Text>
              </View>
              <ChevronRight size={20} color={COLORS.text} />
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Earnings Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Earnings</Text>
            <TouchableOpacity onPress={() => console.log('Navigate to earnings details')}>
              <Text style={styles.seeAllText}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.earningsContainer}>
            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>Today</Text>
              <Text style={styles.earningsAmount}>${earningsData.today}</Text>
            </View>
            
            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>This Week</Text>
              <Text style={styles.earningsAmount}>${earningsData.thisWeek}</Text>
            </View>
            
            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>This Month</Text>
              <Text style={styles.earningsAmount}>${earningsData.thisMonth}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(app)/(provider)/availability')}
          >
            <Text style={styles.actionText}>Update Availability</Text>
            <ChevronRight size={20} color={COLORS.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(app)/(provider)/booking')}
          >
            <Text style={styles.actionText}>Create New Booking</Text>
            <ChevronRight size={20} color={COLORS.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(app)/(provider)/complete-payment')}
          >
            <Text style={styles.actionText}>Process Payment</Text>
            <ChevronRight size={20} color={COLORS.text} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginTop: 8,
  },
  trialText: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: 4,
  },
  learnMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  notificationButton: {
    width: 48,
    height: 48,
    ...GLASS_STYLES.card,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
  appointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...GLASS_STYLES.card,
    padding: 16,
    marginBottom: 12,
  },
  appointmentClient: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  appointmentService: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
  },
  earningsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningsCard: {
    flex: 1,
    ...GLASS_STYLES.card,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  earningsLabel: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.success,
  },
  actionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...GLASS_STYLES.card,
    padding: 16,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  requestCard: {
    ...GLASS_STYLES.card,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  requestService: {
    fontSize: 14,
    color: COLORS.primary,
  },
  requestPrice: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.success,
  },
  requestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requestDetailText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  requestDate: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.error,
  },
  confirmButton: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  declineButtonText: {
    color: COLORS.error,
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});
