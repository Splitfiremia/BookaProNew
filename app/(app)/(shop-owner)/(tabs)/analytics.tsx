import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Eye } from 'lucide-react-native';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';

interface AnalyticsCard {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

const analyticsCards: AnalyticsCard[] = [
  {
    title: 'Peak Hours Revenue',
    value: '$1,850',
    change: 18.5,
    trend: 'up',
    icon: Clock,
    color: '#4CAF50',
  },
  {
    title: 'Provider Capacity',
    value: '87%',
    change: 5.2,
    trend: 'up',
    icon: Users,
    color: '#2196F3',
  },
  {
    title: 'Avg. Appointment Value',
    value: '$78',
    change: -2.1,
    trend: 'down',
    icon: DollarSign,
    color: '#FF9800',
  },
];

export default function BusinessAnalyticsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  const handleAppointmentDetails = (appointmentId: string) => {
    router.push(`/appointment/${appointmentId}`);
  };

  const peakHours = [
    { time: '9:00 AM', appointments: 8, revenue: '$520' },
    { time: '11:00 AM', appointments: 12, revenue: '$780' },
    { time: '2:00 PM', appointments: 15, revenue: '$950' },
    { time: '4:00 PM', appointments: 10, revenue: '$650' },
  ];

  const topProviders = [
    { name: 'Mike Chen', appointments: 18, revenue: '$1,240', capacity: '95%' },
    { name: 'Emily Davis', appointments: 15, revenue: '$1,180', capacity: '88%' },
    { name: 'Sarah Johnson', appointments: 12, revenue: '$890', capacity: '75%' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Business Analytics</Text>
        <Text style={styles.subtitle}>Performance Insights</Text>
      </View>

      <View style={styles.periodSelector}>
        {(['day', 'week', 'month'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive
            ]}>
              {period === 'day' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.cardsContainer}>
          {analyticsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <View key={index} style={styles.analyticsCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: `${card.color}20` }]}>
                    <Icon size={20} color={card.color} />
                  </View>
                  <View style={styles.trendContainer}>
                    {card.trend === 'up' ? (
                      <TrendingUp size={14} color="#4CAF50" />
                    ) : (
                      <TrendingDown size={14} color="#F44336" />
                    )}
                    <Text style={[
                      styles.changeText,
                      { color: card.trend === 'up' ? '#4CAF50' : '#F44336' }
                    ]}>
                      {card.change > 0 ? '+' : ''}{card.change}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardValue}>{card.value}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peak Hours Analysis</Text>
          <View style={styles.peakHoursContainer}>
            {peakHours.map((hour, index) => (
              <View key={index} style={styles.peakHourCard}>
                <Text style={styles.peakHourTime}>{hour.time}</Text>
                <Text style={styles.peakHourAppointments}>{hour.appointments} appointments</Text>
                <Text style={styles.peakHourRevenue}>{hour.revenue}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Provider Performance</Text>
          <View style={styles.providersContainer}>
            {topProviders.map((provider, index) => (
              <View key={index} style={styles.providerCard}>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerStats}>
                    {provider.appointments} appointments • {provider.revenue}
                  </Text>
                </View>
                <View style={styles.capacityContainer}>
                  <Text style={styles.capacityText}>{provider.capacity}</Text>
                  <Text style={styles.capacityLabel}>Capacity</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
          <View style={styles.revenueCard}>
            <View style={styles.revenueRow}>
              <Text style={styles.revenueLabel}>Service Revenue</Text>
              <Text style={styles.revenueValue}>$2,180</Text>
            </View>
            <View style={styles.revenueRow}>
              <Text style={styles.revenueLabel}>Tips</Text>
              <Text style={styles.revenueValue}>$270</Text>
            </View>
            <View style={styles.revenueRow}>
              <Text style={styles.revenueLabel}>Commission (15%)</Text>
              <Text style={[styles.revenueValue, { color: COLORS.error }]}>-$327</Text>
            </View>
            <View style={styles.revenueDivider} />
            <View style={styles.revenueRow}>
              <Text style={styles.revenueTotalLabel}>Net Revenue</Text>
              <Text style={styles.revenueTotalValue}>$2,123</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Appointments</Text>
          <Text style={styles.sectionSubtitle}>Read-only details view</Text>
          {[
            { id: '1', client: 'Sarah Johnson', provider: 'Mike Chen', service: 'Haircut', time: '2:00 PM', status: 'completed' },
            { id: '2', client: 'David Wilson', provider: 'Emily Davis', service: 'Color', time: '3:30 PM', status: 'confirmed' },
            { id: '3', client: 'Lisa Brown', provider: 'Sarah Johnson', service: 'Manicure', time: '4:00 PM', status: 'pending' },
          ].map((appointment, index) => (
            <TouchableOpacity
              key={index}
              style={styles.appointmentItem}
              onPress={() => handleAppointmentDetails(appointment.id)}
            >
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentClient}>{appointment.client}</Text>
                <Text style={styles.appointmentDetails}>
                  {appointment.service} with {appointment.provider} at {appointment.time}
                </Text>
              </View>
              <View style={styles.appointmentActions}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: appointment.status === 'completed' ? '#4CAF50' : appointment.status === 'confirmed' ? '#2196F3' : '#FF9800' }
                ]}>
                  <Text style={styles.statusText}>{appointment.status}</Text>
                </View>
                <Eye size={16} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          ))}
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
    ...GLASS_STYLES.card,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    ...GLASS_STYLES.card,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    ...GLASS_STYLES.button,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  periodButtonTextActive: {
    color: COLORS.card,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    ...GLASS_STYLES.card,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 12,
  },
  peakHoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  peakHourCard: {
    flex: 1,
    minWidth: '45%',
    ...GLASS_STYLES.card,
    padding: 12,
    alignItems: 'center',
  },
  peakHourTime: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  peakHourAppointments: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  peakHourRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: 4,
  },
  providersContainer: {
    gap: 12,
  },
  providerCard: {
    ...GLASS_STYLES.card,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  providerStats: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  capacityContainer: {
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  capacityLabel: {
    fontSize: 10,
    color: COLORS.secondary,
  },
  revenueCard: {
    ...GLASS_STYLES.card,
    padding: 16,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  revenueLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  revenueValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  revenueDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  revenueTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  revenueTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  appointmentItem: {
    ...GLASS_STYLES.card,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentClient: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  appointmentDetails: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  appointmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
});