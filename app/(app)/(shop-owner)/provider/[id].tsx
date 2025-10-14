import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Star,
  Edit,
} from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import EditProviderModal, { Provider } from '@/components/EditProviderModal';

const { width } = Dimensions.get('window');

const mockProvider: Provider = {
  id: '1',
  name: 'Marcus Johnson',
  email: 'marcus@example.com',
  phone: '(555) 123-4567',
  profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  role: 'admin',
  compensationModel: 'commission',
  commissionRate: 65,
  boothRentFee: 0,
  isActive: true,
  shopId: 'shop1',
  joinedDate: '2023-01-15',
  totalEarnings: 45000,
  clientCount: 120,
  occupancyRate: 85,
};

const mockAppointments = [
  {
    id: '1',
    clientName: 'John Smith',
    service: 'Haircut & Beard Trim',
    date: '2024-01-15',
    time: '10:00 AM',
    duration: 45,
    price: 75,
    status: 'completed',
  },
  {
    id: '2',
    clientName: 'Mike Johnson',
    service: 'Haircut',
    date: '2024-01-15',
    time: '11:00 AM',
    duration: 30,
    price: 55,
    status: 'completed',
  },
  {
    id: '3',
    clientName: 'David Wilson',
    service: 'Beard Styling',
    date: '2024-01-16',
    time: '2:00 PM',
    duration: 30,
    price: 35,
    status: 'upcoming',
  },
  {
    id: '4',
    clientName: 'Alex Brown',
    service: 'Full Service',
    date: '2024-01-16',
    time: '3:30 PM',
    duration: 60,
    price: 95,
    status: 'upcoming',
  },
];

