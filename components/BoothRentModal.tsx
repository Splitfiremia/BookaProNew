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
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  Save,
  History,
  TrendingUp,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Receipt,
  Smartphone,
} from "lucide-react-native";
import { useTeam } from "@/providers/TeamProvider";

interface PaymentHistory {
  id: string;
  amount: number;
  date: string;
  status: "paid" | "late" | "partial";
  method: "cash" | "card" | "transfer" | "app";
  notes?: string;
  lateFeeApplied?: number;
  receiptUrl?: string;
  transactionId?: string;
}

interface RentalAgreement {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  fileSize: number;
  fileType: string;
}

interface BoothRentModalProps {
  visible: boolean;
  onClose: () => void;
  member?: any;
}

export default function BoothRentModal({ visible, onClose, member }: BoothRentModalProps) {
  const { updateTeamMember } = useTeam();
  const [rentAmount, setRentAmount] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [paymentSchedule, setPaymentSchedule] = useState<"monthly" | "weekly" | "biweekly">("monthly");
  const [autoDeduct, setAutoDeduct] = useState<boolean>(false);
  const [lateFee, setLateFee] = useState<string>("");
  const [gracePeriod, setGracePeriod] = useState<string>("3");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "app">("app");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [lateFeeEnabled, setLateFeeEnabled] = useState<boolean>(false);
  const [lateFeeType, setLateFeeType] = useState<"fixed" | "percentage">("fixed");
  const [lateFeePercentage, setLateFeePercentage] = useState<string>("5");
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
  
  // Mock payment history
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([
    {
      id: "1",
      amount: 800,
      date: "2024-01-01",
      status: "paid",
      method: "app",
      notes: "On time payment via app",
      transactionId: "TXN-001",
      receiptUrl: "https://example.com/receipt-001.pdf",
    },
    {
      id: "2",
      amount: 800,
      date: "2024-02-01",
      status: "paid",
      method: "cash",
    },
    {
      id: "3",
      amount: 850,
      date: "2024-03-01",
      status: "late",
      method: "app",
      notes: "Paid 5 days late",
      lateFeeApplied: 50,
      transactionId: "TXN-003",
      receiptUrl: "https://example.com/receipt-003.pdf",
    },
  ]);

  useEffect(() => {
    if (member && visible) {
      setRentAmount(member.boothRentAmount?.toString() || "");
      setDueDate(member.boothRentDueDate ? new Date(member.boothRentDueDate).toISOString().split('T')[0] : "");
      setPaymentSchedule(member.paymentSchedule || "monthly");
      setAutoDeduct(member.autoDeduct || false);
      setLateFee(member.lateFee?.toString() || "");
      setGracePeriod(member.gracePeriod?.toString() || "3");
      setNotes(member.boothRentNotes || "");
      setLateFeeEnabled(!!member.lateFee);
      setLateFeeType(member.lateFeeType || "fixed");
      setLateFeePercentage(member.lateFeePercentage?.toString() || "5");
      
      // Load rental agreements
      setAgreements(member.rentalAgreements || []);
    }
  }, [member, visible]);

  const handleSave = async () => {
    if (!member) return;

    if (!rentAmount.trim()) {
      const message = "Please enter a rent amount";
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert("Validation Error", message);
      }
      return;
    }

    setIsLoading(true);
    
    try {
      const nextDueDate = dueDate 
        ? new Date(dueDate).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await updateTeamMember(member.id, {
        boothRentAmount: parseFloat(rentAmount),
        boothRentDueDate: nextDueDate,
        paymentSchedule: paymentSchedule,
        autoDeduct: autoDeduct,
        lateFee: lateFeeEnabled && lateFee ? parseFloat(lateFee) : undefined,
        gracePeriod: parseInt(gracePeriod),
        boothRentNotes: notes.trim(),
        boothRentStatus: "pending",
      } as any);

      const message = "Booth rent settings updated successfully";
      if (Platform.OS === 'web') {
        console.log("Success:", message);
      } else {
        Alert.alert("Success", message);
      }
      
      onClose();
    } catch (error) {
      const errorMessage = "Failed to update booth rent settings";
      if (Platform.OS === 'web') {
        console.error("Error:", errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!member) return;

    try {
      const nextDueDate = new Date();
      if (paymentSchedule === "weekly") {
        nextDueDate.setDate(nextDueDate.getDate() + 7);
      } else if (paymentSchedule === "biweekly") {
        nextDueDate.setDate(nextDueDate.getDate() + 14);
      } else {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }

      await updateTeamMember(member.id, {
        boothRentStatus: "paid",
        lastPaymentDate: new Date().toISOString(),
        boothRentDueDate: nextDueDate.toISOString(),
      });

      const message = "Payment recorded successfully";
      if (Platform.OS === 'web') {
        console.log("Success:", message);
      } else {
        Alert.alert("Success", message);
      }
    } catch (error) {
      const errorMessage = "Failed to record payment";
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
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "#10B981";
      case "late": return "#EF4444";
      case "partial": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  const getNextDueDate = () => {
    if (!dueDate) return "Not set";
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return "Due today";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const calculateMonthlyTotal = () => {
    const amount = parseFloat(rentAmount) || 0;
    
    if (paymentSchedule === "weekly") {
      return amount * 4.33; // Average weeks per month
    } else if (paymentSchedule === "biweekly") {
      return amount * 2.17; // Average biweeks per month
    }
    return amount;
  };

  const calculateLateFee = (baseAmount: number) => {
    if (!lateFeeEnabled) return 0;
    
    if (lateFeeType === "percentage") {
      return baseAmount * (parseFloat(lateFeePercentage) / 100);
    }
    return parseFloat(lateFee) || 0;
  };

  const handleCollectPayment = async () => {
    if (!member || !paymentAmount.trim()) return;

    try {
      const amount = parseFloat(paymentAmount);
      const baseRent = parseFloat(rentAmount) || 0;
      const isLate = new Date() > new Date(dueDate);
      const appliedLateFee = isLate ? calculateLateFee(baseRent) : 0;
      
      const newPayment: PaymentHistory = {
        id: `payment-${Date.now()}`,
        amount: amount,
        date: new Date().toISOString(),
        status: isLate ? "late" : "paid",
        method: paymentMethod,
        notes: paymentNotes.trim(),
        lateFeeApplied: appliedLateFee,
        transactionId: paymentMethod === "app" ? `TXN-${Date.now()}` : undefined,
        receiptUrl: paymentMethod === "app" ? `https://example.com/receipt-${Date.now()}.pdf` : undefined,
      };

      setPaymentHistory(prev => [newPayment, ...prev]);
      
      // Update member status
      await handleMarkPaid();
      
      // Reset payment form
      setPaymentAmount("");
      setPaymentNotes("");
      setShowPaymentModal(false);
      
      const message = "Payment collected successfully!";
      if (Platform.OS === 'web') {
        console.log("Success:", message);
      } else {
        Alert.alert("Success", message);
      }
    } catch (error) {
      const errorMessage = "Failed to collect payment";
      if (Platform.OS === 'web') {
        console.error("Error:", errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const handleUploadAgreement = () => {
    // Mock file upload
    const newAgreement: RentalAgreement = {
      id: `agreement-${Date.now()}`,
      fileName: `Rental_Agreement_${member?.name?.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`,
      fileUrl: `https://example.com/agreements/agreement-${Date.now()}.pdf`,
      uploadDate: new Date().toISOString(),
      fileSize: 245760, // 240KB
      fileType: "application/pdf",
    };
    
    setAgreements(prev => [...prev, newAgreement]);
    
    const message = "Rental agreement uploaded successfully!";
    if (Platform.OS === 'web') {
      console.log("Success:", message);
    } else {
      Alert.alert("Success", message);
    }
  };

  const handleDeleteAgreement = (agreementId: string) => {
    setAgreements(prev => prev.filter(a => a.id !== agreementId));
    
    const message = "Rental agreement deleted successfully!";
    if (Platform.OS === 'web') {
      console.log("Success:", message);
    } else {
      Alert.alert("Success", message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
          <Text style={styles.headerTitle}>Booth Rent Management</Text>
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
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(member.boothRentStatus || "pending") }
                  ]}>
                    <Text style={styles.statusText}>
                      {member.boothRentStatus || "pending"}
                    </Text>
                  </View>
                  <Text style={styles.dueDateText}>
                    {getNextDueDate()}
                  </Text>
                </View>
              </View>
              
              {member.boothRentStatus === "pending" && (
                <TouchableOpacity 
                  style={styles.markPaidButton}
                  onPress={handleMarkPaid}
                >
                  <CheckCircle size={16} color="#FFFFFF" />
                  <Text style={styles.markPaidText}>Mark Paid</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Current Status Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            <View style={styles.statusGrid}>
              <View style={styles.statusCard}>
                <DollarSign size={20} color="#10B981" />
                <Text style={styles.statusValue}>
                  {formatCurrency(parseFloat(rentAmount) || 0)}
                </Text>
                <Text style={styles.statusLabel}>Current Rent</Text>
              </View>
              
              <View style={styles.statusCard}>
                <Calendar size={20} color="#3B82F6" />
                <Text style={styles.statusValue}>
                  {dueDate ? formatDate(dueDate) : "Not set"}
                </Text>
                <Text style={styles.statusLabel}>Next Due Date</Text>
              </View>
              
              <View style={styles.statusCard}>
                <TrendingUp size={20} color="#F59E0B" />
                <Text style={styles.statusValue}>
                  {formatCurrency(calculateMonthlyTotal())}
                </Text>
                <Text style={styles.statusLabel}>Monthly Total</Text>
              </View>
            </View>
          </View>

          {/* Rent Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rent Settings</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rent Amount *</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.textInput}
                  value={rentAmount}
                  onChangeText={setRentAmount}
                  placeholder="Enter rent amount"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Schedule</Text>
              <View style={styles.scheduleSelection}>
                {["weekly", "biweekly", "monthly"].map((schedule) => (
                  <TouchableOpacity
                    key={schedule}
                    style={[
                      styles.scheduleButton,
                      paymentSchedule === schedule && styles.scheduleButtonActive,
                    ]}
                    onPress={() => setPaymentSchedule(schedule as any)}
                  >
                    <Text style={[
                      styles.scheduleButtonText,
                      paymentSchedule === schedule && styles.scheduleButtonTextActive,
                    ]}>
                      {schedule.charAt(0).toUpperCase() + schedule.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Next Due Date</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.textInput}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6B7280"
                />
              </View>
            </View>
          </View>

          {/* Late Fees & Policies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Late Fees & Policies</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.checkboxRow}>
                <TouchableOpacity 
                  style={[styles.checkbox, lateFeeEnabled && styles.checkboxActive]}
                  onPress={() => setLateFeeEnabled(!lateFeeEnabled)}
                >
                  {lateFeeEnabled && <CheckCircle size={16} color="#FFFFFF" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Enable Late Fees</Text>
              </View>
            </View>

            {lateFeeEnabled && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Late Fee Type</Text>
                  <View style={styles.scheduleSelection}>
                    {["fixed", "percentage"].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.scheduleButton,
                          lateFeeType === type && styles.scheduleButtonActive,
                        ]}
                        onPress={() => setLateFeeType(type as any)}
                      >
                        <Text style={[
                          styles.scheduleButtonText,
                          lateFeeType === type && styles.scheduleButtonTextActive,
                        ]}>
                          {type === "fixed" ? "Fixed Amount" : "Percentage"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {lateFeeType === "fixed" ? "Late Fee Amount" : "Late Fee Percentage"}
                  </Text>
                  <View style={styles.inputContainer}>
                    {lateFeeType === "fixed" ? (
                      <DollarSign size={20} color="#9CA3AF" />
                    ) : (
                      <Text style={styles.percentageSymbol}>%</Text>
                    )}
                    <TextInput
                      style={styles.textInput}
                      value={lateFeeType === "fixed" ? lateFee : lateFeePercentage}
                      onChangeText={lateFeeType === "fixed" ? setLateFee : setLateFeePercentage}
                      placeholder={lateFeeType === "fixed" ? "Enter late fee amount" : "Enter percentage"}
                      placeholderTextColor="#6B7280"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Grace Period (Days)</Text>
              <View style={styles.inputContainer}>
                <Clock size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.textInput}
                  value={gracePeriod}
                  onChangeText={setGracePeriod}
                  placeholder="Enter grace period in days"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Rent Collection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rent Collection</Text>
              <TouchableOpacity 
                style={styles.collectButton}
                onPress={() => setShowPaymentModal(true)}
              >
                <Smartphone size={16} color="#FFFFFF" />
                <Text style={styles.collectButtonText}>Collect Payment</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.collectionInfo}>
              <View style={styles.collectionCard}>
                <View style={styles.collectionHeader}>
                  <Receipt size={20} color="#3B82F6" />
                  <Text style={styles.collectionTitle}>In-App Collection</Text>
                </View>
                <Text style={styles.collectionDescription}>
                  Collect rent payments directly through the app with automatic receipt generation
                </Text>
                <View style={styles.collectionFeatures}>
                  <Text style={styles.featureText}>• Instant payment processing</Text>
                  <Text style={styles.featureText}>• Automatic late fee calculation</Text>
                  <Text style={styles.featureText}>• Digital receipt generation</Text>
                  <Text style={styles.featureText}>• Payment history tracking</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Rental Agreements */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rental Agreements</Text>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleUploadAgreement}
              >
                <Upload size={16} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.agreementsList}>
              {agreements.length === 0 ? (
                <View style={styles.emptyAgreements}>
                  <FileText size={32} color="#6B7280" />
                  <Text style={styles.emptyAgreementsText}>No rental agreements uploaded</Text>
                  <Text style={styles.emptyAgreementsSubtext}>
                    Upload signed rental agreements for record keeping
                  </Text>
                </View>
              ) : (
                agreements.map((agreement) => (
                  <View key={agreement.id} style={styles.agreementItem}>
                    <View style={styles.agreementIcon}>
                      <FileText size={20} color="#3B82F6" />
                    </View>
                    <View style={styles.agreementDetails}>
                      <Text style={styles.agreementName}>{agreement.fileName}</Text>
                      <Text style={styles.agreementMeta}>
                        {formatDate(agreement.uploadDate)} • {formatFileSize(agreement.fileSize)}
                      </Text>
                    </View>
                    <View style={styles.agreementActions}>
                      <TouchableOpacity style={styles.agreementAction}>
                        <Eye size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.agreementAction}>
                        <Download size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.agreementAction}
                        onPress={() => handleDeleteAgreement(agreement.id)}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Payment History */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment History</Text>
              <TouchableOpacity style={styles.historyButton}>
                <History size={16} color="#6B7280" />
                <Text style={styles.historyButtonText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.historyList}>
              {paymentHistory.slice(0, 3).map((payment) => (
                <View key={payment.id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View style={[
                      styles.historyStatus,
                      { backgroundColor: getStatusColor(payment.status) }
                    ]}>
                      <CheckCircle size={12} color="#FFFFFF" />
                    </View>
                    <View style={styles.historyDetails}>
                      <View style={styles.historyAmountRow}>
                        <Text style={styles.historyAmount}>
                          {formatCurrency(payment.amount)}
                        </Text>
                        {payment.lateFeeApplied && payment.lateFeeApplied > 0 && (
                          <Text style={styles.lateFeeIndicator}>
                            +{formatCurrency(payment.lateFeeApplied)} late fee
                          </Text>
                        )}
                      </View>
                      <Text style={styles.historyDate}>
                        {formatDate(payment.date)}
                      </Text>
                      {payment.transactionId && (
                        <Text style={styles.transactionId}>
                          ID: {payment.transactionId}
                        </Text>
                      )}
                      {payment.notes && (
                        <Text style={styles.historyNotes}>
                          {payment.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.historyRight}>
                    <View style={[
                      styles.paymentMethodBadge,
                      { backgroundColor: getStatusColor(payment.status) }
                    ]}>
                      <Text style={styles.paymentMethodText}>
                        {payment.method}
                      </Text>
                    </View>
                    {payment.receiptUrl && (
                      <TouchableOpacity style={styles.receiptButton}>
                        <Receipt size={12} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesContainer}>
              <FileText size={20} color="#9CA3AF" />
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes about booth rent arrangement..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Base Rent:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(parseFloat(rentAmount) || 0)} / {paymentSchedule}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Late Fee:</Text>
                <Text style={styles.summaryValue}>
                  {lateFee ? formatCurrency(parseFloat(lateFee)) : "None"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Grace Period:</Text>
                <Text style={styles.summaryValue}>
                  {gracePeriod} days
                </Text>
              </View>
              {lateFeeEnabled && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Potential Late Fee:</Text>
                  <Text style={styles.summaryValue}>
                    {lateFeeType === "percentage" 
                      ? `${lateFeePercentage}% of rent`
                      : formatCurrency(parseFloat(lateFee) || 0)
                    }
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Monthly Total:</Text>
                <Text style={styles.summaryTotalValue}>
                  {formatCurrency(calculateMonthlyTotal())}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Payment Collection Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.paymentModalContainer}>
          <View style={styles.paymentModalHeader}>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.paymentModalTitle}>Collect Payment</Text>
            <TouchableOpacity 
              onPress={handleCollectPayment}
              style={styles.paymentModalSave}
            >
              <Text style={styles.paymentModalSaveText}>Collect</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.paymentModalContent}>
            <View style={styles.paymentSummary}>
              <Text style={styles.paymentSummaryTitle}>Payment Summary</Text>
              <View style={styles.paymentSummaryRow}>
                <Text style={styles.paymentSummaryLabel}>Base Rent:</Text>
                <Text style={styles.paymentSummaryValue}>
                  {formatCurrency(parseFloat(rentAmount) || 0)}
                </Text>
              </View>
              {new Date() > new Date(dueDate) && lateFeeEnabled && (
                <View style={styles.paymentSummaryRow}>
                  <Text style={[styles.paymentSummaryLabel, { color: "#EF4444" }]}>Late Fee:</Text>
                  <Text style={[styles.paymentSummaryValue, { color: "#EF4444" }]}>
                    {formatCurrency(calculateLateFee(parseFloat(rentAmount) || 0))}
                  </Text>
                </View>
              )}
              <View style={[styles.paymentSummaryRow, styles.paymentSummaryTotal]}>
                <Text style={styles.paymentSummaryTotalLabel}>Total Due:</Text>
                <Text style={styles.paymentSummaryTotalValue}>
                  {formatCurrency(
                    (parseFloat(rentAmount) || 0) + 
                    (new Date() > new Date(dueDate) && lateFeeEnabled 
                      ? calculateLateFee(parseFloat(rentAmount) || 0) 
                      : 0)
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.paymentForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Amount *</Text>
                <View style={styles.inputContainer}>
                  <DollarSign size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.textInput}
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                    placeholder="Enter payment amount"
                    placeholderTextColor="#6B7280"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                  {["app", "cash", "card", "transfer"].map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.paymentMethodButton,
                        paymentMethod === method && styles.paymentMethodButtonActive,
                      ]}
                      onPress={() => setPaymentMethod(method as any)}
                    >
                      <Text style={[
                        styles.paymentMethodButtonText,
                        paymentMethod === method && styles.paymentMethodButtonTextActive,
                      ]}>
                        {method === "app" ? "In-App" : method.charAt(0).toUpperCase() + method.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Notes</Text>
                <View style={styles.notesContainer}>
                  <FileText size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.notesInput}
                    value={paymentNotes}
                    onChangeText={setPaymentNotes}
                    placeholder="Add notes about this payment..."
                    placeholderTextColor="#6B7280"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    marginTop: 20,
  },
  memberDetails: {
    flex: 1,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  dueDateText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  markPaidButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  markPaidText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 6,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
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
  scheduleSelection: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
  },
  scheduleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  scheduleButtonActive: {
    backgroundColor: "#374151",
  },
  scheduleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  scheduleButtonTextActive: {
    color: "#FFFFFF",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  historyStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  historyDetails: {
    flex: 1,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  historyNotes: {
    fontSize: 11,
    color: "#6B7280",
  },
  historyRight: {
    alignItems: "flex-end",
  },
  paymentMethodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentMethodText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  notesInput: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    minHeight: 80,
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
    fontWeight: "500",
    color: "#FFFFFF",
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 12,
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  // Checkbox styles
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  percentageSymbol: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  // Collection styles
  collectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  collectButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  collectionInfo: {
    marginBottom: 16,
  },
  collectionCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  collectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  collectionDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
    marginBottom: 16,
  },
  collectionFeatures: {
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  // Agreement styles
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  agreementsList: {
    gap: 12,
  },
  emptyAgreements: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyAgreementsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyAgreementsSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  agreementItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  agreementIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  agreementDetails: {
    flex: 1,
  },
  agreementName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  agreementMeta: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  agreementActions: {
    flexDirection: "row",
    gap: 8,
  },
  agreementAction: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#374151",
  },
  // Payment history enhancements
  historyAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  lateFeeIndicator: {
    fontSize: 10,
    color: "#EF4444",
    fontWeight: "500",
  },
  transactionId: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 2,
  },
  receiptButton: {
    padding: 4,
    marginTop: 4,
  },
  // Payment modal styles
  paymentModalContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  paymentModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  paymentModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  paymentModalSave: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  paymentModalSaveText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  paymentModalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  paymentSummary: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  paymentSummaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  paymentSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentSummaryLabel: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  paymentSummaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  paymentSummaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 12,
    marginTop: 8,
  },
  paymentSummaryTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  paymentSummaryTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  paymentForm: {
    marginBottom: 40,
  },
  paymentMethods: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  paymentMethodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  paymentMethodButtonActive: {
    backgroundColor: "#374151",
  },
  paymentMethodButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  paymentMethodButtonTextActive: {
    color: "#FFFFFF",
  },
});