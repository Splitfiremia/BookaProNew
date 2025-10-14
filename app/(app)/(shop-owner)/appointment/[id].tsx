import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, User, Calendar, Clock, DollarSign, MapPin, Phone, Mail } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

export default function AppointmentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock appointment data - in real app, fetch based on id
  const appointment = {
    id: id as string,
    clientName: 'Sarah Johnson',
    clientPhone: '+1 (555) 123-4567',
    clientEmail: 'sarah.johnson@email.com',
    providerName: 'Mike Chen',
    service: 'Haircut & Style',
    date: 'December 16, 2024',
    time: '2:00 PM',
    duration: '45 minutes',
    price: '$65',
    status: 'completed',
    notes: 'Client requested a modern layered cut with face-framing highlights.',
    location: 'Uptown Salon, 123 Main St',
    paymentMethod: 'Credit Card',
    tip: '$10',
    totalPaid: '$75',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(appointment.status) }
          ]}>
            <Text style={styles.statusText}>{appointment.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.readOnlyLabel}>Read-Only View</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{appointment.clientName}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Phone size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{appointment.clientPhone}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Mail size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{appointment.clientEmail}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Provider</Text>
                <Text style={styles.infoValue}>{appointment.providerName}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Calendar size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{appointment.date}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Clock size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{appointment.time} ({appointment.duration})</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{appointment.location}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service & Pricing</Text>
          <View style={styles.infoCard}>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceName}>{appointment.service}</Text>
              <Text style={styles.servicePrice}>{appointment.price}</Text>
            </View>
            <View style={styles.pricingBreakdown}>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Service</Text>
                <Text style={styles.pricingValue}>{appointment.price}</Text>
              </View>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Tip</Text>
                <Text style={styles.pricingValue}>{appointment.tip}</Text>
              </View>
              <View style={styles.pricingDivider} />
              <View style={styles.pricingRow}>
                <Text style={styles.pricingTotalLabel}>Total Paid</Text>
                <Text style={styles.pricingTotalValue}>{appointment.totalPaid}</Text>
              </View>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Payment Method</Text>
                <Text style={styles.pricingValue}>{appointment.paymentMethod}</Text>
              </View>
            </View>
          </View>
        </View>

        {appointment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Intelligence</Text>
          <View style={styles.analyticsCard}>
            <View style={styles.analyticsRow}>
              <Text style={styles.analyticsLabel}>Revenue Contribution</Text>
              <Text style={styles.analyticsValue}>3.1% of daily total</Text>
            </View>
            <View style={styles.analyticsRow}>
              <Text style={styles.analyticsLabel}>Provider Utilization</Text>
              <Text style={styles.analyticsValue}>45 min of 8-hour day</Text>
            </View>
            <View style={styles.analyticsRow}>
              <Text style={styles.analyticsLabel}>Time Slot</Text>
              <Text style={styles.analyticsValue}>Peak hours (2-4 PM)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
    padding: 16,
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.card,
  },
  readOnlyLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    fontStyle: 'italic',
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  pricingBreakdown: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  pricingValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  pricingDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  pricingTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  pricingTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  notesCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  analyticsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  analyticsLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  analyticsValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});