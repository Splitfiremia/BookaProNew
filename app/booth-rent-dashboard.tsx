import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import {
  X,
  Search,
  Filter,
  DollarSign,
  Clock,
  AlertCircle,
  UserCheck,
  TrendingUp,
  Calendar,
  Settings,
  Bell,
  Download,
  Plus,
  CreditCard,
  Target,
  CheckCircle,
  XCircle,
} from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalytics } from "@/providers/AnalyticsProvider";
import AnalyticsChart from "@/components/AnalyticsChart";

export default function BoothRentDashboard() {
  const { user } = useAuth();
  const {
    boothRentStatus,
    updateBoothRentStatus,
    sendPaymentReminder,
    isLoading,
  } = useAnalytics();
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const [selectedPeriod, setSelectedPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  
  // Filter and search rent data
  const filteredRents = useMemo(() => {
    let filtered = boothRentStatus;
    
    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(rent => rent.status === filterStatus);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(rent => 
        rent.stylistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rent.shopName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [boothRentStatus, filterStatus, searchQuery]);
  
  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRent = boothRentStatus.reduce((sum, rent) => sum + rent.amount, 0);
    const pendingRent = boothRentStatus.filter(rent => rent.status === "pending").reduce((sum, rent) => sum + rent.amount, 0);
    const overdueRent = boothRentStatus.filter(rent => rent.status === "overdue").reduce((sum, rent) => sum + rent.amount, 0);
    const paidRent = boothRentStatus.filter(rent => rent.status === "paid").reduce((sum, rent) => sum + rent.amount, 0);
    const collectionRate = boothRentStatus.length > 0 ? (boothRentStatus.filter(rent => rent.status === "paid").length / boothRentStatus.length) * 100 : 0;
    
    return {
      totalRent,
      pendingRent,
      overdueRent,
      paidRent,
      collectionRate,
      totalStylists: boothRentStatus.length,
      overdueCount: boothRentStatus.filter(rent => rent.status === "overdue").length,
    };
  }, [boothRentStatus]);
  
  // Generate chart data for rent collection trends
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      label: month,
      value: Math.floor(Math.random() * 5000) + 8000, // Mock data
    }));
  }, []);
  
  const handleMarkRentPaid = async (rentId: string) => {
    try {
      await updateBoothRentStatus(rentId, "paid", new Date().toISOString());
      const message = "Booth rent marked as paid successfully!";
      if (Platform.OS === 'web') {
        console.log("Success:", message);
      } else {
        Alert.alert("Success", message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update rent status";
      if (Platform.OS === 'web') {
        console.error("Error:", errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };
  
  const handleSendReminder = async (rentId: string) => {
    try {
      const rent = boothRentStatus.find(r => r.id === rentId);
      if (!rent) return;
      
      const daysUntilDue = getDaysUntilDue(rent.dueDate);
      const reminderType = daysUntilDue < 0 ? "overdue" : daysUntilDue === 0 ? "due" : "upcoming";
      
      await sendPaymentReminder(rentId, reminderType);
      
      const message = "Payment reminder sent successfully!";
      if (Platform.OS === 'web') {
        console.log("Success:", message);
      } else {
        Alert.alert("Success", message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send reminder";
      if (Platform.OS === 'web') {
        console.error("Error:", errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };
  
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "#10B981";
      case "pending": return "#F59E0B";
      case "overdue": return "#EF4444";
      default: return "#6B7280";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return CheckCircle;
      case "pending": return Clock;
      case "overdue": return XCircle;
      default: return AlertCircle;
    }
  };
  
  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };
  
  if (user?.role !== "owner") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booth Rent Dashboard</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.noAccessText}>Booth rent dashboard is only available for shop owners.</Text>
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
        <Text style={styles.headerTitle}>Booth Rent Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Download size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Settings size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <DollarSign size={20} color="#10B981" />
              <Text style={styles.metricValue}>{formatCurrency(metrics.totalRent)}</Text>
            </View>
            <Text style={styles.metricLabel}>Total Monthly Rent</Text>
            <View style={styles.metricTrend}>
              <TrendingUp size={12} color="#10B981" />
              <Text style={styles.metricTrendText}>+8% from last month</Text>
            </View>
          </View>
          
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Clock size={20} color="#F59E0B" />
              <Text style={styles.metricValue}>{formatCurrency(metrics.pendingRent)}</Text>
            </View>
            <Text style={styles.metricLabel}>Pending Payments</Text>
            <Text style={styles.metricSubtext}>
              {boothRentStatus.filter(rent => rent.status === "pending").length} stylists
            </Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <AlertCircle size={20} color="#EF4444" />
              <Text style={styles.metricValue}>{formatCurrency(metrics.overdueRent)}</Text>
            </View>
            <Text style={styles.metricLabel}>Overdue Amounts</Text>
            <Text style={styles.metricSubtext}>
              {metrics.overdueCount} overdue payments
            </Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Target size={20} color="#3B82F6" />
              <Text style={styles.metricValue}>{Math.round(metrics.collectionRate)}%</Text>
            </View>
            <Text style={styles.metricLabel}>Collection Rate</Text>
            <Text style={styles.metricSubtext}>This month</Text>
          </View>
        </View>
        
        {/* Automated System Status */}
        <View style={styles.automationSection}>
          <View style={styles.automationHeader}>
            <View style={styles.automationIcon}>
              <Settings size={16} color="#3B82F6" />
            </View>
            <View style={styles.automationContent}>
              <Text style={styles.automationTitle}>Automated Rent System</Text>
              <Text style={styles.automationDescription}>
                Automatic calculation, reminders, and collection tracking
              </Text>
            </View>
            <View style={styles.automationStatus}>
              <View style={[styles.statusDot, { backgroundColor: "#10B981" }]} />
              <Text style={styles.automationStatusText}>Active</Text>
            </View>
          </View>
          
          <View style={styles.automationStats}>
            <View style={styles.automationStat}>
              <Bell size={14} color="#F59E0B" />
              <Text style={styles.automationStatText}>12 reminders sent today</Text>
            </View>
            <View style={styles.automationStat}>
              <CreditCard size={14} color="#10B981" />
              <Text style={styles.automationStatText}>3 auto-deductions processed</Text>
            </View>
          </View>
        </View>
        
        {/* Revenue Chart */}
        <AnalyticsChart
          data={chartData}
          type="line"
          title="Rent Collection Trends"
          subtitle={`${selectedPeriod} collection performance`}
          currency
          height={200}
        />
        
        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stylists or shops..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Status Filter Tabs */}
        <View style={styles.statusTabs}>
          {["all", "pending", "overdue", "paid"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusTab,
                filterStatus === status && styles.statusTabActive,
              ]}
              onPress={() => setFilterStatus(status as any)}
            >
              <Text style={[
                styles.statusTabText,
                filterStatus === status && styles.statusTabTextActive,
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== "all" && (
                  <Text style={styles.statusTabCount}>
                    {" "}({status === "pending" ? boothRentStatus.filter(r => r.status === "pending").length :
                      status === "overdue" ? boothRentStatus.filter(r => r.status === "overdue").length :
                      boothRentStatus.filter(r => r.status === "paid").length})
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Rent List */}
        <View style={styles.rentSection}>
          <View style={styles.rentHeader}>
            <Text style={styles.rentTitle}>
              {filterStatus === "all" ? "All Rent Payments" : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Payments`}
            </Text>
            <Text style={styles.rentCount}>
              {filteredRents.length} {filteredRents.length === 1 ? "payment" : "payments"}
            </Text>
          </View>
          
          <View style={styles.rentList}>
            {filteredRents.map((rent) => {
              const StatusIcon = getStatusIcon(rent.status);
              const daysUntilDue = getDaysUntilDue(rent.dueDate);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;
              
              return (
                <View key={rent.id} style={styles.rentItem}>
                  <View style={styles.rentItemLeft}>
                    <View style={[
                      styles.rentItemIcon,
                      { backgroundColor: getStatusColor(rent.status) }
                    ]}>
                      <StatusIcon size={16} color="#FFFFFF" />
                    </View>
                    
                    <View style={styles.rentItemDetails}>
                      <Text style={styles.rentItemName}>{rent.stylistName}</Text>
                      <Text style={styles.rentItemShop}>{rent.shopName}</Text>
                      <View style={styles.rentItemMeta}>
                        <Text style={[
                          styles.rentItemDate,
                          { color: isOverdue ? "#EF4444" : isDueSoon ? "#F59E0B" : "#9CA3AF" }
                        ]}>
                          {isOverdue 
                            ? `Overdue by ${Math.abs(daysUntilDue)} days`
                            : isDueSoon 
                              ? `Due in ${daysUntilDue} days`
                              : `Due ${formatDate(rent.dueDate)}`
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.rentItemRight}>
                    <Text style={styles.rentItemAmount}>{formatCurrency(rent.amount)}</Text>
                    <View style={[styles.rentItemStatus, { backgroundColor: getStatusColor(rent.status) }]}>
                      <Text style={styles.rentItemStatusText}>{rent.status}</Text>
                    </View>
                    
                    <View style={styles.rentItemActions}>
                      {rent.status === "pending" && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleMarkRentPaid(rent.id)}
                        >
                          <UserCheck size={14} color="#10B981" />
                        </TouchableOpacity>
                      )}
                      
                      {(rent.status === "pending" || rent.status === "overdue") && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleSendReminder(rent.id)}
                        >
                          <Bell size={14} color="#F59E0B" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
          
          {filteredRents.length === 0 && (
            <View style={styles.emptyState}>
              <AlertCircle size={48} color="#6B7280" />
              <Text style={styles.emptyStateTitle}>No payments found</Text>
              <Text style={styles.emptyStateDescription}>
                {searchQuery ? "Try adjusting your search terms" : "No rent payments match the selected filter"}
              </Text>
            </View>
          )}
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Add New Stylist</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Settings size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Rent Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Download size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Export Report</Text>
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
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginTop: 20,
    marginBottom: 24,
  },
  metricCard: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  metricLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  metricTrend: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 4,
  },
  metricTrendText: {
    fontSize: 11,
    color: "#10B981",
  },
  metricSubtext: {
    fontSize: 11,
    color: "#6B7280",
    paddingHorizontal: 16,
  },
  automationSection: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  automationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  automationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  automationContent: {
    flex: 1,
  },
  automationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  automationDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 16,
  },
  automationStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  automationStatusText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  automationStats: {
    gap: 8,
  },
  automationStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  automationStatText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  filterContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
  },
  filterButton: {
    padding: 4,
  },
  statusTabs: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  statusTabActive: {
    backgroundColor: "#374151",
  },
  statusTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  statusTabTextActive: {
    color: "#FFFFFF",
  },
  statusTabCount: {
    fontSize: 12,
    color: "inherit",
  },
  rentSection: {
    marginBottom: 24,
  },
  rentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  rentCount: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  rentList: {
    gap: 12,
  },
  rentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  rentItemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  rentItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rentItemDetails: {
    flex: 1,
  },
  rentItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  rentItemShop: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  rentItemMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  rentItemDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  rentItemRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  rentItemAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  rentItemStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rentItemStatusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  rentItemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#374151",
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
  quickActions: {
    marginBottom: 40,
    gap: 12,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    flex: 1,
  },
});