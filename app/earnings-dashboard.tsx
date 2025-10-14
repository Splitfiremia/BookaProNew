import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Clock,
  Zap,
  Settings,
  Download,
  Eye,
  ChevronRight,
  Users,
  Target,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Star,
  UserPlus,
  Building2,
} from "lucide-react-native";
import { usePayments } from "@/providers/PaymentProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalytics } from "@/providers/AnalyticsProvider";

export default function EarningsDashboard() {
  const { user } = useAuth();
  const {
    calculateEarnings,
    getPayoutHistory,
    requestInstantPayout,
    payoutSettings,
    isLoading: paymentsLoading,
  } = usePayments();
  const {
    getCurrentAnalytics,
    exportAnalyticsReport,
    getAnalyticsForPeriod,
    isLoading: analyticsLoading,
  } = useAnalytics();
  const [viewMode, setViewMode] = useState<"earnings" | "analytics">("earnings");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [isRequestingPayout, setIsRequestingPayout] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const earnings = useMemo(() => calculateEarnings(), [calculateEarnings]);
  const payoutHistory = useMemo(() => getPayoutHistory(), [getPayoutHistory]);
  const analytics = useMemo(() => getCurrentAnalytics(), [getCurrentAnalytics]);
  const isLoading = paymentsLoading || analyticsLoading;

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      await exportAnalyticsReport(selectedTimePeriod);
      if (Platform.OS === 'web') {
        console.log("Analytics report exported successfully!");
      } else {
        Alert.alert("Success", "Analytics report has been exported successfully!");
      }
    } catch {
      if (Platform.OS === 'web') {
        console.error("Failed to export report. Please try again.");
      } else {
        Alert.alert("Error", "Failed to export report. Please try again.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handlePeriodChange = (period: "daily" | "weekly" | "monthly") => {
    if (!period?.trim() || period.length > 20) {
      console.error("Invalid period parameter");
      return;
    }
    
    const sanitizedPeriod = period.trim();
    setSelectedTimePeriod(sanitizedPeriod as "daily" | "weekly" | "monthly");
    getAnalyticsForPeriod(sanitizedPeriod as "daily" | "weekly" | "monthly");
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  const getGrowthColor = (value: number) => {
    if (value > 0) return "#10B981";
    if (value < 0) return "#EF4444";
    return "#6B7280";
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <ArrowUp size={16} color="#10B981" />;
    if (value < 0) return <ArrowDown size={16} color="#EF4444" />;
    return null;
  };

  const renderEarningsOverview = () => {
    if (!analytics) return null;

    return (
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>Total Earnings</Text>
          <DollarSign size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.overviewAmount}>{formatCurrency(analytics.earnings.totalRevenue)}</Text>
        <View style={styles.overviewStats}>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatLabel}>Service Revenue</Text>
            <Text style={styles.overviewStatValue}>{formatCurrency(analytics.earnings.serviceRevenue)}</Text>
          </View>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatLabel}>Tips</Text>
            <Text style={styles.overviewStatValue}>{formatCurrency(analytics.earnings.tipRevenue)}</Text>
          </View>
        </View>
        <View style={styles.growthIndicator}>
          {getGrowthIcon(analytics.earnings.weekOverWeekGrowth)}
          <Text style={[styles.growthText, { color: getGrowthColor(analytics.earnings.weekOverWeekGrowth) }]}>
            {formatPercentage(analytics.earnings.weekOverWeekGrowth)} vs last week
          </Text>
        </View>
      </LinearGradient>
    );
  };

  const renderBusinessMetrics = () => {
    if (!analytics) return null;

    const metrics = [
      {
        icon: <Calendar size={20} color="#3B82F6" />,
        label: "Total Appointments",
        value: formatNumber(analytics.metrics.totalAppointments),
        subValue: `${analytics.metrics.completedAppointments} completed`,
      },
      {
        icon: <Target size={20} color="#10B981" />,
        label: "Chair Utilization",
        value: `${analytics.metrics.chairUtilizationRate}%`,
        subValue: `${analytics.metrics.hoursWorked}h worked`,
      },
      {
        icon: <DollarSign size={20} color="#F59E0B" />,
        label: "Avg Ticket Size",
        value: formatCurrency(analytics.metrics.averageTicketSize),
        subValue: `${analytics.metrics.averageTipPercentage}% avg tip`,
      },
      {
        icon: <Users size={20} color="#8B5CF6" />,
        label: "Client Retention",
        value: `${analytics.metrics.clientRetentionRate}%`,
        subValue: `${analytics.metrics.repeatBookings} repeat bookings`,
      },
      {
        icon: <UserPlus size={20} color="#EF4444" />,
        label: "New Clients",
        value: formatNumber(analytics.metrics.newClients),
        subValue: "This period",
      },
      {
        icon: <Star size={20} color="#F59E0B" />,
        label: "Average Rating",
        value: analytics.averageRating.toFixed(1),
        subValue: "Customer satisfaction",
      },
    ];

    return (
      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View key={`metric-${metric.label}`} style={styles.metricCard}>
            <View style={styles.metricIcon}>
              {metric.icon}
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricSubValue}>{metric.subValue}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderServicePopularity = () => {
    if (!analytics) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Service Popularity</Text>
          <PieChart size={20} color="#6B7280" />
        </View>
        {analytics.topServices.map((service) => (
          <View key={`service-${service.name}-${service.popularityRank}`} style={styles.serviceItem}>
            <View style={styles.serviceRank}>
              <Text style={styles.serviceRankText}>#{service.popularityRank}</Text>
            </View>
            <View style={styles.serviceDetails}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceStats}>
                {formatNumber(service.count)} bookings • {formatCurrency(service.revenue)} revenue
              </Text>
            </View>
            <View style={styles.serviceGrowth}>
              {getGrowthIcon(service.growthRate)}
              <Text style={[styles.serviceGrowthText, { color: getGrowthColor(service.growthRate) }]}>
                {formatPercentage(service.growthRate)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPeakHours = () => {
    if (!analytics) return null;

    const maxAppointments = Math.max(...analytics.metrics.peakHours.map(h => h.appointmentCount));

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Peak Hours Analysis</Text>
          <BarChart3 size={20} color="#6B7280" />
        </View>
        <View style={styles.chartContainer}>
          {analytics.metrics.peakHours.map((hour) => {
            const barHeight = (hour.appointmentCount / maxAppointments) * 100;
            return (
              <View key={`hour-${hour.hour}`} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, { height: `${barHeight}%` }]} />
                </View>
                <Text style={styles.barLabel}>{hour.hour.split(' ')[0]}</Text>
                <Text style={styles.barValue}>{hour.appointmentCount}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderBusyDays = () => {
    if (!analytics) return null;

    const maxAppointments = Math.max(...analytics.metrics.busyDays.map(d => d.appointmentCount));

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Busy Days</Text>
          <Calendar size={20} color="#6B7280" />
        </View>
        <View style={styles.daysContainer}>
          {analytics.metrics.busyDays.map((day) => {
            const intensity = (day.appointmentCount / maxAppointments) * 100;
            return (
              <View key={`day-${day.day}`} style={styles.dayItem}>
                <Text style={styles.dayName}>{day.day.slice(0, 3)}</Text>
                <View style={styles.dayBar}>
                  <View style={[styles.dayBarFill, { height: `${intensity}%` }]} />
                </View>
                <Text style={styles.dayCount}>{day.appointmentCount}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const handleInstantPayout = async () => {
    if (!payoutSettings) {
      if (Platform.OS === 'web') {
        console.log("Setup Required: Please configure your payout settings first.");
        router.push("/(tabs)/profile");
      } else {
        Alert.alert("Setup Required", "Please configure your payout settings first.", [
          { text: "Cancel", style: "cancel" },
          { text: "Setup", onPress: () => router.push("/(tabs)/profile") },
        ]);
      }
      return;
    }

    if (earnings.pendingEarnings < payoutSettings.minimumPayout) {
      const message = `Minimum payout amount is ${payoutSettings.minimumPayout}. You have ${earnings.pendingEarnings.toFixed(2)} available.`;
      if (Platform.OS === 'web') {
        console.log("Minimum Amount:", message);
      } else {
        Alert.alert("Minimum Amount", message);
      }
      return;
    }

    const fee = earnings.pendingEarnings * (payoutSettings.instantPayoutFee / 100);
    const netAmount = earnings.pendingEarnings - fee;
    const confirmMessage = `Request instant payout of ${earnings.pendingEarnings.toFixed(2)}?\n\nFee: ${fee.toFixed(2)}\nYou'll receive: ${netAmount.toFixed(2)}`;

    const processPayoutRequest = async () => {
      setIsRequestingPayout(true);
      try {
        await requestInstantPayout(earnings.pendingEarnings);
        const successMessage = "Instant payout requested! Funds will arrive within minutes.";
        if (Platform.OS === 'web') {
          console.log("Success:", successMessage);
        } else {
          Alert.alert("Success", successMessage);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to request payout";
        if (Platform.OS === 'web') {
          console.error("Error:", errorMessage);
        } else {
          Alert.alert("Error", errorMessage);
        }
      } finally {
        setIsRequestingPayout(false);
      }
    };

    if (Platform.OS === 'web') {
      console.log("Instant Payout:", confirmMessage);
      if (confirm(confirmMessage)) {
        await processPayoutRequest();
      }
    } else {
      Alert.alert(
        "Instant Payout",
        confirmMessage,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            onPress: processPayoutRequest,
          },
        ]
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10B981";
      case "processing":
        return "#F59E0B";
      case "pending":
        return "#6B7280";
      case "failed":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getPayoutMethodIcon = (method: string) => {
    switch (method) {
      case "instant":
        return <Zap size={16} color="#F59E0B" />;
      case "bank":
        return <CreditCard size={16} color="#6B7280" />;
      default:
        return <CreditCard size={16} color="#6B7280" />;
    }
  };

  if (user?.role === "client") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Earnings</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.noAccessText}>Earnings dashboard is only available for service providers.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings Dashboard</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.settingsButton}>
          <Settings size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Earnings Overview */}
        {/* View Mode Selector */}
        <View style={styles.viewModeSelector}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === "earnings" && styles.viewModeButtonActive]}
            onPress={() => setViewMode("earnings")}
          >
            <DollarSign size={18} color={viewMode === "earnings" ? "#FFFFFF" : "#9CA3AF"} />
            <Text style={[styles.viewModeText, viewMode === "earnings" && styles.viewModeTextActive]}>
              Earnings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === "analytics" && styles.viewModeButtonActive]}
            onPress={() => setViewMode("analytics")}
          >
            <BarChart3 size={18} color={viewMode === "analytics" ? "#FFFFFF" : "#9CA3AF"} />
            <Text style={[styles.viewModeText, viewMode === "analytics" && styles.viewModeTextActive]}>
              Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Overview */}
        {renderEarningsOverview()}

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {["daily", "weekly", "monthly"].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedTimePeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => handlePeriodChange(period as "daily" | "weekly" | "monthly")}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedTimePeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === "daily" ? "Daily" : period === "weekly" ? "Weekly" : "Monthly"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content based on view mode */}
        {viewMode === "earnings" ? (
          <>
            {/* Quick Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <TrendingUp size={20} color="#10B981" />
                </View>
                <Text style={styles.statValue}>
                  {selectedTimePeriod === "daily"
                    ? formatCurrency(analytics?.earnings.dailyEarnings || 0)
                    : selectedTimePeriod === "weekly"
                    ? formatCurrency(analytics?.earnings.weeklyEarnings || 0)
                    : formatCurrency(analytics?.earnings.monthlyEarnings || 0)}
                </Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <DollarSign size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.statValue}>{formatCurrency(analytics?.earnings.tipRevenue || 0)}</Text>
                <Text style={styles.statLabel}>Tips</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Calendar size={20} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>{formatCurrency(analytics?.metrics.averageTicketSize || 0)}</Text>
                <Text style={styles.statLabel}>Avg Transaction</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <CreditCard size={20} color="#EF4444" />
                </View>
                <Text style={styles.statValue}>{formatCurrency(analytics?.earnings.serviceRevenue || 0)}</Text>
                <Text style={styles.statLabel}>Service Revenue</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Business Metrics */}
            {renderBusinessMetrics()}
            
            {/* Service Popularity */}
            {renderServicePopularity()}
            
            {/* Peak Hours Analysis */}
            {renderPeakHours()}
            
            {/* Busy Days */}
            {renderBusyDays()}
          </>
        )}

        {/* Instant Payout */}
        {earnings.pendingEarnings > 0 && (
          <View style={styles.payoutCard}>
            <View style={styles.payoutHeader}>
              <View>
                <Text style={styles.payoutTitle}>Available for Payout</Text>
                <Text style={styles.payoutAmount}>{formatCurrency(earnings.pendingEarnings)}</Text>
              </View>
              <Zap size={24} color="#F59E0B" />
            </View>
            <Text style={styles.payoutDescription}>
              Get your earnings instantly with a {payoutSettings?.instantPayoutFee || 1.5}% fee, or wait for your next scheduled payout.
            </Text>
            <TouchableOpacity
              style={[
                styles.instantPayoutButton,
                (isRequestingPayout || isLoading) && styles.instantPayoutButtonDisabled,
              ]}
              onPress={handleInstantPayout}
              disabled={isRequestingPayout || isLoading}
            >
              {isRequestingPayout ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Zap size={20} color="#FFFFFF" />
                  <Text style={styles.instantPayoutButtonText}>Request Instant Payout</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Payout History */}
        <View style={styles.historySection}>
          <View style={styles.historySectionHeader}>
            <Text style={styles.historySectionTitle}>Payout History</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {payoutHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={48} color="#6B7280" />
              <Text style={styles.emptyStateTitle}>No Payouts Yet</Text>
              <Text style={styles.emptyStateDescription}>
                Your payout history will appear here once you start receiving payments.
              </Text>
            </View>
          ) : (
            payoutHistory.slice(0, 5).map((payout) => (
              <View key={payout.id} style={styles.historyItem}>
                <View style={styles.historyItemLeft}>
                  {getPayoutMethodIcon(payout.payoutMethod)}
                  <View style={styles.historyItemDetails}>
                    <Text style={styles.historyItemTitle}>
                      {payout.payoutMethod === "instant" ? "Instant Payout" : "Scheduled Payout"}
                    </Text>
                    <Text style={styles.historyItemDate}>{formatDate(payout.createdAt)}</Text>
                  </View>
                </View>
                <View style={styles.historyItemRight}>
                  <Text style={styles.historyItemAmount}>{formatCurrency(payout.netAmount)}</Text>
                  <View style={[styles.historyItemStatus, { backgroundColor: getStatusColor(payout.status) }]}>
                    <Text style={styles.historyItemStatusText}>{payout.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              isExporting && styles.actionButtonDisabled,
            ]}
            onPress={handleExportReport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Download size={20} color="#6B7280" />
            )}
            <Text style={styles.actionButtonText}>
              {isExporting ? "Exporting..." : "Export Analytics Report"}
            </Text>
            <ChevronRight size={16} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/advanced-analytics")}
          >
            <BarChart3 size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Advanced Analytics</Text>
            <ChevronRight size={16} color="#6B7280" />
          </TouchableOpacity>
          
          {user?.role === "owner" && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/shop-owner-dashboard")}
            >
              <Building2 size={20} color="#6B7280" />
              <Text style={styles.actionButtonText}>Shop Owner Dashboard</Text>
              <ChevronRight size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.actionButton}>
            <Eye size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>View Payment Details</Text>
            <ChevronRight size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  settingsButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  viewModeSelector: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    marginBottom: 16,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  viewModeButtonActive: {
    backgroundColor: "#3B82F6",
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  viewModeTextActive: {
    color: "#FFFFFF",
  },
  growthIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  growthText: {
    fontSize: 14,
    fontWeight: "500",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginBottom: 24,
  },
  metricCard: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  metricSubValue: {
    fontSize: 12,
    color: "#6B7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  serviceRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  serviceRankText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  serviceStats: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  serviceGrowth: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  serviceGrowthText: {
    fontSize: 14,
    fontWeight: "500",
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  barWrapper: {
    flex: 1,
    width: 20,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  bar: {
    width: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  dayItem: {
    alignItems: "center",
    flex: 1,
  },
  dayName: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  dayBar: {
    width: 20,
    height: 60,
    backgroundColor: "#374151",
    borderRadius: 10,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  dayBarFill: {
    width: "100%",
    backgroundColor: "#10B981",
    borderRadius: 10,
    minHeight: 4,
  },
  dayCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noAccessText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
  },
  overviewCard: {
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    marginBottom: 24,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  overviewTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  overviewAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overviewStat: {
    flex: 1,
  },
  overviewStatLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 4,
  },
  overviewStatValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: "#3B82F6",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statCard: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  payoutCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  payoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  payoutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  payoutAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
  },
  payoutDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
    marginBottom: 16,
  },
  instantPayoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F59E0B",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  instantPayoutButtonDisabled: {
    opacity: 0.6,
  },
  instantPayoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  historySection: {
    marginBottom: 24,
  },
  historySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyItemDetails: {
    marginLeft: 12,
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  historyItemDate: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  historyItemRight: {
    alignItems: "flex-end",
  },
  historyItemAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  historyItemStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyItemStatusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  actionsSection: {
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 12,
    flex: 1,
  },
});