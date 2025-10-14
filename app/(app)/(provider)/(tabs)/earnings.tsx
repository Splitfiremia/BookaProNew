import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useWindowDimensions,
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { ChevronDown, DollarSign, TrendingUp, Calendar } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';
import { Payment } from '@/models/database';

type DateFilter = 'today' | 'week' | 'month' | 'quarter' | 'custom';

interface EarningsData {
  serviceRevenue: number;
  tipAmount: number;
  totalEarnings: number;
  grossEarnings: number;
  netPayout: number;
  transactionCount: number;
}

interface Transaction {
  id: string;
  clientName: string;
  serviceName: string;
  date: string;
  servicePrice: number;
  tipAmount: number;
  totalAmount: number;
}

// Mock payment data - in real app this would come from payment provider
const mockPayments: Payment[] = [
  {
    id: 'pay-1',
    appointmentId: '1',
    amount: 55,
    tipAmount: 10,
    status: 'completed',
    paymentMethod: 'card',
    createdAt: '2024-09-16T17:30:00Z',
    updatedAt: '2024-09-16T17:30:00Z'
  },
  {
    id: 'pay-2',
    appointmentId: '3',
    amount: 45,
    tipAmount: 8,
    status: 'completed',
    paymentMethod: 'cash',
    createdAt: '2024-09-15T11:45:00Z',
    updatedAt: '2024-09-15T11:45:00Z'
  },
  {
    id: 'pay-3',
    appointmentId: '5',
    amount: 60,
    tipAmount: 12,
    status: 'completed',
    paymentMethod: 'card',
    createdAt: '2024-09-14T16:00:00Z',
    updatedAt: '2024-09-14T16:00:00Z'
  },
  {
    id: 'pay-4',
    appointmentId: '6',
    amount: 75,
    tipAmount: 15,
    status: 'completed',
    paymentMethod: 'card',
    createdAt: '2024-09-13T14:30:00Z',
    updatedAt: '2024-09-13T14:30:00Z'
  },
  {
    id: 'pay-5',
    appointmentId: '7',
    amount: 40,
    tipAmount: 5,
    status: 'completed',
    paymentMethod: 'cash',
    createdAt: '2024-09-12T10:15:00Z',
    updatedAt: '2024-09-12T10:15:00Z'
  },
  {
    id: 'pay-6',
    appointmentId: '8',
    amount: 85,
    tipAmount: 20,
    status: 'completed',
    paymentMethod: 'card',
    createdAt: '2024-09-11T15:45:00Z',
    updatedAt: '2024-09-11T15:45:00Z'
  },
  {
    id: 'pay-7',
    appointmentId: '9',
    amount: 50,
    tipAmount: 8,
    status: 'completed',
    paymentMethod: 'card',
    createdAt: '2024-09-10T12:00:00Z',
    updatedAt: '2024-09-10T12:00:00Z'
  }
];

// Mock services data
const mockServices = [
  { id: 's1', name: 'Haircut', price: 55 },
  { id: 's2', name: 'Beard Trim', price: 30 },
  { id: 's3', name: 'Hair Styling', price: 60 },
  { id: 's4', name: 'Color Treatment', price: 85 },
  { id: 's5', name: 'Shampoo & Cut', price: 45 }
];

