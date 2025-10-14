import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { router } from "expo-router";
import {
  X,
  Users,
  Plus,
  Search,
  Filter,
  MapPin,
  Star,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Edit3,
  Trash2,
  QrCode,
  UserPlus,
  Settings,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  CreditCard,
} from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useShopManagement } from "@/providers/ShopManagementProvider";
import { useTeam } from "@/providers/TeamProvider";
import QRCodeInviteModal from "@/components/QRCodeInviteModal";
import TeamMemberModal from "@/components/TeamMemberModal";
import PermissionsModal from "@/components/PermissionsModal";
import BoothRentModal from "@/components/BoothRentModal";

export default function MultiShopTeam() {
  const { user } = useAuth();
  const { shops } = useShopManagement();
  const { teamMembers, updateTeamMember, removeTeamMember } = useTeam();
  
  const [selectedShops, setSelectedShops] = useState<string[]>(shops.map(shop => shop.id));
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showQRInvite, setShowQRInvite] = useState<boolean>(false);
  const [showTeamMemberModal, setShowTeamMemberModal] = useState<boolean>(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [showBoothRentModal, setShowBoothRentModal] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showAvailabilityOverview, setShowAvailabilityOverview] = useState<boolean>(false);

  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const shopMatch = selectedShops.includes(member.shopId);
      const roleMatch = selectedRole === "all" || member.role === selectedRole;
      return shopMatch && roleMatch;
    });
  }, [teamMembers, selectedShops, selectedRole]);

  const teamStats = useMemo(() => {
    const total = filteredTeamMembers.length;
    const stylists = filteredTeamMembers.filter(m => m.role === "stylist").length;
    const managers = filteredTeamMembers.filter(m => m.role === "manager").length;
    const receptionists = filteredTeamMembers.filter(m => m.role === "receptionist").length;
    const totalRevenue = filteredTeamMembers.reduce((sum, m) => sum + (m.monthlyRevenue || 0), 0);
    const avgRating = filteredTeamMembers.length > 0 
      ? filteredTeamMembers.reduce((sum, m) => sum + (m.rating || 0), 0) / filteredTeamMembers.length 
      : 0;
    const overdueRents = filteredTeamMembers.filter(m => m.boothRentStatus === "overdue").length;
    const availableNow = filteredTeamMembers.filter(m => m.isAvailable).length;
    const totalAppointmentsToday = filteredTeamMembers.reduce((sum, m) => sum + (m.appointmentsToday || 0), 0);

    return { 
      total, 
      stylists, 
      managers, 
      receptionists, 
      totalRevenue, 
      avgRating, 
      overdueRents, 
      availableNow, 
      totalAppointmentsToday 
    };
  }, [filteredTeamMembers]);

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setShowTeamMemberModal(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    const message = "Are you sure you want to remove this team member?";
    const confirmDelete = () => {
      removeTeamMember(memberId)
        .then(() => {
          const successMessage = "Team member removed successfully";
          if (Platform.OS === 'web') {
            console.log("Success:", successMessage);
          } else {
            Alert.alert("Success", successMessage);
          }
        })
        .catch((error) => {
          const errorMessage = error.message || "Failed to remove team member";
          if (Platform.OS === 'web') {
            console.error("Error:", errorMessage);
          } else {
            Alert.alert("Error", errorMessage);
          }
        });
    };

    if (Platform.OS === 'web') {
      if (confirm(message)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Confirm Removal",
        message,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: confirmDelete },
        ]
      );
    }
  };

  const handleManagePermissions = (member: any) => {
    setSelectedMember(member);
    setShowPermissionsModal(true);
  };

  const handleManageBoothRent = (member: any) => {
    setSelectedMember(member);
    setShowBoothRentModal(true);
  };

  const handleMarkRentPaid = async (memberId: string) => {
    try {
      await updateTeamMember(memberId, {
        boothRentStatus: "paid" as "pending" | "paid" | "overdue",
      });
      const message = "Booth rent marked as paid";
      if (Platform.OS === 'web') {
        console.log("Success:", message);
      } else {
        Alert.alert("Success", message);
      }
    } catch (error) {
      const errorMessage = "Failed to update rent status";
      if (Platform.OS === 'web') {
        console.error("Error:", errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const toggleShopFilter = (shopId: string) => {
    setSelectedShops(prev => 
      prev.includes(shopId) 
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId]
    );
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "stylist": return "#3B82F6";
      case "manager": return "#10B981";
      case "receptionist": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  const getBoothRentStatusColor = (status?: string) => {
    switch (status) {
      case "paid": return "#10B981";
      case "pending": return "#F59E0B";
      case "overdue": return "#EF4444";
      default: return "#6B7280";
    }
  };

  if (user?.role !== "owner") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Team Management</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.noAccessText}>Team management is only available for shop owners.</Text>
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
        <Text style={styles.headerTitle}>Team Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowAvailabilityOverview(!showAvailabilityOverview)}
          >
            <Clock size={20} color={showAvailabilityOverview ? "#3B82F6" : "#FFFFFF"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          >
            {viewMode === "list" ? <Users size={20} color="#FFFFFF" /> : <Filter size={20} color="#FFFFFF" />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowQRInvite(true)}
          >
            <QrCode size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              setSelectedMember(null);
              setShowTeamMemberModal(true);
            }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Team Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Users size={20} color="#3B82F6" />
          <Text style={styles.statValue}>{teamStats.total}</Text>
          <Text style={styles.statLabel}>Total Team</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.statValue}>{teamStats.availableNow}</Text>
          <Text style={styles.statLabel}>Available Now</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={20} color="#F59E0B" />
          <Text style={styles.statValue}>{teamStats.totalAppointmentsToday}</Text>
          <Text style={styles.statLabel}>Today's Appts</Text>
        </View>
        <View style={styles.statCard}>
          <DollarSign size={20} color="#10B981" />
          <Text style={styles.statValue}>{formatCurrency(teamStats.totalRevenue)}</Text>
          <Text style={styles.statLabel}>Monthly Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Star size={20} color="#F59E0B" />
          <Text style={styles.statValue}>{teamStats.avgRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
        {teamStats.overdueRents > 0 && (
          <View style={[styles.statCard, styles.alertStatCard]}>
            <AlertCircle size={20} color="#EF4444" />
            <Text style={styles.statValue}>{teamStats.overdueRents}</Text>
            <Text style={styles.statLabel}>Overdue Rents</Text>
          </View>
        )}
      </ScrollView>

      {/* Real-time Availability Overview */}
      {showAvailabilityOverview && (
        <View style={styles.availabilityOverview}>
          <Text style={styles.availabilityTitle}>Real-time Team Availability</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredTeamMembers.map((member) => {
              const shop = shops.find(s => s.id === member.shopId);
              return (
                <View key={member.id} style={styles.availabilityCard}>
                  {member.image && (
                    <Image source={{ uri: member.image }} style={styles.availabilityAvatar} />
                  )}
                  <Text style={styles.availabilityName}>{member.name.split(' ')[0]}</Text>
                  <Text style={styles.availabilityShop}>{shop?.name}</Text>
                  <View style={[
                    styles.availabilityStatus,
                    { backgroundColor: member.isAvailable ? "#10B981" : "#EF4444" }
                  ]}>
                    <Text style={styles.availabilityStatusText}>
                      {member.isAvailable ? "Available" : "Busy"}
                    </Text>
                  </View>
                  <Text style={styles.availabilityAppts}>
                    {member.appointmentsToday || 0} appts today
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Shop Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopFilters}>
          {shops.map((shop) => (
            <TouchableOpacity
              key={shop.id}
              style={[
                styles.shopFilter,
                selectedShops.includes(shop.id) && styles.shopFilterActive,
              ]}
              onPress={() => toggleShopFilter(shop.id)}
            >
              <MapPin size={14} color={selectedShops.includes(shop.id) ? "#FFFFFF" : "#9CA3AF"} />
              <Text style={[
                styles.shopFilterText,
                selectedShops.includes(shop.id) && styles.shopFilterTextActive,
              ]}>
                {shop.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Role Filters */}
        <View style={styles.roleFilters}>
          {["all", "stylist", "manager", "receptionist"].map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleFilter,
                selectedRole === role && styles.roleFilterActive,
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text style={[
                styles.roleFilterText,
                selectedRole === role && styles.roleFilterTextActive,
              ]}>
                {role === "all" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Team Members List */}
      <ScrollView style={styles.teamList} showsVerticalScrollIndicator={false}>
        {filteredTeamMembers.map((member) => {
          const shop = shops.find(s => s.id === member.shopId);
          
          return (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.memberInfo}>
                  {member.image && (
                    <Image source={{ uri: member.image }} style={styles.memberAvatar} />
                  )}
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <View style={styles.memberMeta}>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) }]}>
                        <Text style={styles.roleText}>{member.role}</Text>
                      </View>
                      <View style={styles.shopInfo}>
                        <MapPin size={12} color="#9CA3AF" />
                        <Text style={styles.shopText}>{shop?.name}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={styles.memberActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleManagePermissions(member)}
                  >
                    <Shield size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditMember(member)}
                  >
                    <Edit3 size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteMember(member.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.memberStats}>
                <View style={styles.memberStat}>
                  <Star size={14} color="#F59E0B" />
                  <Text style={styles.memberStatText}>
                    {member.rating?.toFixed(1) || "0.0"}
                  </Text>
                </View>
                
                <View style={styles.memberStat}>
                  <Calendar size={14} color="#3B82F6" />
                  <Text style={styles.memberStatText}>
                    {member.appointmentsToday || 0} today
                  </Text>
                </View>
                
                <View style={styles.memberStat}>
                  <DollarSign size={14} color="#10B981" />
                  <Text style={styles.memberStatText}>
                    {formatCurrency(member.monthlyRevenue || 0)}/mo
                  </Text>
                </View>
              </View>

              {member.role === "stylist" && member.boothRentStatus && (
                <View style={styles.boothRentInfo}>
                  <View style={styles.boothRentLeft}>
                    <Text style={styles.boothRentLabel}>Booth Rent:</Text>
                    <Text style={styles.boothRentAmount}>
                      {formatCurrency(member.boothRentAmount || 0)}
                    </Text>
                    {member.boothRentDueDate && (
                      <Text style={styles.boothRentDue}>
                        Due: {new Date(member.boothRentDueDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.boothRentRight}>
                    <View style={[
                      styles.boothRentStatus,
                      { backgroundColor: getBoothRentStatusColor(member.boothRentStatus) }
                    ]}>
                      <Text style={styles.boothRentStatusText}>
                        {member.boothRentStatus}
                      </Text>
                    </View>
                    <View style={styles.boothRentActions}>
                      <TouchableOpacity 
                        style={styles.boothRentActionButton}
                        onPress={() => handleManageBoothRent(member)}
                      >
                        <Settings size={14} color="#6B7280" />
                      </TouchableOpacity>
                      {member.boothRentStatus === "pending" && (
                        <TouchableOpacity 
                          style={styles.boothRentActionButton}
                          onPress={() => handleMarkRentPaid(member.id)}
                        >
                          <CheckCircle size={14} color="#10B981" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Performance Metrics */}
              <View style={styles.performanceMetrics}>
                <View style={styles.performanceMetric}>
                  <TrendingUp size={14} color="#10B981" />
                  <Text style={styles.performanceText}>Performance: 85%</Text>
                </View>
                <View style={styles.performanceMetric}>
                  <Clock size={14} color="#3B82F6" />
                  <Text style={styles.performanceText}>On-time: 92%</Text>
                </View>
                <View style={styles.performanceMetric}>
                  <Users size={14} color="#F59E0B" />
                  <Text style={styles.performanceText}>Client retention: 78%</Text>
                </View>
              </View>

              <View style={styles.memberContact}>
                <TouchableOpacity style={styles.contactButton}>
                  <Phone size={16} color="#6B7280" />
                  <Text style={styles.contactText}>{member.phone || "No phone"}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.contactButton}>
                  <Mail size={16} color="#6B7280" />
                  <Text style={styles.contactText}>{member.email}</Text>
                </TouchableOpacity>
              </View>

              {member.specialties && member.specialties.length > 0 && (
                <View style={styles.specialties}>
                  <Text style={styles.specialtiesLabel}>Specialties:</Text>
                  <View style={styles.specialtyTags}>
                    {member.specialties.map((specialty, index) => (
                      <View key={index} style={styles.specialtyTag}>
                        <Text style={styles.specialtyText}>{specialty}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modals */}
      <QRCodeInviteModal 
        visible={showQRInvite}
        onClose={() => setShowQRInvite(false)}
        shops={shops}
      />
      
      <TeamMemberModal 
        visible={showTeamMemberModal}
        onClose={() => {
          setShowTeamMemberModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        shops={shops}
      />
      
      <PermissionsModal 
        visible={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        shops={shops}
      />
      
      <BoothRentModal 
        visible={showBoothRentModal}
        onClose={() => {
          setShowBoothRentModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
      />
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
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginRight: 12,
    minWidth: 100,
  },
  alertStatCard: {
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  shopFilters: {
    marginBottom: 12,
  },
  shopFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  shopFilterActive: {
    backgroundColor: "#3B82F6",
  },
  shopFilterText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  shopFilterTextActive: {
    color: "#FFFFFF",
  },
  roleFilters: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
  },
  roleFilter: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  roleFilterActive: {
    backgroundColor: "#374151",
  },
  roleFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  roleFilterTextActive: {
    color: "#FFFFFF",
  },
  teamList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  memberCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: "row",
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  memberMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shopText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  memberActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#374151",
  },
  memberStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  memberStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  memberStatText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  boothRentInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  boothRentLabel: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  boothRentDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  boothRentAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  boothRentStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  boothRentStatusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  memberContact: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  contactText: {
    fontSize: 14,
    color: "#9CA3AF",
    flex: 1,
  },
  specialties: {
    marginTop: 8,
  },
  specialtiesLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  specialtyTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  specialtyTag: {
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  bottomPadding: {
    height: 40,
  },
  availabilityOverview: {
    backgroundColor: "#1F2937",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  availabilityCard: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    minWidth: 100,
  },
  availabilityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 6,
  },
  availabilityName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  availabilityShop: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 6,
  },
  availabilityStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  availabilityStatusText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  availabilityAppts: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  boothRentLeft: {
    flex: 1,
  },
  boothRentRight: {
    alignItems: "flex-end",
  },
  boothRentDue: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  boothRentActions: {
    flexDirection: "row",
    marginTop: 6,
    gap: 6,
  },
  boothRentActionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#374151",
  },
  performanceMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  performanceMetric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  performanceText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});