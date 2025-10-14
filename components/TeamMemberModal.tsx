import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  DollarSign,
  Calendar,
  Save,
  Plus,
  Trash2,
} from "lucide-react-native";
import { useTeam } from "@/providers/TeamProvider";

interface TeamMemberModalProps {
  visible: boolean;
  onClose: () => void;
  member?: any;
  shops: any[];
}

export default function TeamMemberModal({ visible, onClose, member, shops }: TeamMemberModalProps) {
  const { addTeamMember, updateTeamMember } = useTeam();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "stylist",
    shopId: "",
    specialties: [] as string[],
    boothRentAmount: "",
    hourlyRate: "",
    commissionRate: "",
  });
  const [newSpecialty, setNewSpecialty] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        role: member.role || "stylist",
        shopId: member.shopId || "",
        specialties: member.specialties || [],
        boothRentAmount: member.boothRentAmount?.toString() || "",
        hourlyRate: member.hourlyRate?.toString() || "",
        commissionRate: member.commissionRate?.toString() || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "stylist",
        shopId: shops[0]?.id || "",
        specialties: [],
        boothRentAmount: "",
        hourlyRate: "",
        commissionRate: "",
      });
    }
  }, [member, shops, visible]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.shopId) {
      const message = "Please fill in all required fields";
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert("Validation Error", message);
      }
      return;
    }

    setIsLoading(true);
    
    try {
      const shop = shops.find(s => s.id === formData.shopId);
      const memberData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role as "stylist" | "manager" | "receptionist",
        shopId: formData.shopId,
        shopName: shop?.name || "Unknown Shop",
        specialties: formData.specialties,
        boothRentAmount: formData.boothRentAmount ? parseFloat(formData.boothRentAmount) : undefined,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : undefined,
        boothRentStatus: (formData.role === "stylist" && formData.boothRentAmount ? "pending" : undefined) as "pending" | "paid" | "overdue" | undefined,
        boothRentDueDate: formData.role === "stylist" && formData.boothRentAmount 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          : undefined,
        isAvailable: true,
        appointmentsToday: 0,
        monthlyRevenue: 0,
        rating: 0,
      };

      if (member) {
        await updateTeamMember(member.id, memberData);
      } else {
        await addTeamMember(memberData);
      }

      const successMessage = member ? "Team member updated successfully" : "Team member added successfully";
      if (Platform.OS === 'web') {
        console.log("Success:", successMessage);
      } else {
        Alert.alert("Success", successMessage);
      }
      
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save team member";
      if (Platform.OS === 'web') {
        console.error("Error:", errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }));
      setNewSpecialty("");
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty),
    }));
  };

  const selectedShop = shops.find(s => s.id === formData.shopId);

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
          <Text style={styles.headerTitle}>
            {member ? "Edit Team Member" : "Add Team Member"}
          </Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            disabled={isLoading}
          >
            <Save size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter full name"
                  placeholderTextColor="#6B7280"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.textInput}
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="Enter email address"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.textInput}
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter phone number"
                  placeholderTextColor="#6B7280"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Role & Shop Assignment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Role & Assignment</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Role *</Text>
              <View style={styles.roleSelection}>
                {["stylist", "manager", "receptionist"].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      formData.role === role && styles.roleButtonActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, role }))}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formData.role === role && styles.roleButtonTextActive,
                    ]}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assign to Shop *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {shops.map((shop) => (
                  <TouchableOpacity
                    key={shop.id}
                    style={[
                      styles.shopCard,
                      formData.shopId === shop.id && styles.shopCardActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, shopId: shop.id }))}
                  >
                    <Text style={[
                      styles.shopName,
                      formData.shopId === shop.id && styles.shopNameActive,
                    ]}>
                      {shop.name}
                    </Text>
                    <View style={styles.shopMeta}>
                      <MapPin size={12} color="#9CA3AF" />
                      <Text style={styles.shopLocation}>
                        {shop.city}, {shop.state}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Specialties */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Add Specialty</Text>
              <View style={styles.specialtyInputContainer}>
                <TextInput
                  style={styles.specialtyInput}
                  value={newSpecialty}
                  onChangeText={setNewSpecialty}
                  placeholder="e.g., Haircut, Color, Styling"
                  placeholderTextColor="#6B7280"
                  onSubmitEditing={handleAddSpecialty}
                />
                <TouchableOpacity 
                  style={styles.addSpecialtyButton}
                  onPress={handleAddSpecialty}
                >
                  <Plus size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {formData.specialties.length > 0 && (
              <View style={styles.specialtyTags}>
                {formData.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                    <TouchableOpacity 
                      onPress={() => handleRemoveSpecialty(specialty)}
                      style={styles.removeSpecialtyButton}
                    >
                      <X size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Compensation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compensation</Text>
            
            {formData.role === "stylist" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Booth Rent (Monthly)</Text>
                <View style={styles.inputContainer}>
                  <DollarSign size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.textInput}
                    value={formData.boothRentAmount}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, boothRentAmount: text }))}
                    placeholder="Enter monthly booth rent"
                    placeholderTextColor="#6B7280"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hourly Rate</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.textInput}
                  value={formData.hourlyRate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, hourlyRate: text }))}
                  placeholder="Enter hourly rate"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Commission Rate (%)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.percentSymbol}>%</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.commissionRate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, commissionRate: text }))}
                  placeholder="Enter commission percentage"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Summary */}
          {selectedShop && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Name:</Text>
                  <Text style={styles.summaryValue}>{formData.name || "Not specified"}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Role:</Text>
                  <Text style={styles.summaryValue}>
                    {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shop:</Text>
                  <Text style={styles.summaryValue}>{selectedShop.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Specialties:</Text>
                  <Text style={styles.summaryValue}>
                    {formData.specialties.length > 0 ? formData.specialties.join(", ") : "None"}
                  </Text>
                </View>
                {formData.boothRentAmount && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Booth Rent:</Text>
                    <Text style={styles.summaryValue}>${formData.boothRentAmount}/month</Text>
                  </View>
                )}
              </View>
            </View>
          )}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  percentSymbol: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  roleSelection: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#374151",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  roleButtonTextActive: {
    color: "#FFFFFF",
  },
  shopCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 160,
    borderWidth: 2,
    borderColor: "transparent",
  },
  shopCardActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#1E3A8A",
  },
  shopName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  shopNameActive: {
    color: "#FFFFFF",
  },
  shopMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shopLocation: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  specialtyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    paddingLeft: 12,
    gap: 8,
  },
  specialtyInput: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    paddingVertical: 12,
  },
  addSpecialtyButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 6,
    padding: 8,
    margin: 4,
  },
  specialtyTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  specialtyTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  specialtyText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  removeSpecialtyButton: {
    padding: 2,
  },
  summaryCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "right",
  },
});