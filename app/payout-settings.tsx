import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import {
  X,

  Building2,
  Mail,

  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { usePayments, PayoutSettings } from "@/providers/PaymentProvider";
import { useAuth } from "@/providers/AuthProvider";

export default function PayoutSettingsScreen() {
  const { user } = useAuth();
  const { payoutSettings, updatePayoutSettings, isLoading } = usePayments();
  const [formData, setFormData] = useState<PayoutSettings>({
    schedule: "weekly",
    accountType: "bank",
    accountDetails: {
      accountNumber: "",
      routingNumber: "",
      bankName: "",
      accountHolderName: "",
      email: "",
      phone: "",
    },
    instantPayoutFee: 1.5,
    minimumPayout: 25,
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (payoutSettings) {
      setFormData(payoutSettings);
    }
  }, [payoutSettings]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.accountType === "bank") {
      if (!formData.accountDetails.accountNumber?.trim()) {
        newErrors.accountNumber = "Account number is required";
      }
      if (!formData.accountDetails.routingNumber?.trim()) {
        newErrors.routingNumber = "Routing number is required";
      }
      if (!formData.accountDetails.bankName?.trim()) {
        newErrors.bankName = "Bank name is required";
      }
      if (!formData.accountDetails.accountHolderName?.trim()) {
        newErrors.accountHolderName = "Account holder name is required";
      }
    } else if (formData.accountType === "paypal") {
      if (!formData.accountDetails.email?.trim()) {
        newErrors.email = "PayPal email is required";
      }
    }

    if (formData.minimumPayout < 1) {
      newErrors.minimumPayout = "Minimum payout must be at least $1";
    }

    if (formData.instantPayoutFee < 0 || formData.instantPayoutFee > 10) {
      newErrors.instantPayoutFee = "Fee must be between 0% and 10%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      await updatePayoutSettings(formData);
      Alert.alert("Success", "Payout settings saved successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PayoutSettings] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (user?.role === "client") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payout Settings</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.noAccessText}>Payout settings are only available for service providers.</Text>
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
        <Text style={styles.headerTitle}>Payout Settings</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, (isSaving || isLoading) && styles.saveButtonDisabled]}
          disabled={isSaving || isLoading}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Shield size={20} color="#10B981" />
          <View style={styles.securityNoticeContent}>
            <Text style={styles.securityNoticeTitle}>Secure & Encrypted</Text>
            <Text style={styles.securityNoticeText}>
              Your banking information is encrypted and stored securely. We never store your full account details.
            </Text>
          </View>
        </View>

        {/* Payout Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payout Schedule</Text>
          <Text style={styles.sectionDescription}>Choose how often you'd like to receive payouts</Text>
          
          <View style={styles.scheduleOptions}>
            {[
              { value: "daily", label: "Daily", description: "Every business day" },
              { value: "weekly", label: "Weekly", description: "Every Friday" },
              { value: "monthly", label: "Monthly", description: "1st of each month" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.scheduleOption,
                  formData.schedule === option.value && styles.scheduleOptionActive,
                ]}
                onPress={() => updateFormData("schedule", option.value)}
              >
                <View style={styles.scheduleOptionContent}>
                  <Text
                    style={[
                      styles.scheduleOptionLabel,
                      formData.schedule === option.value && styles.scheduleOptionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.scheduleOptionDescription,
                      formData.schedule === option.value && styles.scheduleOptionDescriptionActive,
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
                {formData.schedule === option.value && (
                  <CheckCircle size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Type</Text>
          <Text style={styles.sectionDescription}>Select your preferred payout method</Text>
          
          <View style={styles.accountTypeOptions}>
            {[
              { value: "bank", label: "Bank Account", icon: Building2, description: "Direct deposit to your bank" },
              { value: "paypal", label: "PayPal", icon: Mail, description: "Transfer to PayPal account" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.accountTypeOption,
                  formData.accountType === option.value && styles.accountTypeOptionActive,
                ]}
                onPress={() => updateFormData("accountType", option.value)}
              >
                <option.icon
                  size={24}
                  color={formData.accountType === option.value ? "#10B981" : "#6B7280"}
                />
                <View style={styles.accountTypeOptionContent}>
                  <Text
                    style={[
                      styles.accountTypeOptionLabel,
                      formData.accountType === option.value && styles.accountTypeOptionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.accountTypeOptionDescription,
                      formData.accountType === option.value && styles.accountTypeOptionDescriptionActive,
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
                {formData.accountType === option.value && (
                  <CheckCircle size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          
          {formData.accountType === "bank" ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Holder Name</Text>
                <TextInput
                  style={[styles.input, errors.accountHolderName && styles.inputError]}
                  value={formData.accountDetails.accountHolderName}
                  onChangeText={(value) => updateFormData("accountDetails.accountHolderName", value)}
                  placeholder="Full name on account"
                  placeholderTextColor="#6B7280"
                />
                {errors.accountHolderName && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.accountHolderName}</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank Name</Text>
                <TextInput
                  style={[styles.input, errors.bankName && styles.inputError]}
                  value={formData.accountDetails.bankName}
                  onChangeText={(value) => updateFormData("accountDetails.bankName", value)}
                  placeholder="e.g., Chase Bank"
                  placeholderTextColor="#6B7280"
                />
                {errors.bankName && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.bankName}</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Number</Text>
                <TextInput
                  style={[styles.input, errors.accountNumber && styles.inputError]}
                  value={formData.accountDetails.accountNumber}
                  onChangeText={(value) => updateFormData("accountDetails.accountNumber", value)}
                  placeholder="Account number"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  secureTextEntry
                />
                {errors.accountNumber && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.accountNumber}</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Routing Number</Text>
                <TextInput
                  style={[styles.input, errors.routingNumber && styles.inputError]}
                  value={formData.accountDetails.routingNumber}
                  onChangeText={(value) => updateFormData("accountDetails.routingNumber", value)}
                  placeholder="9-digit routing number"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                />
                {errors.routingNumber && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.routingNumber}</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PayPal Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.accountDetails.email}
                onChangeText={(value) => updateFormData("accountDetails.email", value)}
                placeholder="your@paypal.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.email}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Payout Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payout Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Minimum Payout Amount</Text>
            <View style={styles.currencyInput}>
              <DollarSign size={20} color="#6B7280" />
              <TextInput
                style={[styles.currencyInputField, errors.minimumPayout && styles.inputError]}
                value={formData.minimumPayout.toString()}
                onChangeText={(value) => updateFormData("minimumPayout", parseFloat(value) || 0)}
                placeholder="25"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
            </View>
            {errors.minimumPayout && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errors.minimumPayout}</Text>
              </View>
            )}
            <Text style={styles.inputDescription}>
              Minimum amount required before a payout can be processed
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Instant Payout Fee</Text>
            <View style={styles.percentageInput}>
              <TextInput
                style={[styles.percentageInputField, errors.instantPayoutFee && styles.inputError]}
                value={formData.instantPayoutFee.toString()}
                onChangeText={(value) => updateFormData("instantPayoutFee", parseFloat(value) || 0)}
                placeholder="1.5"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
              <Text style={styles.percentageSymbol}>%</Text>
            </View>
            {errors.instantPayoutFee && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errors.instantPayoutFee}</Text>
              </View>
            )}
            <Text style={styles.inputDescription}>
              Fee charged for instant payouts (0-10%)
            </Text>
          </View>
        </View>

        {/* Next Payout Info */}
        {payoutSettings?.nextPayoutDate && (
          <View style={styles.nextPayoutCard}>
            <Calendar size={20} color="#3B82F6" />
            <View style={styles.nextPayoutContent}>
              <Text style={styles.nextPayoutTitle}>Next Scheduled Payout</Text>
              <Text style={styles.nextPayoutDate}>
                {new Date(payoutSettings.nextPayoutDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
        )}
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
  saveButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 60,
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
  securityNotice: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  securityNoticeContent: {
    marginLeft: 12,
    flex: 1,
  },
  securityNoticeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginBottom: 4,
  },
  securityNoticeText: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
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
  scheduleOptions: {
    gap: 12,
  },
  scheduleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  scheduleOptionActive: {
    borderColor: "#10B981",
    backgroundColor: "#1F2937",
  },
  scheduleOptionContent: {
    flex: 1,
  },
  scheduleOptionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  scheduleOptionLabelActive: {
    color: "#10B981",
  },
  scheduleOptionDescription: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  scheduleOptionDescriptionActive: {
    color: "#9CA3AF",
  },
  accountTypeOptions: {
    gap: 12,
  },
  accountTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  accountTypeOptionActive: {
    borderColor: "#10B981",
  },
  accountTypeOptionContent: {
    marginLeft: 12,
    flex: 1,
  },
  accountTypeOptionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  accountTypeOptionLabelActive: {
    color: "#10B981",
  },
  accountTypeOptionDescription: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  accountTypeOptionDescriptionActive: {
    color: "#9CA3AF",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
    lineHeight: 16,
  },
  currencyInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  currencyInputField: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 8,
    fontSize: 16,
    color: "#FFFFFF",
  },
  percentageInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  percentageInputField: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  percentageSymbol: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
  },
  nextPayoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  nextPayoutContent: {
    marginLeft: 12,
  },
  nextPayoutTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  nextPayoutDate: {
    fontSize: 14,
    color: "#3B82F6",
  },
});