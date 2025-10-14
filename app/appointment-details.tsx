import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone,
  Share2,
  CalendarPlus,
  Navigation
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AppointmentDetailsScreen() {
  const { id, status } = useLocalSearchParams();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    Alert.alert("Appointment Cancelled", "Your appointment has been cancelled.");
    router.back();
  };

  const handleReschedule = () => {
    router.push("/booking");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>APPOINTMENT DETAILS</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.providerSection}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" }}
            style={styles.providerImage}
          />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>Jose Santiago</Text>
            <Text style={styles.serviceName}>Haircut</Text>
            <View style={[styles.statusBadge, { backgroundColor: status === "confirmed" ? "#4CAF50" : "#FFA726" }]}>
              <Text style={styles.statusText}>{(status || "CONFIRMED").toString().toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateDay}>SAT</Text>
            <Text style={styles.dateNumber}>13</Text>
            <Text style={styles.dateMonth}>SEP</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCancel}>
            <X color="#FF4444" size={20} />
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 color="#D4AF37" size={20} />
            <Text style={styles.actionButtonText}>SHARE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleReschedule}>
            <Calendar color="#D4AF37" size={20} />
            <Text style={styles.actionButtonText}>RESCHEDULE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Clock color="#666" size={20} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Saturday, September 13, 2025</Text>
              <Text style={styles.detailSubtitle}>5:00 PM - 5:30 PM</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.linkText}>ADD TO CAL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Scissors color="#666" size={20} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Haircut</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MapPin color="#666" size={20} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Free Advice Barber Shop</Text>
              <Text style={styles.detailSubtitle}>548 East 13th Street</Text>
              <Text style={styles.detailSubtitle}>New York, NY 10009</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.linkText}>DIRECTIONS</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Phone color="#666" size={20} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>13477212262</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.linkText}>CALL</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>PAYMENT SUMMARY</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Service Amount</Text>
            <Text style={styles.paymentValue}>$35</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.paymentRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>$35</Text>
          </View>

          <View style={styles.orDivider}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <Text style={styles.paymentNote}>
            Ask your barber about how you can pay in person by using Tap to Pay or a Card Reader.
          </Text>
        </View>

        {showCancelConfirm && (
          <View style={styles.cancelConfirmSection}>
            <Text style={styles.cancelTitle}>CANCEL APPOINTMENT</Text>
            <Text style={styles.cancelQuestion}>
              Are you sure you want to cancel this appointment?
            </Text>
            <View style={styles.cancelButtons}>
              <TouchableOpacity 
                style={styles.yesButton}
                onPress={confirmCancel}
              >
                <Text style={styles.yesButtonText}>YES</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.noButton}
                onPress={() => setShowCancelConfirm(false)}
              >
                <Text style={styles.noButtonText}>NO</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {status === "confirmed" && !showCancelConfirm && (
          <View style={styles.confirmationBanner}>
            <Check color="#4CAF50" size={24} />
            <Text style={styles.confirmationText}>
              Your appointment has been confirmed.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Check({ color, size }: { color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2 }}>
      <Text style={{ color: "#fff", fontSize: size * 0.6, textAlign: "center", lineHeight: size }}>✓</Text>
    </View>
  );
}

function Scissors({ color, size }: { color: string; size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Text style={{ color, fontSize: size }}>✂</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  providerSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  dateBox: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  dateDay: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#D4AF37",
    marginBottom: 4,
  },
  dateMonth: {
    fontSize: 12,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D4AF37",
    letterSpacing: 1,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF4444",
    letterSpacing: 1,
  },
  detailsSection: {
    padding: 20,
    gap: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 2,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D4AF37",
    letterSpacing: 1,
  },
  paymentSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    letterSpacing: 1,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#999",
  },
  paymentValue: {
    fontSize: 14,
    color: "#999",
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  orText: {
    marginHorizontal: 16,
    color: "#666",
    fontSize: 14,
  },
  paymentNote: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  cancelConfirmSection: {
    margin: 20,
    padding: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF4444",
  },
  cancelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  cancelQuestion: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 20,
    textAlign: "center",
  },
  cancelButtons: {
    flexDirection: "row",
    gap: 12,
  },
  yesButton: {
    flex: 1,
    backgroundColor: "#FF4444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  yesButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  noButton: {
    flex: 1,
    backgroundColor: "#333",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  noButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  confirmationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4CAF50",
    gap: 12,
  },
  confirmationText: {
    flex: 1,
    fontSize: 14,
    color: "#4CAF50",
  },
});