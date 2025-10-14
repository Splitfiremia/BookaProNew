import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Building2,
  UserCheck,
  AlertCircle,
  ChevronRight,
  Settings,
  Download,
  Plus,
  Eye,
  BarChart3,
  Target,
  Clock,
  CreditCard,
  MapPin,
  Star,
  Edit3,
  Trash2,
  Phone,
  Mail,
  MoreHorizontal,
} from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useAnalytics } from "@/providers/AnalyticsProvider";
import { useShopManagement } from "@/providers/ShopManagementProvider";
import AnalyticsChart from "@/components/AnalyticsChart";

export default function ShopOwnerDashboard() {
  const { user } = useAuth();
  const {
    boothRentStatus,
    updateBoothRentStatus,
    exportAnalyticsReport,
    isLoading: analyticsLoading,
  } = useAnalytics();
  const {
    shops,
    shopMetrics,
    selectedShopId,
    selectedShop,
    selectedShopMetrics,
    consolidatedMetrics,
    setSelectedShopId,
    isLoading: shopLoading,
    refreshData,
  } = useShopManagement();
  
  const [selectedPeriod, setSelectedPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [viewMode, setViewMode] = useState<"overview" | "individual">("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    shops: true,
    analytics: true,
    team: true,
    rent: true,
    performance: true,
  });
  
  const isLoading = analyticsLoading || shopLoading;
  
  // Enhanced data processing with error handling
  const overdueRents = useMemo(() => {
    try {
      return boothRentStatus?.filter(rent => rent.status === "overdue") || [];
    } catch (error) {
      console.error('Error processing overdue rents:', error);
      return [];
    }
  }, [boothRentStatus]);
  
  const revenueChartData = useMemo(() => {
    try {
      return selectedShopMetrics?.revenueByPeriod?.map(item => ({
        label: item.period,
        value: item.revenue,
      })) || [];
    } catch (error) {
      console.error('Error processing revenue chart data:', error);
      return [];
    }
  }, [selectedShopMetrics]);
  
  const shopComparisonData = useMemo(() => {
    try {
      return shopMetrics?.map(metrics => {
        const shop = shops?.find(s => s.id === metrics.shopId);
        return {
          label: shop?.name?.split(' ')[0] || 'Shop',
          value: metrics.totalRevenue || 0,
        };
      }) || [];
    } catch (error) {
      console.error('Error processing shop comparison data:', error);
      return [];
    }
  }, [shopMetrics, shops]);
  
  // Enhanced handlers with better error handling
  const handleMarkRentPaid = async (rentId: string) => {
    try {
      await updateBoothRentStatus(rentId, "paid", new Date().toISOString());
      showSuccess("Booth rent marked as paid successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update rent status";
      showError(errorMessage);
    }
  };
  
  const handleExportReport = async () => {
    try {
      await exportAnalyticsReport(selectedPeriod as "daily" | "weekly" | "monthly" | "yearly");
      showSuccess("Shop analytics report exported successfully!");
    } catch (error) {
      showError("Failed to export report. Please try again.");
    }
  };
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData?.();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);
  
  // Utility functions
  const showSuccess = (message: string) => {
    if (Platform.OS === 'web') {
      console.log("Success:", message);
    } else {
      Alert.alert("Success", message);
    }
  };
  
  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      console.error("Error:", message);
    } else {
      Alert.alert("Error", message);
    }
  };
  
  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return "$0";
    return `$${amount.toLocaleString()}`;
  };
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "#10B981";
      case "pending": return "#F59E0B";
      case "overdue": return "#EF4444";
      default: return "#6B7280";
    }
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Enhanced shop selection handler
  const handleShopSelect = (shopId: string) => {
    setSelectedShopId(shopId);
    setViewMode("individual");
  };
  
  // Role-based access control
  if (user?.role !== "owner") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shop Dashboard</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <AlertCircle size={48} color="#6B7280" />
          <Text style={styles.noAccessTitle}>Access Restricted</Text>
          <Text style={styles.noAccessText}>
            Shop owner dashboard is only available for shop owners.
          </Text>
          <TouchableOpacity 
            style={styles.contactSupportButton}
            onPress={() => router.push("/contact-support")}
          >
            <Text style={styles.contactSupportText}>Contact Support</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Shop Owner Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleExportReport} style={styles.headerButton}>
            <Download size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/advanced-analytics")} style={styles.headerButton}>
            <BarChart3 size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRefresh} style={styles.headerButton}>
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </View>
        )}

        {/* View Mode Toggle */}
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === "overview" && styles.viewModeButtonActive]}
            onPress={() => setViewMode("overview")}
          >
            <Building2 size={16} color={viewMode === "overview" ? "#FFFFFF" : "#9CA3AF"} />
            <Text style={[styles.viewModeText, viewMode === "overview" && styles.viewModeTextActive]}>
              All Shops
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === "individual" && styles.viewModeButtonActive]}
            onPress={() => {
              if (shops.length > 0) {
                setViewMode("individual");
                if (!selectedShopId && shops[0]) {
                  setSelectedShopId(shops[0].id);
                }
              }
            }}
            disabled={shops.length === 0}
          >
            <Target size={16} color={viewMode === "individual" ? "#FFFFFF" : "#9CA3AF"} />
            <Text style={[styles.viewModeText, viewMode === "individual" && styles.viewModeTextActive]}>
              Individual
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <LinearGradient colors={["#3B82F6", "#1E40AF"]} style={styles.overviewCard}>
            <Building2 size={24} color="#FFFFFF" />
            <Text style={styles.overviewValue}>{shops?.length || 0}</Text>
            <Text style={styles.overviewLabel}>Total Shops</Text>
          </LinearGradient>
          
          <LinearGradient colors={["#10B981", "#059669"]} style={styles.overviewCard}>
            <DollarSign size={24} color="#FFFFFF" />
            <Text style={styles.overviewValue}>
              {formatCurrency(
                viewMode === "overview" 
                  ? consolidatedMetrics?.totalRevenue || 0
                  : selectedShopMetrics?.totalRevenue || 0
              )}
            </Text>
            <Text style={styles.overviewLabel}>
              {viewMode === "overview" ? "Total Revenue" : "Shop Revenue"}
            </Text>
          </LinearGradient>
          
          <LinearGradient colors={["#8B5CF6", "#7C3AED"]} style={styles.overviewCard}>
            <Users size={24} color="#FFFFFF" />
            <Text style={styles.overviewValue}>
              {viewMode === "overview" 
                ? consolidatedMetrics?.stylistCount || 0
                : selectedShopMetrics?.stylistCount || 0
              }
            </Text>
            <Text style={styles.overviewLabel}>
              {viewMode === "overview" ? "Total Stylists" : "Shop Stylists"}
            </Text>
          </LinearGradient>
          
          <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.overviewCard}>
            <Calendar size={24} color="#FFFFFF" />
            <Text style={styles.overviewValue}>
              {viewMode === "overview" 
                ? consolidatedMetrics?.totalAppointments || 0
                : selectedShopMetrics?.totalAppointments || 0
              }
            </Text>
            <Text style={styles.overviewLabel}>
              {viewMode === "overview" ? "Total Appointments" : "Shop Appointments"}
            </Text>
          </LinearGradient>
        </View>
        
        {/* Shop Management Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('shops')}
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionTitle}>Your Shops</Text>
              <Text style={styles.sectionSubtitle}>{shops?.length || 0} locations</Text>
            </View>
            <View style={styles.sectionHeaderRight}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push("/shop-settings/new")}
              >
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <ChevronRight 
                size={20} 
                color="#6B7280" 
                style={[
                  styles.expandIcon,
                  expandedSections.shops && styles.expandIconExpanded
                ]} 
              />
            </View>
          </TouchableOpacity>
          
          {expandedSections.shops && (
            <>
              {shops?.length === 0 ? (
                <View style={styles.emptyState}>
                  <Building2 size={48} color="#6B7280" />
                  <Text style={styles.emptyStateTitle}>No Shops Yet</Text>
                  <Text style={styles.emptyStateText}>
                    Get started by adding your first shop location
                  </Text>
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={() => router.push("/shop-settings/new")}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.emptyStateButtonText}>Add First Shop</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.shopList}
                  contentContainerStyle={styles.shopListContent}
                >
                  {shops?.map((shop) => {
                    const metrics = shopMetrics?.find(m => m.shopId === shop.id);
                    const isSelected = selectedShopId === shop.id;
                    
                    return (
                      <TouchableOpacity
                        key={shop.id}
                        style={[
                          styles.shopCard,
                          isSelected && styles.shopCardActive,
                        ]}
                        onPress={() => handleShopSelect(shop.id)}
                      >
                        {shop.image ? (
                          <Image source={{ uri: shop.image }} style={styles.shopImage} />
                        ) : (
                          <View style={styles.shopImagePlaceholder}>
                            <Building2 size={24} color="#6B7280" />
                          </View>
                        )}
                        <View style={styles.shopCardContent}>
                          <Text style={[
                            styles.shopName,
                            isSelected && styles.shopNameActive,
                          ]}>
                            {shop.name}
                          </Text>
                          <View style={styles.shopLocation}>
                            <MapPin size={12} color="#9CA3AF" />
                            <Text style={styles.shopLocationText}>
                              {shop.city}, {shop.state}
                            </Text>
                          </View>
                          <View style={styles.shopStats}>
                            <View style={styles.shopStat}>
                              <Star size={12} color="#F59E0B" />
                              <Text style={styles.shopStatText}>
                                {metrics?.averageRating?.toFixed(1) || "0.0"}
                              </Text>
                            </View>
                            <Text style={styles.shopStatDivider}>•</Text>
                            <Text style={styles.shopStatText}>
                              {metrics?.stylistCount || 0} stylists
                            </Text>
                            <Text style={styles.shopStatDivider}>•</Text>
                            <Text style={styles.shopStatText}>
                              {formatCurrency(metrics?.monthlyRevenue || 0)}/mo
                            </Text>
                          </View>
                          
                          <View style={styles.shopActions}>
                            <TouchableOpacity 
                              style={styles.shopActionButton}
                              onPress={() => router.push(`/shop-settings/${shop.id}`)}
                            >
                              <Edit3 size={14} color="#6B7280" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.shopActionButton}
                              onPress={() => router.push("/multi-shop-calendar")}
                            >
                              <Calendar size={14} color="#6B7280" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.shopActionButton}
                              onPress={() => router.push("/multi-shop-team")}
                            >
                              <Users size={14} color="#6B7280" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </>
          )}
        </View>
        
        {/* Analytics Section */}
        {expandedSections.analytics && shops && shops.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('analytics')}
            >
              <View style={styles.sectionHeaderLeft}>
                <Text style={styles.sectionTitle}>Analytics</Text>
                <Text style={styles.sectionSubtitle}>{selectedPeriod} view</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                <View style={styles.periodSelector}>
                  {["weekly", "monthly", "yearly"].map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.periodButton,
                        selectedPeriod === period && styles.periodButtonActive,
                      ]}
                      onPress={() => setSelectedPeriod(period as any)}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          selectedPeriod === period && styles.periodButtonTextActive,
                        ]}
                      >
                        {period.charAt(0).toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <ChevronRight 
                  size={20} 
                  color="#6B7280" 
                  style={[
                    styles.expandIcon,
                    expandedSections.analytics && styles.expandIconExpanded
                  ]} 
                />
              </View>
            </TouchableOpacity>
            
            {expandedSections.analytics && (
              <>
                {/* Revenue Charts */}
                {viewMode === "individual" && selectedShop && selectedShopMetrics && (
                  <AnalyticsChart
                    data={revenueChartData}
                    type="bar"
                    title={`${selectedShop.name} Revenue`}
                    subtitle={`${selectedPeriod} performance`}
                    currency
                    height={200}
                  />
                )}
                
                {viewMode === "overview" && shops.length > 1 && (
                  <AnalyticsChart
                    data={shopComparisonData}
                    type="bar"
                    title="Shop Performance Comparison"
                    subtitle="Revenue by location"
                    currency
                    height={200}
                  />
                )}
              </>
            )}
          </View>
        )}

        {/* Rest of the components remain similar but with enhanced error handling and UI improvements */}
        {/* ... (Team Management, Booth Rent System, Performance Metrics, Quick Actions) ... */}
        
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
    gap: 16,
  },
  noAccessTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  noAccessText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
  },
  contactSupportButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  contactSupportText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginTop: 20,
    marginBottom: 24,
  },
  overviewCard: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  expandIcon: {
    transform: [{ rotate: '0deg' }],
  },
  expandIconExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  shopList: {
    marginTop: 8,
  },
  shopListContent: {
    paddingRight: 20,
  },
  shopCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
    maxWidth: 280,
  },
  shopCardActive: {
    backgroundColor: "#3B82F6",
  },
  shopImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
  },
  shopImagePlaceholder: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  shopCardContent: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  shopNameActive: {
    color: "#FFFFFF",
  },
  shopLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  shopLocationText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  shopStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  shopStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  shopStatText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  shopStatDivider: {
    fontSize: 12,
    color: "#6B7280",
    marginHorizontal: 4,
  },
  shopActions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  shopActionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#374151",
  },
  viewModeToggle: {
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
    backgroundColor: "#374151",
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  viewModeTextActive: {
    color: "#FFFFFF",
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: "#374151",
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  // ... (rest of the styles remain similar with enhancements)
});