// Mock client names
const mockClients = [
  'Michael Chen',
  'David Rodriguez', 
  'Sarah Johnson',
  'James Wilson',
  'Maria Lopez',
  'Carlos Rivera',
  'Amanda Smith'
];

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedFilter, setSelectedFilter] = useState<DateFilter>('week');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);

  // Mock provider data - in real app this would come from provider context
  const providerData = useMemo(() => ({
    isShopBased: true,
    shopId: 'shop-1',
    compensationModel: 'commission' as const,
    commissionRate: 0.65, // 65%
    boothRentFee: 0
  }), []);

  const filterOptions = [
    { key: 'today' as DateFilter, label: 'Today' },
    { key: 'week' as DateFilter, label: 'Last 7 Days' },
    { key: 'month' as DateFilter, label: 'Last 30 Days' },
    { key: 'quarter' as DateFilter, label: 'Last Quarter' },
    { key: 'custom' as DateFilter, label: 'Custom Range' }
  ];

  // Calculate date range based on filter
  const getDateRange = (filter: DateFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        return { start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), end: now };
      case 'month':
        return { start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), end: now };
      case 'quarter':
        return { start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000), end: now };
      default:
        return { start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), end: now };
    }
  };

  // Filter payments by date range
  const filteredPayments = useMemo(() => {
    const { start, end } = getDateRange(selectedFilter);
    return mockPayments.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= start && paymentDate <= end;
    });
  }, [selectedFilter]);

  // Calculate earnings data
  const earningsData = useMemo((): EarningsData => {
    const serviceRevenue = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const tipAmount = filteredPayments.reduce((sum, payment) => sum + payment.tipAmount, 0);
    const grossEarnings = serviceRevenue + tipAmount;
    
    let netPayout = grossEarnings;
    if (providerData.isShopBased) {
      if (providerData.compensationModel === 'commission') {
        netPayout = grossEarnings * providerData.commissionRate;
      } else if (providerData.compensationModel === 'booth_rent') {
        netPayout = grossEarnings - providerData.boothRentFee;
      }
    }
    
    return {
      serviceRevenue,
      tipAmount,
      totalEarnings: grossEarnings,
      grossEarnings,
      netPayout,
      transactionCount: filteredPayments.length
    };
  }, [filteredPayments, providerData]);

  // Generate chart data
  const chartData = useMemo(() => {
    const { start, end } = getDateRange(selectedFilter);
    const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const labels: string[] = [];
    const data: number[] = [];
    
    for (let i = 0; i < Math.min(days, 7); i++) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const dayPayments = mockPayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.toDateString() === date.toDateString();
      });
      
      const dayEarnings = dayPayments.reduce((sum, payment) => {
        const gross = payment.amount + payment.tipAmount;
        return sum + (providerData.isShopBased && providerData.compensationModel === 'commission' 
          ? gross * providerData.commissionRate 
          : gross);
      }, 0);
      
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      data.push(dayEarnings);
    }
    
    return { labels, datasets: [{ data }] };
  }, [selectedFilter, providerData]);

  // Generate transactions list
  const transactions = useMemo((): Transaction[] => {
    return filteredPayments.map((payment, index) => {
      const service = mockServices[index % mockServices.length];
      const client = mockClients[index % mockClients.length];
      
      return {
        id: payment.id,
        clientName: client,
        serviceName: service.name,
        date: new Date(payment.createdAt).toLocaleDateString(),
        servicePrice: payment.amount,
        tipAmount: payment.tipAmount,
        totalAmount: payment.amount + payment.tipAmount
      };
    }).reverse(); // Show most recent first
  }, [filteredPayments]);

  // Calculate service breakdown
  const serviceBreakdown = useMemo(() => {
    const breakdown = new Map<string, { revenue: number, count: number }>();
    
    transactions.forEach(transaction => {
      const existing = breakdown.get(transaction.serviceName) || { revenue: 0, count: 0 };
      breakdown.set(transaction.serviceName, {
        revenue: existing.revenue + transaction.servicePrice,
        count: existing.count + 1
      });
    });
    
    return Array.from(breakdown.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [transactions]);

  const formatCurrency = (amount: number) => `${amount.toFixed(2)}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Earnings</Text>
          
          {/* Date Filter */}
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Calendar size={16} color={COLORS.primary} />
            <Text style={styles.filterText}>
              {filterOptions.find(opt => opt.key === selectedFilter)?.label}
            </Text>
            <ChevronDown size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter Dropdown */}
        {showFilterDropdown && (
          <View style={styles.dropdown}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedFilter(option.key);
                  setShowFilterDropdown(false);
                }}
              >
                <Text style={[
                  styles.dropdownText,
                  selectedFilter === option.key && styles.dropdownTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Summary KPI Cards */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <DollarSign size={20} color={COLORS.success} />
              <Text style={styles.kpiLabel}>Total Earnings</Text>
            </View>
            <Text style={styles.kpiValue}>{formatCurrency(earningsData.totalEarnings)}</Text>
            <Text style={styles.kpiSubtext}>{earningsData.transactionCount} transactions</Text>
          </View>
          
          {providerData.isShopBased && (
            <View style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <TrendingUp size={20} color={COLORS.primary} />
                <Text style={styles.kpiLabel}>Net Payout</Text>
              </View>
              <Text style={styles.kpiValue}>{formatCurrency(earningsData.netPayout)}</Text>
              <Text style={styles.kpiSubtext}>
                {providerData.compensationModel === 'commission' 
                  ? `${(providerData.commissionRate * 100).toFixed(0)}% commission`
                  : 'After booth rent'
                }
              </Text>
            </View>
          )}
          
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <DollarSign size={20} color={COLORS.warning} />
              <Text style={styles.kpiLabel}>Tips</Text>
            </View>
            <Text style={styles.kpiValue}>{formatCurrency(earningsData.tipAmount)}</Text>
            <Text style={styles.kpiSubtext}>From {earningsData.transactionCount} services</Text>
          </View>
        </View>

        {/* Earnings Chart */}
        {chartData.datasets[0].data.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Earnings Trend</Text>
            {Platform.OS !== 'web' ? (
              <LineChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  backgroundColor: COLORS.background,
                  backgroundGradientFrom: COLORS.background,
                  backgroundGradientTo: COLORS.background,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: COLORS.primary,
                  },
                }}
                bezier
                style={styles.chart}
              />
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>Chart not available on web</Text>
              </View>
            )}
          </View>
        )}

        {/* Service Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.sectionTitle}>Earnings by Service</Text>
          {serviceBreakdown.map((service, index) => (
            <View key={service.name} style={styles.breakdownItem}>
              <View style={styles.breakdownInfo}>
                <Text style={styles.breakdownName}>{service.name}</Text>
                <Text style={styles.breakdownCount}>{service.count} services</Text>
              </View>
              <Text style={styles.breakdownAmount}>{formatCurrency(service.revenue)}</Text>
            </View>
          ))}
        </View>

        {/* Transaction List */}
        <View style={styles.transactionContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionClient}>{transaction.clientName}</Text>
                <Text style={styles.transactionService}>{transaction.serviceName}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <View style={styles.transactionAmounts}>
                <Text style={styles.transactionTotal}>
                  {formatCurrency(transaction.totalAmount)}
                </Text>
                <Text style={styles.transactionBreakdown}>
                  Service: {formatCurrency(transaction.servicePrice)}
                  {transaction.tipAmount > 0 && ` + Tip: ${formatCurrency(transaction.tipAmount)}`}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
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
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.card,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontFamily: FONTS.regular,
  },
  dropdown: {
    position: 'absolute',
    top: 80,
    right: SPACING.md,
    ...GLASS_STYLES.card,
    zIndex: 1000,
    minWidth: 150,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownText: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  dropdownTextSelected: {
    color: COLORS.primary,
    fontFamily: FONTS.regular,
  },
  kpiContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  kpiCard: {
    flex: 1,
    ...GLASS_STYLES.card,
    padding: SPACING.md,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  kpiSubtext: {
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  chartContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartPlaceholder: {
    height: 220,
    ...GLASS_STYLES.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 16,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  breakdownContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownName: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    marginBottom: 2,
  },
  breakdownCount: {
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
    fontFamily: FONTS.bold,
  },
  transactionContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 16,
  },
  transactionClient: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    marginBottom: 2,
  },
  transactionService: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  transactionAmounts: {
    alignItems: 'flex-end',
  },
  transactionTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  transactionBreakdown: {
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    textAlign: 'right',
  },
  bottomSpacing: {
    height: 100,
  },
});