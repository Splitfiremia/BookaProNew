import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Users, Clock, CheckCircle } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { useWaitlist } from '@/providers/WaitlistProvider';

interface JoinWaitlistModalProps {
  visible: boolean;
  onClose: () => void;
  shopId: string;
  shopName: string;
}

export default function JoinWaitlistModal({ 
  visible, 
  onClose, 
  shopId, 
  shopName 
}: JoinWaitlistModalProps) {
  const { joinWaitlist, getEstimatedWaitTime, getUserWaitlistEntry } = useWaitlist();
  const [partySize, setPartySize] = useState<string>('1');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const existingEntry = getUserWaitlistEntry(shopId);
  const isAlreadyOnWaitlist = existingEntry && existingEntry.status === 'waiting';

  const handlePartySizeChange = (text: string) => {
    // Only allow numbers 1-20
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '' || (parseInt(numericValue) >= 1 && parseInt(numericValue) <= 20)) {
      setPartySize(numericValue);
    }
  };

  const getEstimatedWait = () => {
    const size = parseInt(partySize) || 1;
    return getEstimatedWaitTime(shopId, size);
  };

  const handleJoinWaitlist = async () => {
    const size = parseInt(partySize);
    
    if (!size || size < 1 || size > 20) {
      Alert.alert('Invalid Party Size', 'Please enter a party size between 1 and 20.');
      return;
    }

    setIsJoining(true);
    
    try {
      const entry = await joinWaitlist(shopId, size);
      
      if (entry) {
        console.log('Successfully joined waitlist:', entry);
        setShowSuccess(true);
        
        // Show success state for 2 seconds, then close
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      } else {
        Alert.alert('Error', 'Failed to join waitlist. Please try again.');
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      Alert.alert('Error', 'Failed to join waitlist. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    if (!isJoining && !showSuccess) {
      setPartySize('1');
      setShowSuccess(false);
      onClose();
    }
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (showSuccess) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.successContainer}>
            <CheckCircle size={64} color={COLORS.accent} />
            <Text style={styles.successTitle}>You're on the waitlist!</Text>
            <Text style={styles.successMessage}>
              We'll notify you when your table is ready
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Join Waitlist</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
              testID="close-waitlist-modal"
            >
              <X size={24} color={COLORS.lightGray} />
            </TouchableOpacity>
          </View>

          {/* Shop Info */}
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{shopName}</Text>
            <Text style={styles.shopDescription}>
              Join the waitlist and we'll notify you when a table becomes available
            </Text>
          </View>

          {isAlreadyOnWaitlist ? (
            /* Already on waitlist */
            <View style={styles.alreadyOnWaitlistContainer}>
              <View style={styles.statusBadge}>
                <Clock size={16} color={COLORS.accent} />
                <Text style={styles.statusText}>Already on waitlist</Text>
              </View>
              <Text style={styles.waitingInfo}>
                Party of {existingEntry.partySize} • Estimated wait: {formatWaitTime(existingEntry.estimatedWait)}
              </Text>
              <Text style={styles.joinedTime}>
                Joined at {new Date(existingEntry.joinTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          ) : (
            /* Join waitlist form */
            <>
              {/* Party Size Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Party Size</Text>
                <View style={styles.partySizeContainer}>
                  <Users size={20} color={COLORS.lightGray} />
                  <TextInput
                    style={styles.partySizeInput}
                    value={partySize}
                    onChangeText={handlePartySizeChange}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="1"
                    placeholderTextColor={COLORS.lightGray}
                    testID="party-size-input"
                  />
                  <Text style={styles.partySizeLabel}>
                    {parseInt(partySize) === 1 ? 'person' : 'people'}
                  </Text>
                </View>
              </View>

              {/* Estimated Wait Time */}
              {partySize && parseInt(partySize) > 0 && (
                <View style={styles.estimatedWaitContainer}>
                  <Clock size={16} color={COLORS.accent} />
                  <Text style={styles.estimatedWaitText}>
                    Estimated wait: {formatWaitTime(getEstimatedWait())}
                  </Text>
                </View>
              )}

              {/* Join Button */}
              <TouchableOpacity
                style={[
                  styles.joinButton,
                  (!partySize || parseInt(partySize) < 1 || isJoining) && styles.joinButtonDisabled
                ]}
                onPress={handleJoinWaitlist}
                disabled={!partySize || parseInt(partySize) < 1 || isJoining}
                testID="join-waitlist-button"
              >
                {isJoining ? (
                  <ActivityIndicator size="small" color={COLORS.background} />
                ) : (
                  <Text style={styles.joinButtonText}>Join Waitlist</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • You'll receive a notification when your table is ready
            </Text>
            <Text style={styles.infoText}>
              • Please arrive within 10 minutes of notification
            </Text>
            <Text style={styles.infoText}>
              • You can leave the waitlist at any time
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  shopInfo: {
    marginBottom: SPACING.xl,
  },
  shopName: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  shopDescription: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  alreadyOnWaitlistContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  statusText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.xs,
  },
  waitingInfo: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
  },
  joinedTime: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.sm,
  },
  partySizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  partySizeInput: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
    minWidth: 40,
    textAlign: 'center',
  },
  partySizeLabel: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
  },
  estimatedWaitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  estimatedWaitText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.sm,
  },
  joinButton: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  joinButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  joinButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
  },
  infoContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  infoText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
  },
  successContainer: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    margin: SPACING.xl,
    alignItems: 'center',
  },
  successTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  successMessage: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});