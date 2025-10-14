import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Filter, ChevronLeft, ChevronRight, Eye, Clock, User, Users } from 'lucide-react-native';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';
import WaitlistManagement from '@/components/WaitlistManagement';

interface Appointment {
  id: string;
  clientName: string;
  providerName: string;
  service: string;
  time: string;
  duration: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  price: string;
}

const appointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Sarah Johnson',
    providerName: 'Mike Chen',
    service: 'Haircut & Style',
    time: '9:00 AM',
    duration: '45 min',
    status: 'confirmed',
    price: '$65',
  },
  {
    id: '2',
    clientName: 'David Wilson',
    providerName: 'Emily Davis',
    service: 'Hair Color',
    time: '10:30 AM',
    duration: '2 hours',
    status: 'confirmed',
    price: '$120',
  },
  {
    id: '3',
    clientName: 'Lisa Brown',
    providerName: 'Sarah Johnson',
    service: 'Manicure',
    time: '11:00 AM',
    duration: '30 min',
    status: 'pending',
    price: '$35',
  },
  {
    id: '4',
    clientName: 'John Smith',
    providerName: 'James Wilson',
    service: 'Beard Trim',
    time: '2:00 PM',
    duration: '20 min',
    status: 'completed',
    price: '$25',
  },
];

export default function AggregatedCalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'provider' | 'service' | 'status'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<'appointments' | 'waitlist'>('appointments');
  
  // Mock shop ID - in a real app, this would come from the authenticated shop owner
  const shopId = 'shop-1';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const handleAppointmentPress = (appointmentId: string) => {
    router.push(`/appointment/${appointmentId}`);
  };

  const handleAnalytics = () => {
    router.push('/analytics');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Shop Management</Text>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeView === 'appointments' && styles.toggleButtonActive
            ]}
            onPress={() => setActiveView('appointments')}
          >
            <Clock size={16} color={activeView === 'appointments' ? COLORS.card : COLORS.text} />
            <Text style={[
              styles.toggleButtonText,
              activeView === 'appointments' && styles.toggleButtonTextActive
            ]}>
              Appointments
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeView === 'waitlist' && styles.toggleButtonActive
            ]}
            onPress={() => setActiveView('waitlist')}
          >
            <Users size={16} color={activeView === 'waitlist' ? COLORS.card : COLORS.text} />
            <Text style={[
              styles.toggleButtonText,
              activeView === 'waitlist' && styles.toggleButtonTextActive
            ]}>
              Waitlist
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateSelector}>
          <TouchableOpacity style={styles.dateNavButton}>
            <ChevronLeft size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <TouchableOpacity style={styles.dateNavButton}>
            <ChevronRight size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filter by:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['all', 'provider', 'service', 'status'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedFilter(filter as any)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedFilter === filter && styles.filterChipTextActive
                  ]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{appointments.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{appointments.filter(a => a.status === 'confirmed').length}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{appointments.filter(a => a.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <TouchableOpacity style={styles.analyticsButton} onPress={handleAnalytics}>
            <Text style={styles.analyticsButtonText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeView === 'appointments' ? (
        <ScrollView style={styles.scrollView}>
          <View style={styles.appointmentsList}>
            {appointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => handleAppointmentPress(appointment.id)}
                activeOpacity={0.7}
              >
                <View style={styles.appointmentHeader}>
                  <View style={styles.timeContainer}>
                    <Clock size={16} color={COLORS.text} />
                    <Text style={styles.appointmentTime}>{appointment.time}</Text>
                    <Text style={styles.appointmentDuration}>({appointment.duration})</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(appointment.status) }
                  ]}>
                    <Text style={styles.statusText}>{appointment.status}</Text>
                  </View>
                </View>

                <View style={styles.appointmentContent}>
                  <View style={styles.appointmentInfo}>
                    <View style={styles.infoRow}>
                      <User size={14} color={COLORS.text} />
                      <Text style={styles.clientName}>{appointment.clientName}</Text>
                    </View>
                    <Text style={styles.providerName}>with {appointment.providerName}</Text>
                    <Text style={styles.serviceName}>{appointment.service}</Text>
                  </View>
                  <View style={styles.appointmentPrice}>
                    <Text style={styles.priceText}>{appointment.price}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.viewButton}>
                  <Eye size={16} color={COLORS.primary} />
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Daily Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Revenue</Text>
                <Text style={styles.summaryValue}>$245</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Peak Hours</Text>
                <Text style={styles.summaryValue}>2:00 - 4:00 PM</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Provider Capacity</Text>
                <Text style={styles.summaryValue}>85%</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <WaitlistManagement shopId={shopId} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    ...GLASS_STYLES.card,
    paddingBottom: 16,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  filterButton: {
    ...GLASS_STYLES.button,
    padding: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dateNavButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginHorizontal: 16,
    textAlign: 'center' as const,
    flex: 1,
    fontFamily: FONTS.bold,
  },
  filtersContainer: {
    ...GLASS_STYLES.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    opacity: 1,
  },
  filterChip: {
    ...GLASS_STYLES.button,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.text,
    opacity: 0.95,
  },
  filterChipTextActive: {
    color: COLORS.card,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 2,
    opacity: 0.95,
  },
  analyticsButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  analyticsButtonText: {
    color: COLORS.card,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  appointmentsList: {
    padding: 16,
  },
  appointmentCard: {
    ...GLASS_STYLES.card,
    padding: 16,
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  appointmentDuration: {
    fontSize: 12,
    color: COLORS.text,
    opacity: 0.9,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.card,
    textTransform: 'uppercase',
  },
  appointmentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  providerName: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
    opacity: 1,
  },
  serviceName: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  appointmentPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
  },
  viewButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  summarySection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryCard: {
    ...GLASS_STYLES.card,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.95,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  viewToggle: {
    flexDirection: 'row',
    ...GLASS_STYLES.card,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    opacity: 0.95,
  },
  toggleButtonTextActive: {
    color: COLORS.card,
    fontWeight: '600',
  },
});