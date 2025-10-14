import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  ChevronDown,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { mockAppointments } from '@/mocks/appointments';

// Get screen width for responsive chart
const screenWidth = Dimensions.get('window').width;

// Define time periods for filtering
type TimePeriod = 'day' | 'week' | 'month' | 'year';

// Define service summary interface
interface ServiceSummary {
  name: string;
  count: number;
  revenue: number;
  percentOfTotal: number;
}

// Define tip interface
interface Tip {
  id: string;
  clientName: string;
  date: string;
  amount: number;
  service: string;
}

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState<boolean>(false);
  
  // Calculate earnings based on selected period
  const earnings = useMemo(() => {
    // In a real app, this would filter by actual dates
    // For this demo, we'll just use the mock data
    
    // Get completed appointments
    const completedAppointments = mockAppointments.filter(
      appointment => appointment.status === 'completed'
    );
    
    // Calculate total earnings
    const totalEarnings = completedAppointments.reduce(
      (sum, appointment) => sum + appointment.price,
      0
    );
    
    // Calculate earnings by service
    const serviceMap = new Map<string, ServiceSummary>();
    completedAppointments.forEach(appointment => {
      const existing = serviceMap.get(appointment.service);
      if (existing) {
        existing.count += 1;
        existing.revenue += appointment.price;
      } else {
        serviceMap.set(appointment.service, {
          name: appointment.service,
          count: 1,
          revenue: appointment.price,
          percentOfTotal: 0, // Will calculate after
        });
      }
    });
    
    // Calculate percentages
    const serviceBreakdown = Array.from(serviceMap.values()).map(service => ({
      ...service,
      percentOfTotal: (service.revenue / totalEarnings) * 100,
    }));
    
    // Sort by revenue (highest first)
    serviceBreakdown.sort((a, b) => b.revenue - a.revenue);
    
    // Generate some tips (in a real app, these would come from the database)
    const tips: Tip[] = [
      {
        id: 'tip-1',
        clientName: 'Michael Brown',
        date: 'Sep 13, 2025',
        amount: 10,
        service: 'Haircut',
      },
      {
        id: 'tip-2',
        clientName: 'Sarah Johnson',
        date: 'Sep 12, 2025',
        amount: 15,
        service: 'Color & Highlights',
      },
      {
        id: 'tip-3',
        clientName: 'David Wilson',
        date: 'Sep 10, 2025',
        amount: 8,
        service: 'Beard Trim',
      },
      {
        id: 'tip-4',
        clientName: 'Emma Davis',
        date: 'Sep 8, 2025',
        amount: 20,
        service: 'Haircut & Style',
      },
    ];
    
    // Calculate total tips
    const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0);
    
    // Generate daily earnings for chart
    const today = new Date();
    const dailyEarnings = [];
    
    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random earnings between 100 and 300
      const amount = Math.floor(Math.random() * 200) + 100;
      
      dailyEarnings.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount,
      });
    }
    
    // Calculate comparison with previous period (random for demo)
    const changePercent = Math.floor(Math.random() * 30) - 10; // Between -10% and +20%
    
    return {
      today: dailyEarnings[6].amount,
      thisWeek: dailyEarnings.reduce((sum, day) => sum + day.amount, 0),
      thisMonth: dailyEarnings.reduce((sum, day) => sum + day.amount, 0) * 4, // Approximate
      changePercent,
      serviceBreakdown,
      dailyEarnings,
      tips,
      totalTips,
    };
  }, [selectedPeriod]);
  
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    setShowPeriodDropdown(false);
  };
  
  const togglePeriodDropdown = () => {
    setShowPeriodDropdown(!showPeriodDropdown);
  };
  
  // Format period label
  const getPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
      case 'day':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return 'This Week';
    }
  };
  
  // Get max value for chart scaling
  const maxChartValue = Math.max(...earnings.dailyEarnings.map(day => day.amount));
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Period Selector */}
        <View style={styles.periodSelectorContainer}>
          <TouchableOpacity 
            style={styles.periodSelector}
            onPress={togglePeriodDropdown}
          >
            <Text style={styles.periodSelectorText}>{getPeriodLabel(selectedPeriod)}</Text>
            <ChevronDown size={20} color={COLORS.text} />
          </TouchableOpacity>
          
          {showPeriodDropdown && (
            <View style={styles.periodDropdown}>
              <TouchableOpacity 
                style={styles.periodOption}
                onPress={() => handlePeriodChange('day')}
              >
                <Text style={[
                  styles.periodOptionText,
                  selectedPeriod === 'day' && styles.selectedPeriodText
                ]}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.periodOption}
                onPress={() => handlePeriodChange('week')}
              >
                <Text style={[
                  styles.periodOptionText,
                  selectedPeriod === 'week' && styles.selectedPeriodText
                ]}>This Week</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.periodOption}
                onPress={() => handlePeriodChange('month')}
              >
                <Text style={[
                  styles.periodOptionText,
                  selectedPeriod === 'month' && styles.selectedPeriodText
                ]}>This Month</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.periodOption}
                onPress={() => handlePeriodChange('year')}
              >
                <Text style={[
                  styles.periodOptionText,
                  selectedPeriod === 'year' && styles.selectedPeriodText
                ]}>This Year</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Earnings Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.totalEarningsContainer}>
            <Text style={styles.totalEarningsLabel}>Total Earnings</Text>
            <View style={styles.totalEarningsRow}>
              <Text style={styles.totalEarningsValue}>
                ${selectedPeriod === 'day' ? earnings.today : 
                   selectedPeriod === 'week' ? earnings.thisWeek : 
                   earnings.thisMonth}
              </Text>
              <View style={[
                styles.changeIndicator,
                earnings.changePercent >= 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {earnings.changePercent >= 0 ? (
                  <ArrowUpRight size={16} color={COLORS.success} />
                ) : (
                  <ArrowDownRight size={16} color={COLORS.error} />
                )}
                <Text style={[
                  styles.changeText,
                  earnings.changePercent >= 0 ? styles.positiveChangeText : styles.negativeChangeText
                ]}>
                  {Math.abs(earnings.changePercent)}%
                </Text>
              </View>
            </View>
            <Text style={styles.comparedToText}>
              compared to previous {selectedPeriod}
            </Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <DollarSign color={COLORS.primary} size={20} />
              </View>
              <View>
                <Text style={styles.statValue}>${earnings.today}</Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Calendar color={COLORS.primary} size={20} />
              </View>
              <View>
                <Text style={styles.statValue}>${earnings.thisWeek}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp color={COLORS.primary} size={20} />
              </View>
              <View>
                <Text style={styles.statValue}>${earnings.thisMonth}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Earnings Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <BarChart3 color={COLORS.primary} size={20} />
              <Text style={styles.sectionTitle}>Earnings Trend</Text>
            </View>
          </View>
          
          <View style={styles.chart}>
            {earnings.dailyEarnings.map((day, index) => (
              <View key={`chart-day-${index}`} style={styles.chartColumn}>
                <View 
                  style={[
                    styles.chartBar, 
                    { 
                      height: (day.amount / maxChartValue) * 150,
                      backgroundColor: index === earnings.dailyEarnings.length - 1 ? 
                        COLORS.primary : 'rgba(240, 121, 69, 0.5)',
                    }
                  ]}
                />
                <Text style={styles.chartLabel}>{day.date}</Text>
                <Text style={styles.chartValue}>${day.amount}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Service Breakdown */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <DollarSign color={COLORS.primary} size={20} />
              <Text style={styles.sectionTitle}>Earnings by Service</Text>
            </View>
          </View>
          
          {earnings.serviceBreakdown.map((service, index) => (
            <View key={`service-${index}`} style={styles.serviceRow}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceCount}>{service.count} appointments</Text>
              </View>
              <View style={styles.serviceRevenue}>
                <Text style={styles.serviceRevenueValue}>${service.revenue}</Text>
                <Text style={styles.servicePercentage}>{service.percentOfTotal.toFixed(1)}%</Text>
              </View>
              <View style={styles.serviceBarContainer}>
                <View 
                  style={[
                    styles.serviceBar,
                    { width: `${service.percentOfTotal}%` }
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
        
        {/* Tips Received */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <DollarSign color={COLORS.primary} size={20} />
              <Text style={styles.sectionTitle}>Tips Received</Text>
            </View>
            <View style={styles.tipTotalContainer}>
              <Text style={styles.tipTotalLabel}>Total:</Text>
              <Text style={styles.tipTotalValue}>${earnings.totalTips}</Text>
            </View>
          </View>
          
          {earnings.tips.map((tip, index) => (
            <View key={`tip-${index}`} style={styles.tipRow}>
              <View style={styles.tipInfo}>
                <Text style={styles.tipClientName}>{tip.clientName}</Text>
                <Text style={styles.tipService}>{tip.service}</Text>
              </View>
              <View style={styles.tipDetails}>
                <Text style={styles.tipDate}>{tip.date}</Text>
                <Text style={styles.tipAmount}>${tip.amount}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  periodSelectorContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  periodSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  periodDropdown: {
    position: 'absolute',
    top: 64,
    left: 16,
    right: 16,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    zIndex: 20,
  },
  periodOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  periodOptionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedPeriodText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  summaryContainer: {
    padding: 16,
    marginTop: 16,
  },
  totalEarningsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  totalEarningsLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  totalEarningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalEarningsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginRight: 12,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  positiveChange: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  negativeChange: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  positiveChangeText: {
    color: COLORS.success,
  },
  negativeChangeText: {
    color: COLORS.error,
  },
  comparedToText: {
    fontSize: 12,
    color: '#999',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `rgba(${parseInt(COLORS.primary.slice(1, 3), 16)}, ${parseInt(COLORS.primary.slice(3, 5), 16)}, ${parseInt(COLORS.primary.slice(5, 7), 16)}, 0.1)`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  chartContainer: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
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
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
  },
  chartColumn: {
    alignItems: 'center',
    width: (screenWidth - 64) / 7, // Divide available width by 7 days
  },
  chartBar: {
    width: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  chartLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  chartValue: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 4,
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  serviceRow: {
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  serviceCount: {
    fontSize: 12,
    color: '#999',
  },
  serviceRevenue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceRevenueValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  servicePercentage: {
    fontSize: 14,
    color: '#999',
  },
  serviceBarContainer: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  serviceBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  tipTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipTotalLabel: {
    fontSize: 14,
    color: '#999',
    marginRight: 4,
  },
  tipTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  tipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tipInfo: {
    flex: 1,
  },
  tipClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  tipService: {
    fontSize: 14,
    color: '#999',
  },
  tipDetails: {
    alignItems: 'flex-end',
  },
  tipDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  tipAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
    fontFamily: FONTS.bold,
  },
});