import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Clock, Users, CheckCircle, X, Bell } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, GLASS_STYLES } from '@/constants/theme';
import { useWaitlist, WaitlistEntry } from '@/providers/WaitlistProvider';

interface WaitlistManagementProps {
  shopId: string;
}

export default function WaitlistManagement({ shopId }: WaitlistManagementProps) {
  const { getShopWaitlist, markReady, markCancelled, updateEstimatedWait } = useWaitlist();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const waitlistEntries = getShopWaitlist(shopId);
  const waitingEntries = waitlistEntries.filter(entry => entry.status === 'waiting');
  const readyEntries = waitlistEntries.filter(entry => entry.status === 'ready');

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would refresh from the server
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleMarkReady = async (entryId: string, clientName: string) => {
    Alert.alert(
      'Mark as Ready',
      `Mark ${clientName} as ready to be seated?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Ready',
          style: 'default',
          onPress: async () => {
            try {
              await markReady(entryId);
              console.log('Marked entry as ready:', entryId);
            } catch (error) {
              console.error('Error marking entry as ready:', error);
              Alert.alert('Error', 'Failed to mark entry as ready');
            }
          },
        },
      ]
    );
  };

  const handleCancelEntry = async (entryId: string, clientName: string) => {
    Alert.alert(
      'Cancel Entry',
      `Remove ${clientName} from the waitlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await markCancelled(entryId);
              console.log('Cancelled entry:', entryId);
            } catch (error) {
              console.error('Error cancelling entry:', error);
              Alert.alert('Error', 'Failed to cancel entry');
            }
          },
        },
      ]
    );
  };

  const handleUpdateWaitTime = async (entryId: string, currentWait: number) => {
    const options = [
      { label: '10 min', value: 10 },
      { label: '15 min', value: 15 },
      { label: '20 min', value: 20 },
      { label: '30 min', value: 30 },
      { label: '45 min', value: 45 },
      { label: '60 min', value: 60 },
    ];

    Alert.alert(
      'Update Wait Time',
      'Select new estimated wait time:',
      [
        ...options.map(option => ({
          text: option.label,
          onPress: async () => {
            try {
              await updateEstimatedWait(entryId, option.value);
              console.log('Updated wait time for entry:', entryId, 'to:', option.value);
            } catch (error) {
              console.error('Error updating wait time:', error);
              Alert.alert('Error', 'Failed to update wait time');
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatJoinTime = (joinTime: string) => {
    const date = new Date(joinTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return COLORS.accent;
      case 'ready': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return COLORS.lightGray;
    }
  };

  const renderWaitlistEntry = ({ item }: { item: WaitlistEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <View style={styles.entryDetails}>
            <Users size={14} color={COLORS.lightGray} />
            <Text style={styles.partySize}>Party of {item.partySize}</Text>
            <Clock size={14} color={COLORS.lightGray} />
            <Text style={styles.joinTime}>Joined {formatJoinTime(item.joinTime)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.waitTimeContainer}>
        <TouchableOpacity
          style={styles.waitTimeButton}
          onPress={() => handleUpdateWaitTime(item.id, item.estimatedWait)}
          disabled={item.status !== 'waiting'}
        >
          <Clock size={16} color={COLORS.accent} />
          <Text style={styles.waitTimeText}>
            Est. wait: {formatWaitTime(item.estimatedWait)}
          </Text>
        </TouchableOpacity>
      </View>

      {item.status === 'waiting' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.readyButton]}
            onPress={() => handleMarkReady(item.id, item.clientName)}
            testID={`mark-ready-${item.id}`}
          >
            <CheckCircle size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Mark Ready</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelEntry(item.id, item.clientName)}
            testID={`cancel-${item.id}`}
          >
            <X size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'ready' && (
        <View style={styles.readyNotification}>
          <Bell size={16} color="#4CAF50" />
          <Text style={styles.readyNotificationText}>
            Client notified at {item.notifiedAt ? formatJoinTime(item.notifiedAt) : 'N/A'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Users size={48} color={COLORS.lightGray} />
      <Text style={styles.emptyStateTitle}>No one on the waitlist</Text>
      <Text style={styles.emptyStateText}>
        Clients can join the waitlist from your shop page
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Waitlist Management</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{waitingEntries.length}</Text>
            <Text style={styles.statLabel}>Waiting</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{readyEntries.length}</Text>
            <Text style={styles.statLabel}>Ready</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={waitlistEntries}
        renderItem={renderWaitlistEntry}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={waitlistEntries.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    ...GLASS_STYLES.card,
    marginBottom: 16,
  },
  title: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
  },
  stats: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
  },
  statLabel: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
  },
  entryCard: {
    ...GLASS_STYLES.card,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  entryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  partySize: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginRight: SPACING.sm,
  },
  joinTime: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  waitTimeContainer: {
    marginBottom: SPACING.sm,
  },
  waitTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.button,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
  },
  waitTimeText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  readyButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
  },
  readyNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.button,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  readyNotificationText: {
    color: '#4CAF50',
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyStateTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
});