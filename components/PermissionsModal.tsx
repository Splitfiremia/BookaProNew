import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from "react-native";
import {
  X,
  Shield,
  Eye,
  EyeOff,
  Calendar,
  Users,
  DollarSign,
  Settings,
  BarChart3,
  CreditCard,
  Clock,
  MapPin,
  Save,
  AlertTriangle,
} from "lucide-react-native";
import { useTeam } from "@/providers/TeamProvider";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  level: "basic" | "advanced" | "admin";
}

interface PermissionsModalProps {
  visible: boolean;
  onClose: () => void;
  member?: any;
  shops: any[];
}

const PERMISSIONS: Permission[] = [
  // Calendar & Scheduling
  {
    id: "view_calendar",
    name: "View Calendar",
    description: "Can view shop calendar and appointments",
    icon: Calendar,
    category: "Calendar & Scheduling",
    level: "basic",
  },
  {
    id: "manage_appointments",
    name: "Manage Appointments",
    description: "Can create, edit, and cancel appointments",
    icon: Calendar,
    category: "Calendar & Scheduling",
    level: "advanced",
  },
  {
    id: "manage_availability",
    name: "Manage Availability",
    description: "Can set their own availability and time off",
    icon: Clock,
    category: "Calendar & Scheduling",
    level: "basic",
  },
  
  // Client Management
  {
    id: "view_clients",
    name: "View Clients",
    description: "Can view client information and history",
    icon: Users,
    category: "Client Management",
    level: "basic",
  },
  {
    id: "manage_clients",
    name: "Manage Clients",
    description: "Can add, edit, and manage client profiles",
    icon: Users,
    category: "Client Management",
    level: "advanced",
  },
  
  // Financial
  {
    id: "view_earnings",
    name: "View Own Earnings",
    description: "Can view their own earnings and commission",
    icon: DollarSign,
    category: "Financial",
    level: "basic",
  },
  {
    id: "view_shop_revenue",
    name: "View Shop Revenue",
    description: "Can view shop revenue and financial reports",
    icon: BarChart3,
    category: "Financial",
    level: "admin",
  },
  {
    id: "process_payments",
    name: "Process Payments",
    description: "Can process client payments and tips",
    icon: CreditCard,
    category: "Financial",
    level: "advanced",
  },
  
  // Team Management
  {
    id: "view_team",
    name: "View Team",
    description: "Can view team member information",
    icon: Users,
    category: "Team Management",
    level: "basic",
  },
  {
    id: "manage_team",
    name: "Manage Team",
    description: "Can add, edit, and remove team members",
    icon: Users,
    category: "Team Management",
    level: "admin",
  },
  
  // Shop Settings
  {
    id: "view_shop_settings",
    name: "View Shop Settings",
    description: "Can view shop configuration and settings",
    icon: Settings,
    category: "Shop Settings",
    level: "advanced",
  },
  {
    id: "manage_shop_settings",
    name: "Manage Shop Settings",
    description: "Can modify shop settings and configuration",
    icon: Settings,
    category: "Shop Settings",
    level: "admin",
  },
  
  // Analytics
  {
    id: "view_analytics",
    name: "View Analytics",
    description: "Can view performance analytics and reports",
    icon: BarChart3,
    category: "Analytics",
    level: "advanced",
  },
  {
    id: "export_reports",
    name: "Export Reports",
    description: "Can export and download reports",
    icon: BarChart3,
    category: "Analytics",
    level: "admin",
  },
];

const ROLE_PRESETS = {
  stylist: [
    "view_calendar",
    "manage_availability",
    "view_clients",
    "view_earnings",
    "view_team",
  ],
  manager: [
    "view_calendar",
    "manage_appointments",
    "manage_availability",
    "view_clients",
    "manage_clients",
    "view_earnings",
    "process_payments",
    "view_team",
    "view_shop_settings",
    "view_analytics",
  ],
  receptionist: [
    "view_calendar",
    "manage_appointments",
    "view_clients",
    "manage_clients",
    "process_payments",
    "view_team",
  ],
};

