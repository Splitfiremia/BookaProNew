import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Calendar as CalendarComponent, DateData } from 'react-native-calendars';
import { router } from 'expo-router';
import { 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Play, 
  Check, 
  Plus,
  Bell,
  CalendarDays
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '@/constants/theme';
import { mockAppointments } from '@/mocks/appointments';

// Define appointment status types
type AppointmentStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

// Define appointment interface
interface Appointment {
  id: string;
  clientName: string;
  clientImage: string;
  service: string;
  status: AppointmentStatus;
  day: string;
  date: string;
  month: string;
  time: string;
  price: number;
  location: string;
}

// Convert mock appointments to our format
const appointments: Appointment[] = mockAppointments.map(appointment => ({
  id: appointment.id,
  clientName: appointment.providerName, // In the mock, provider is actually the client for a provider view
  clientImage: appointment.providerImage,
  service: appointment.service,
  status: appointment.status as AppointmentStatus,
  day: appointment.day,
  date: appointment.date,
  month: appointment.month,
  time: appointment.time,
  price: appointment.price,
  location: appointment.location,
}));

// Add some pending requests
const bookingRequests: Appointment[] = [
  {
    id: "request-1",
    clientName: "Emma Johnson",
    clientImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    service: "Haircut & Style",
    status: "pending",
    day: "MON",
    date: "16",
    month: "SEP",
    time: "10:00 AM - 11:00 AM",
    price: 45,
    location: "Your Location",
  },
  {
    id: "request-2",
    clientName: "Michael Brown",
    clientImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    service: "Beard Trim",
    status: "pending",
    day: "TUE",
    date: "17",
    month: "SEP",
    time: "2:30 PM - 3:00 PM",
    price: 25,
    location: "Your Location",
  }
];

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Format date for calendar marking
  const markedDates = useMemo(() => {
    const dates: {[key: string]: {marked: boolean, dotColor: string}} = {};
    
    // Mark dates with appointments
    appointments.forEach(appointment => {
      // Convert date format (assuming date is in format "DD" and month is "MMM")
      const monthMap: {[key: string]: string} = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
        'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
      };
      
      const month = monthMap[appointment.month];
      const day = appointment.date.padStart(2, '0');
      const dateString = `2025-${month}-${day}`;
      
      dates[dateString] = {
        marked: true,
        dotColor: COLORS.primary
      };
    });
    
    // Highlight selected date
    dates[selectedDate] = {
      ...dates[selectedDate],
      marked: true,
      dotColor: COLORS.primary
    };
    
    return dates;
  }, [selectedDate, appointments]);
  
  // Filter appointments for selected date
  const filteredAppointments = useMemo(() => {
    // Convert selectedDate to format in our data
    const date = new Date(selectedDate);
    const day = date.getDate().toString();
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    
    return appointments.filter(appointment => 
      appointment.date === day && appointment.month === month && 
      (appointment.status === 'confirmed' || appointment.status === 'in-progress')
    );
  }, [selectedDate, appointments]);
  
  const onDateSelect = (date: DateData) => {
    setSelectedDate(date.dateString);
  };
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const handleAppointmentAction = (id: string, action: 'check-in' | 'start' | 'complete' | 'cancel') => {
    console.log(`Appointment ${id} action: ${action}`);
    // In a real app, this would update the appointment status
  };
  
  const handleAppointmentPress = (appointmentId: string) => {
    router.push({
      pathname: "/appointment-details",
      params: { id: appointmentId, isProvider: "true" }
    });
  };
  
  const handleAddAppointment = () => {
    // Navigate to appointment creation screen
    console.log("Add appointment");
  };

  const navigateToFullCalendar = () => {
    router.push('/provider-calendar');
  };
  
  const handleRequestAction = (id: string, action: 'accept' | 'decline') => {
    console.log(`Request ${id} ${action}ed`);
    // In a real app, this would update the request status
  };

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Booking Requests Section */}
      {bookingRequests.length > 0 && (
        <View style={styles.requestsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Bell color={COLORS.primary} size={20} />
              <Text style={styles.sectionTitle}>Booking Requests</Text>
            </View>
            <View style={styles.requestBadge}>
              <Text style={styles.requestBadgeText}>{bookingRequests.length}</Text>
            </View>
          </View>
          
          {bookingRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestContent}>
                <Image 
                  source={{ uri: request.clientImage }} 
                  style={styles.clientImage} 
                />
                <View style={styles.requestDetails}>
                  <Text style={styles.clientName}>{request.clientName}</Text>
                  <Text style={styles.serviceText}>{request.service}</Text>
                  <View style={styles.requestMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color="#999" />
                      <Text style={styles.metaText}>{request.time}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <DollarSign size={14} color="#999" />
                      <Text style={styles.metaText}>${request.price}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.requestActions}>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => handleRequestAction(request.id, 'accept')}
                >
                  <LinearGradient
                    colors={[COLORS.success, '#0D9268']}
                    style={styles.actionButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.declineButton}
                  onPress={() => handleRequestAction(request.id, 'decline')}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
      
      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>Calendar</Text>
          <TouchableOpacity 
            style={styles.fullCalendarButton} 
            onPress={navigateToFullCalendar}
            testID="full-calendar-button"
          >
            <LinearGradient
              colors={[COLORS.primary, '#E05D20']} 
              style={styles.fullCalendarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <CalendarDays size={18} color="#FFF" />
              <Text style={styles.fullCalendarButtonText}>Full Calendar View</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.calendarContainer}>
          <CalendarComponent
            current={selectedDate}
            onDayPress={onDateSelect}
            markedDates={markedDates}
            theme={{
              backgroundColor: COLORS.background,
              calendarBackground: COLORS.card,
              textSectionTitleColor: '#999',
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: '#000',
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.text,
              textDisabledColor: '#555',
              dotColor: COLORS.primary,
              selectedDotColor: '#000',
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.text,
              textMonthFontWeight: 'bold',
              textDayFontSize: 14,
              textMonthFontSize: 16,
            }}
          />
        </View>
      </View>
      
      {/* Appointments for Selected Date */}
      <View style={styles.appointmentsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Clock color={COLORS.primary} size={20} />
            <Text style={styles.sectionTitle}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity onPress={handleAddAppointment} style={styles.addButton}>
            <Plus color={COLORS.primary} size={20} />
          </TouchableOpacity>
        </View>
        
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentTimeContainer}>
                <Text style={styles.appointmentTime}>{appointment.time.split(" - ")[0]}</Text>
                <View style={styles.timelineDot} />
              </View>
              
              <View style={styles.appointmentContent}>
                <TouchableOpacity 
                  style={styles.appointmentDetails}
                  onPress={() => handleAppointmentPress(appointment.id)}
                >
                  <View style={styles.appointmentHeader}>
                    <Image 
                      source={{ uri: appointment.clientImage }} 
                      style={styles.clientImage} 
                    />
                    <View style={styles.clientInfo}>
                      <Text style={styles.clientName}>{appointment.clientName}</Text>
                      <Text style={styles.serviceText}>{appointment.service}</Text>
                      <View style={styles.appointmentMeta}>
                        <View style={styles.metaItem}>
                          <Clock size={14} color="#999" />
                          <Text style={styles.metaText}>{appointment.time}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <DollarSign size={14} color="#999" />
                          <Text style={styles.metaText}>${appointment.price}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.appointmentActions}>
                  {appointment.status === 'confirmed' && (
                    <>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleAppointmentAction(appointment.id, 'check-in')}
                      >
                        <CheckCircle size={20} color={COLORS.success} />
                        <Text style={styles.actionText}>Check In</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleAppointmentAction(appointment.id, 'start')}
                      >
                        <Play size={20} color={COLORS.primary} />
                        <Text style={styles.actionText}>Start</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  {appointment.status === 'in-progress' && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleAppointmentAction(appointment.id, 'complete')}
                    >
                      <Check size={20} color={COLORS.success} />
                      <Text style={styles.actionText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleAppointmentAction(appointment.id, 'cancel')}
                  >
                    <XCircle size={20} color={COLORS.error} />
                    <Text style={styles.actionText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Clock color="#666" size={40} />
            <Text style={styles.emptyStateText}>No appointments scheduled for this day</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={handleAddAppointment}
            >
              <Text style={styles.emptyStateButtonText}>Add Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  requestsSection: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  calendarSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  fullCalendarButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  fullCalendarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  fullCalendarButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  calendarContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  appointmentsSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
    fontFamily: FONTS.bold,
  },
  requestBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  requestBadgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(240, 121, 69, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
  },
  requestContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  clientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  serviceText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
  },
  actionButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  declineButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  appointmentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
  },
  appointmentTimeContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  appointmentContent: {
    flex: 1,
    padding: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 40,
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: 'rgba(240, 121, 69, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});