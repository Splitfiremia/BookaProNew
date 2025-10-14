import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Share,
} from "react-native";
import {
  X,
  QrCode,
  Copy,
  Share2,
  Mail,
  MessageSquare,
  MapPin,
  Users,
  Calendar,
  Clock,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface QRCodeInviteModalProps {
  visible: boolean;
  onClose: () => void;
  shops: any[];
}

export default function QRCodeInviteModal({ visible, onClose, shops }: QRCodeInviteModalProps) {
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("stylist");
  const [inviteType, setInviteType] = useState<"qr" | "link">("qr");

  const inviteData = useMemo(() => {
    const shop = shops.find(s => s.id === selectedShop);
    const inviteCode = `INVITE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const inviteUrl = `https://app.example.com/join/${inviteCode}`;
    
    return {
      code: inviteCode,
      url: inviteUrl,
      shop: shop,
      role: selectedRole,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };
  }, [selectedShop, selectedRole, shops]);

  const handleCopyInvite = async () => {
    const inviteText = `Join our team at ${inviteData.shop?.name}!\n\nRole: ${selectedRole}\nInvite Code: ${inviteData.code}\nLink: ${inviteData.url}\n\nThis invite expires in 7 days.`;
    
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(inviteText);
        console.log("Invite copied to clipboard");
      } else {
        // For mobile, we'd use Clipboard from @react-native-clipboard/clipboard
        console.log("Invite copied:", inviteText);
        Alert.alert("Copied", "Invite details copied to clipboard");
      }
    } catch (error) {
      console.error("Failed to copy invite:", error);
    }
  };

  const handleShareInvite = async () => {
    const inviteText = `Join our team at ${inviteData.shop?.name}!\n\nRole: ${selectedRole}\nInvite Link: ${inviteData.url}\n\nDownload the app and use this link to join our team.`;
    
    try {
      if (Platform.OS !== 'web') {
        await Share.share({
          message: inviteText,
          url: inviteData.url,
          title: `Join ${inviteData.shop?.name}`,
        });
      } else {
        // Web fallback using Web Share API
        if (typeof navigator !== 'undefined' && 'share' in navigator) {
          try {
            // Use a simpler share object to avoid permission issues
            await (navigator as any).share({
              title: `Join ${inviteData.shop?.name}`,
              text: inviteText
              // Removed URL as it can cause permission issues in some browsers
            });
          } catch (shareError) {
            console.log('Web Share API error:', shareError);
            // Fallback to copy if sharing fails
            handleCopyInvite();
            Alert.alert(
              'Sharing Not Available',
              'Invite details copied to clipboard instead.',
              [{ text: 'OK' }]
            );
          }
        } else {
          // Fallback for browsers without Web Share API
          handleCopyInvite();
          Alert.alert(
            'Sharing Not Available',
            'Invite details copied to clipboard instead.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error("Failed to share invite:", error);
      // Fallback to copy
      handleCopyInvite();
    }
  };

  const handleEmailInvite = () => {
    const subject = `Join our team at ${inviteData.shop?.name}`;
    const body = `Hi there!\n\nYou've been invited to join our team at ${inviteData.shop?.name} as a ${selectedRole}.\n\nInvite Code: ${inviteData.code}\nJoin Link: ${inviteData.url}\n\nThis invite expires on ${new Date(inviteData.expiresAt).toLocaleDateString()}.\n\nWe look forward to having you on our team!`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    if (Platform.OS === 'web') {
      window.open(mailtoUrl);
    } else {
      // For mobile, we'd use Linking.openURL
      console.log("Opening email with:", { subject, body });
    }
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
          <Text style={styles.headerTitle}>Invite Team Member</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Invite Type Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invite Method</Text>
            <View style={styles.inviteTypeToggle}>
              <TouchableOpacity
                style={[
                  styles.inviteTypeButton,
                  inviteType === "qr" && styles.inviteTypeButtonActive,
                ]}
                onPress={() => setInviteType("qr")}
              >
                <QrCode size={20} color={inviteType === "qr" ? "#FFFFFF" : "#9CA3AF"} />
                <Text style={[
                  styles.inviteTypeText,
                  inviteType === "qr" && styles.inviteTypeTextActive,
                ]}>
                  QR Code
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.inviteTypeButton,
                  inviteType === "link" && styles.inviteTypeButtonActive,
                ]}
                onPress={() => setInviteType("link")}
              >
                <Share2 size={20} color={inviteType === "link" ? "#FFFFFF" : "#9CA3AF"} />
                <Text style={[
                  styles.inviteTypeText,
                  inviteType === "link" && styles.inviteTypeTextActive,
                ]}>
                  Share Link
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Shop Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Shop</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {shops.map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={[
                    styles.shopCard,
                    selectedShop === shop.id && styles.shopCardActive,
                  ]}
                  onPress={() => setSelectedShop(shop.id)}
                >
                  <View style={styles.shopCardContent}>
                    <Text style={[
                      styles.shopName,
                      selectedShop === shop.id && styles.shopNameActive,
                    ]}>
                      {shop.name}
                    </Text>
                    <View style={styles.shopMeta}>
                      <MapPin size={12} color="#9CA3AF" />
                      <Text style={styles.shopLocation}>
                        {shop.city}, {shop.state}
                      </Text>
                    </View>
                    <View style={styles.shopStats}>
                      <View style={styles.shopStat}>
                        <Users size={12} color="#9CA3AF" />
                        <Text style={styles.shopStatText}>
                          {shop.stylistCount || 0} stylists
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Role Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Role</Text>
            <View style={styles.roleSelection}>
              {["stylist", "manager", "receptionist"].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    selectedRole === role && styles.roleButtonActive,
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    selectedRole === role && styles.roleButtonTextActive,
                  ]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* QR Code Display */}
          {inviteType === "qr" && selectedShop && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QR Code Invite</Text>
              <View style={styles.qrContainer}>
                <LinearGradient
                  colors={["#3B82F6", "#1E40AF"]}
                  style={styles.qrCodePlaceholder}
                >
                  <QrCode size={120} color="#FFFFFF" />
                  <Text style={styles.qrCodeText}>QR Code</Text>
                  <Text style={styles.qrCodeSubtext}>Scan to join team</Text>
                </LinearGradient>
                
                <View style={styles.qrDetails}>
                  <Text style={styles.qrDetailTitle}>Invite Details</Text>
                  <View style={styles.qrDetailRow}>
                    <Text style={styles.qrDetailLabel}>Shop:</Text>
                    <Text style={styles.qrDetailValue}>{inviteData.shop?.name}</Text>
                  </View>
                  <View style={styles.qrDetailRow}>
                    <Text style={styles.qrDetailLabel}>Role:</Text>
                    <Text style={styles.qrDetailValue}>{selectedRole}</Text>
                  </View>
                  <View style={styles.qrDetailRow}>
                    <Text style={styles.qrDetailLabel}>Code:</Text>
                    <Text style={styles.qrDetailValue}>{inviteData.code}</Text>
                  </View>
                  <View style={styles.qrDetailRow}>
                    <Text style={styles.qrDetailLabel}>Expires:</Text>
                    <Text style={styles.qrDetailValue}>
                      {new Date(inviteData.expiresAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Share Actions */}
          {selectedShop && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Share Invite</Text>
              <View style={styles.shareActions}>
                <TouchableOpacity style={styles.shareButton} onPress={handleCopyInvite}>
                  <Copy size={20} color="#FFFFFF" />
                  <Text style={styles.shareButtonText}>Copy Details</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.shareButton} onPress={handleShareInvite}>
                  <Share2 size={20} color="#FFFFFF" />
                  <Text style={styles.shareButtonText}>Share Link</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.shareButton} onPress={handleEmailInvite}>
                  <Mail size={20} color="#FFFFFF" />
                  <Text style={styles.shareButtonText}>Send Email</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionsCard}>
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Select the shop and role for the new team member
                </Text>
              </View>
              
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Share the QR code or invite link with the candidate
                </Text>
              </View>
              
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  They&apos;ll scan the code or use the link to join your team
                </Text>
              </View>
              
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>
                  Review and approve their application in the team dashboard
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
  placeholder: {
    width: 40,
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
    marginBottom: 12,
  },
  inviteTypeToggle: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 4,
  },
  inviteTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },
  inviteTypeButtonActive: {
    backgroundColor: "#3B82F6",
  },
  inviteTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  inviteTypeTextActive: {
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
  shopCardContent: {
    alignItems: "flex-start",
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
    marginBottom: 8,
    gap: 4,
  },
  shopLocation: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  shopStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  shopStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shopStatText: {
    fontSize: 12,
    color: "#9CA3AF",
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
  qrContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  qrCodeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 8,
  },
  qrCodeSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  qrDetails: {
    width: "100%",
  },
  qrDetailTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  qrDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  qrDetailLabel: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  qrDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "right",
  },
  shareActions: {
    flexDirection: "row",
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  instructionsCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
  },
  instructionStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stepText: {
    fontSize: 14,
    color: "#9CA3AF",
    flex: 1,
    lineHeight: 20,
  },
});