const mockServices = [
  { id: '1', name: 'Haircut', price: 55, isOffered: true },
  { id: '2', name: 'Beard Trim', price: 30, isOffered: true },
  { id: '3', name: 'Haircut & Beard', price: 75, isOffered: true },
  { id: '4', name: 'Hot Towel Shave', price: 45, isOffered: false },
  { id: '5', name: 'Hair Wash', price: 25, isOffered: true },
];

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [provider, setProvider] = useState<Provider>(mockProvider); // In real app, fetch by id

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'upcoming': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return COLORS.secondary;
    }
  };

  const getRoleColor = (role: Provider['role']) => {
    switch (role) {
      case 'admin': return '#FF6B35';
      case 'standard': return '#4CAF50';
      case 'associate': return '#2196F3';
      default: return COLORS.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const periodMetrics = {
    week: { earnings: 1250, appointments: 18, newClients: 3 },
    month: { earnings: 5200, appointments: 72, newClients: 12 },
    year: { earnings: 45000, appointments: 650, newClients: 85 },
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Details</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          testID="edit-provider-button"
          onPress={() => setIsEditModalVisible(true)}
        >
          <Edit size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: provider.profileImage }} style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(provider.role)}20` }]}>
              <Text style={[styles.roleBadgeText, { color: getRoleColor(provider.role) }]}>
                {provider.role.charAt(0).toUpperCase() + provider.role.slice(1)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: provider.isActive ? '#4CAF5020' : '#F4433620' }]}>
              <Text style={[styles.statusBadgeText, { color: provider.isActive ? '#4CAF50' : '#F44336' }]}>
                {provider.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text style={styles.joinedDate}>Joined {formatDate(provider.joinedDate)}</Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactSection}>
        <TouchableOpacity style={styles.contactItem} testID="call-provider">
          <Phone size={20} color={COLORS.primary} />
          <Text style={styles.contactText}>{provider.phone}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactItem} testID="email-provider">
          <Mail size={20} color={COLORS.primary} />
          <Text style={styles.contactText}>{provider.email}</Text>
        </TouchableOpacity>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period)}
                testID={`period-${period}`}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <DollarSign size={24} color="#4CAF50" />
            <Text style={styles.metricValue}>
              ${periodMetrics[selectedPeriod].earnings.toLocaleString()}
            </Text>
            <Text style={styles.metricLabel}>Earnings</Text>
          </View>
          <View style={styles.metricCard}>
            <Calendar size={24} color="#2196F3" />
            <Text style={styles.metricValue}>
              {periodMetrics[selectedPeriod].appointments}
            </Text>
            <Text style={styles.metricLabel}>Appointments</Text>
          </View>
          <View style={styles.metricCard}>
            <Users size={24} color="#FF9800" />
            <Text style={styles.metricValue}>
              {periodMetrics[selectedPeriod].newClients}
            </Text>
            <Text style={styles.metricLabel}>New Clients</Text>
          </View>
          <View style={styles.metricCard}>
            <TrendingUp size={24} color="#9C27B0" />
            <Text style={styles.metricValue}>{provider.occupancyRate}%</Text>
            <Text style={styles.metricLabel}>Occupancy</Text>
          </View>
        </View>
      </View>

      {/* Compensation Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compensation Model</Text>
        <View style={styles.compensationCard}>
          <DollarSign size={20} color={COLORS.primary} />
          <Text style={styles.compensationText}>
            {provider.compensationModel === 'commission' 
              ? `${provider.commissionRate}% Commission`
              : `$${provider.boothRentFee}/week Booth Rent`
            }
          </Text>
        </View>
      </View>

      {/* Services Offered */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services Offered</Text>
        <View style={styles.servicesGrid}>
          {mockServices.map((service) => (
            <View
              key={service.id}
              style={[
                styles.serviceCard,
                !service.isOffered && styles.serviceCardDisabled
              ]}
            >
              <Text style={[
                styles.serviceName,
                !service.isOffered && styles.serviceNameDisabled
              ]}>
                {service.name}
              </Text>
              <Text style={[
                styles.servicePrice,
                !service.isOffered && styles.servicePriceDisabled
              ]}>
                ${service.price}
              </Text>
              {!service.isOffered && (
                <Text style={styles.notOfferedText}>Not Offered</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Recent Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Schedule</Text>
        {mockAppointments.map((appointment) => (
          <View key={appointment.id} style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Text style={styles.clientName}>{appointment.clientName}</Text>
              <View style={[
                styles.appointmentStatus,
                { backgroundColor: `${getStatusColor(appointment.status)}20` }
              ]}>
                <Text style={[
                  styles.appointmentStatusText,
                  { color: getStatusColor(appointment.status) }
                ]}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.serviceName}>{appointment.service}</Text>
            <View style={styles.appointmentDetails}>
              <View style={styles.appointmentDetail}>
                <Calendar size={16} color={COLORS.secondary} />
                <Text style={styles.appointmentDetailText}>
                  {formatDate(appointment.date)}
                </Text>
              </View>
              <View style={styles.appointmentDetail}>
                <Clock size={16} color={COLORS.secondary} />
                <Text style={styles.appointmentDetailText}>
                  {appointment.time} ({appointment.duration}min)
                </Text>
              </View>
              <View style={styles.appointmentDetail}>
                <DollarSign size={16} color={COLORS.secondary} />
                <Text style={styles.appointmentDetailText}>
                  ${appointment.price}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Edit Provider Modal */}
      <EditProviderModal
        visible={isEditModalVisible}
        provider={provider}
        onClose={() => setIsEditModalVisible(false)}
        onSave={(updatedProvider) => {
          setProvider(updatedProvider);
          setIsEditModalVisible(false);
          console.log('Provider updated:', updatedProvider);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  editButton: {
    padding: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card,
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  joinedDate: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  contactSection: {
    backgroundColor: COLORS.card,
    marginBottom: 16,
    paddingVertical: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  section: {
    backgroundColor: COLORS.card,
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 56) / 2,
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  compensationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compensationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceCard: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: (width - 56) / 2,
    alignItems: 'center',
  },
  serviceCardDisabled: {
    opacity: 0.5,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceNameDisabled: {
    color: COLORS.secondary,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  servicePriceDisabled: {
    color: COLORS.secondary,
  },
  notOfferedText: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 4,
  },
  appointmentCard: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  appointmentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appointmentDetailText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginLeft: 4,
  },
});