export default function PermissionsModal({ visible, onClose, member, shops }: PermissionsModalProps) {
  const { updateTeamMember } = useTeam();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setPermissions(member.permissions || ROLE_PRESETS[member.role as keyof typeof ROLE_PRESETS] || []);
      setSelectedPreset(member.role);
    }
  }, [member, visible]);

  const handleTogglePermission = (permissionId: string) => {
    setPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
    setSelectedPreset(null); // Clear preset when manually changing permissions
  };

  const handleApplyPreset = (role: string) => {
    const presetPermissions = ROLE_PRESETS[role as keyof typeof ROLE_PRESETS] || [];
    setPermissions(presetPermissions);
    setSelectedPreset(role);
  };

  const handleSave = async () => {
    if (!member) return;

    setIsLoading(true);
    
    try {
      await updateTeamMember(member.id, {
        permissions: permissions,
        permissionsUpdatedAt: new Date().toISOString(),
      });

      const message = "Permissions updated successfully";
      if (Platform.OS === 'web') {
        console.log("Success:", message);
      } else {
        Alert.alert("Success", message);
      }
      
      onClose();
    } catch (error) {
      const errorMessage = "Failed to update permissions";
      if (Platform.OS === 'web') {
        console.error("Error:", errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    PERMISSIONS.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "basic": return "#10B981";
      case "advanced": return "#F59E0B";
      case "admin": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "basic": return Eye;
      case "advanced": return Settings;
      case "admin": return Shield;
      default: return Eye;
    }
  };

  const categorizedPermissions = getPermissionsByCategory();
  const shop = shops.find(s => s.id === member?.shopId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Permissions</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            disabled={isLoading}
          >
            <Save size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Member Info */}
          {member && (
            <View style={styles.memberInfo}>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.memberMeta}>
                  <View style={[styles.roleBadge, { backgroundColor: getLevelColor("basic") }]}>
                    <Text style={styles.roleText}>{member.role}</Text>
                  </View>
                  {shop && (
                    <View style={styles.shopInfo}>
                      <MapPin size={12} color="#9CA3AF" />
                      <Text style={styles.shopText}>{shop.name}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Role Presets */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Presets</Text>
            <Text style={styles.sectionDescription}>
              Apply common permission sets based on role
            </Text>
            
            <View style={styles.presetButtons}>
              {Object.keys(ROLE_PRESETS).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.presetButton,
                    selectedPreset === role && styles.presetButtonActive,
                  ]}
                  onPress={() => handleApplyPreset(role)}
                >
                  <Text style={[
                    styles.presetButtonText,
                    selectedPreset === role && styles.presetButtonTextActive,
                  ]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                  <Text style={styles.presetButtonCount}>
                    {ROLE_PRESETS[role as keyof typeof ROLE_PRESETS].length} permissions
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Permission Categories */}
          {Object.entries(categorizedPermissions).map(([category, categoryPermissions]) => (
            <View key={category} style={styles.section}>
              <Text style={styles.sectionTitle}>{category}</Text>
              
              <View style={styles.permissionsList}>
                {categoryPermissions.map((permission) => {
                  const IconComponent = permission.icon;
                  const LevelIcon = getLevelIcon(permission.level);
                  const isEnabled = permissions.includes(permission.id);
                  
                  return (
                    <View key={permission.id} style={styles.permissionItem}>
                      <View style={styles.permissionLeft}>
                        <View style={styles.permissionIcon}>
                          <IconComponent size={20} color={isEnabled ? "#3B82F6" : "#9CA3AF"} />
                        </View>
                        <View style={styles.permissionDetails}>
                          <View style={styles.permissionHeader}>
                            <Text style={[
                              styles.permissionName,
                              isEnabled && styles.permissionNameActive,
                            ]}>
                              {permission.name}
                            </Text>
                            <View style={[
                              styles.levelBadge,
                              { backgroundColor: getLevelColor(permission.level) }
                            ]}>
                              <LevelIcon size={10} color="#FFFFFF" />
                              <Text style={styles.levelText}>{permission.level}</Text>
                            </View>
                          </View>
                          <Text style={styles.permissionDescription}>
                            {permission.description}
                          </Text>
                        </View>
                      </View>
                      
                      <Switch
                        value={isEnabled}
                        onValueChange={() => handleTogglePermission(permission.id)}
                        trackColor={{ false: "#374151", true: "#3B82F6" }}
                        thumbColor={isEnabled ? "#FFFFFF" : "#9CA3AF"}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Security Warning */}
          <View style={styles.section}>
            <View style={styles.warningCard}>
              <AlertTriangle size={20} color="#F59E0B" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Security Notice</Text>
                <Text style={styles.warningText}>
                  Admin-level permissions grant significant access to shop data and settings. 
                  Only assign these permissions to trusted team members.
                </Text>
              </View>
            </View>
          </View>

          {/* Permission Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Permission Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Permissions:</Text>
                <Text style={styles.summaryValue}>{permissions.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Basic Level:</Text>
                <Text style={styles.summaryValue}>
                  {permissions.filter(id => {
                    const perm = PERMISSIONS.find(p => p.id === id);
                    return perm?.level === "basic";
                  }).length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Advanced Level:</Text>
                <Text style={styles.summaryValue}>
                  {permissions.filter(id => {
                    const perm = PERMISSIONS.find(p => p.id === id);
                    return perm?.level === "advanced";
                  }).length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Admin Level:</Text>
                <Text style={styles.summaryValue}>
                  {permissions.filter(id => {
                    const perm = PERMISSIONS.find(p => p.id === id);
                    return perm?.level === "admin";
                  }).length}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
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
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  memberInfo: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    marginTop: 20,
  },
  memberDetails: {
    alignItems: "flex-start",
  },
  memberName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  memberMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 16,
    lineHeight: 20,
  },
  presetButtons: {
    flexDirection: "row",
    gap: 12,
  },
  presetButton: {
    flex: 1,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  presetButtonActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#1E3A8A",
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  presetButtonTextActive: {
    color: "#FFFFFF",
  },
  presetButtonCount: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  permissionsList: {
    gap: 12,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
  },
  permissionLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  permissionDetails: {
    flex: 1,
  },
  permissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  permissionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    flex: 1,
  },
  permissionNameActive: {
    color: "#FFFFFF",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  permissionDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#1F2937",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 16,
  },
  summaryCard: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});