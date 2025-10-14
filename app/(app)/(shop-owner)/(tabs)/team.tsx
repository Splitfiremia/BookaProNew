import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Share,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  Filter,
  Edit,
  UserPlus,
  DollarSign,
  Calendar,
  Users,
  Trash2,
} from 'lucide-react-native';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';
import EditProviderModal, { Provider } from '@/components/EditProviderModal';
import { useTeamManagement } from '@/providers/TeamManagementProvider';

type FilterStatus = 'all' | 'active' | 'inactive';
type FilterRole = 'all' | 'admin' | 'standard' | 'associate';

export default function TeamManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [roleFilter, setRoleFilter] = useState<FilterRole>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
  const [providerToRemove, setProviderToRemove] = useState<Provider | null>(null);
  
  console.log('TeamManagementScreen: Component rendering');
  
  // Always call the hook, but handle errors gracefully
  const teamManagementContext = useTeamManagement();
  console.log('TeamManagementScreen: Context received:', teamManagementContext);
  
  // Always call useMemo, but provide fallback data
  const providers = useMemo(() => teamManagementContext?.providers || [], [teamManagementContext?.providers]);
  const updateProvider = teamManagementContext?.updateProvider || (() => {});
  const removeProvider = teamManagementContext?.removeProvider || (() => {});
  const generateInviteLink = teamManagementContext?.generateInviteLink || (() => '');
  
  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           provider.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && provider.isActive) ||
                           (statusFilter === 'inactive' && !provider.isActive);
      const matchesRole = roleFilter === 'all' || provider.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [providers, searchQuery, statusFilter, roleFilter]);
  
  // If context is not available, show error state
  if (!teamManagementContext) {
    console.error('TeamManagementScreen: useTeamManagement returned undefined');
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Error: Team management context not available</Text>
        <Text style={styles.errorText}>Context is undefined</Text>
      </View>
    );
  }

  const handleEditProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowEditModal(true);
  };

  const handleSaveProvider = (updatedProvider: Provider) => {
    updateProvider(updatedProvider);
  };

  const handleRemoveProvider = (provider: Provider) => {
    setProviderToRemove(provider);
    setShowRemoveModal(true);
  };

  const confirmRemoveProvider = () => {
    if (providerToRemove) {
      removeProvider(providerToRemove.id);
      setShowRemoveModal(false);
      setProviderToRemove(null);
    }
  };

  const cancelRemoveProvider = () => {
    setShowRemoveModal(false);
    setProviderToRemove(null);
  };

  const handleInviteProvider = async () => {
    const inviteLink = generateInviteLink();
    const message = `Join our team! Use this link to get started: ${inviteLink}`;
    
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && 'share' in navigator && typeof (navigator as any).canShare === 'function') {
          const shareData = {
            title: 'Team Invitation',
            text: message
          };
          
          if ((navigator as any).canShare(shareData)) {
            try {
              await (navigator as any).share(shareData);
            } catch (error: any) {
              if (error.name !== 'AbortError') {
                console.error('Error sharing invite link:', error);
                Linking.openURL(`mailto:?subject=${encodeURIComponent('Team Invitation')}&body=${encodeURIComponent(message)}`);
              }
            }
          } else {
            Linking.openURL(`mailto:?subject=${encodeURIComponent('Team Invitation')}&body=${encodeURIComponent(message)}`);
          }
        } else {
          Linking.openURL(`mailto:?subject=${encodeURIComponent('Team Invitation')}&body=${encodeURIComponent(message)}`);
        }
      } else {
        await Share.share({
          message: message,
          title: 'Team Invitation',
        });
      }
    } catch (error) {
      console.error('Error sharing invite link:', error);
    }
  };

  const getRoleColor = (role: Provider['role']) => {
    switch (role) {
      case 'admin': return '#FF6B35';
      case 'standard': return '#4CAF50';
      case 'associate': return '#2196F3';
      default: return COLORS.secondary;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#4CAF50' : '#F44336';
  };

  const renderProviderItem = ({ item }: { item: Provider }) => (
    <TouchableOpacity
      style={styles.providerCard}
      onPress={() => router.push(`/(app)/(shop-owner)/provider/${item.id}` as any)}
      testID={`provider-${item.id}`}
    >
      <View style={styles.providerHeader}>
        <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{item.name}</Text>
          <Text style={styles.providerEmail}>{item.email}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(item.role)}20` }]}>
              <Text style={[styles.roleBadgeText, { color: getRoleColor(item.role) }]}>
                {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.isActive)}20` }]}>
              <Text style={[styles.statusBadgeText, { color: getStatusColor(item.isActive) }]}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditProvider(item)}
            testID={`edit-provider-${item.id}`}
          >
            <Edit size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveProvider(item)}
            testID={`remove-provider-${item.id}`}
          >
            <Trash2 size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.providerStats}>
        <View style={styles.statItem}>
          <DollarSign size={16} color={COLORS.secondary} />
          <Text style={styles.statValue}>
            ${item.totalEarnings.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
        <View style={styles.statItem}>
          <Users size={16} color={COLORS.secondary} />
          <Text style={styles.statValue}>{item.clientCount}</Text>
          <Text style={styles.statLabel}>Clients</Text>
        </View>
        <View style={styles.statItem}>
          <Calendar size={16} color={COLORS.secondary} />
          <Text style={styles.statValue}>{item.occupancyRate}%</Text>
          <Text style={styles.statLabel}>Occupancy</Text>
        </View>
      </View>

      <View style={styles.compensationInfo}>
        <Text style={styles.compensationLabel}>
          {item.compensationModel === 'commission' 
            ? `${item.commissionRate}% Commission`
            : `$${item.boothRentFee}/week Booth Rent`
          }
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Team Management</Text>
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={handleInviteProvider}
          testID="invite-provider-button"
        >
          <UserPlus size={20} color="#fff" />
          <Text style={styles.inviteButtonText}>Invite</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search providers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
          testID="filter-button"
        >
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.filterOptions}>
              {(['all', 'active', 'inactive'] as FilterStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    statusFilter === status && styles.filterOptionActive
                  ]}
                  onPress={() => setStatusFilter(status)}
                  testID={`status-filter-${status}`}
                >
                  <Text style={[
                    styles.filterOptionText,
                    statusFilter === status && styles.filterOptionTextActive
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Role</Text>
            <View style={styles.filterOptions}>
              {(['all', 'admin', 'standard', 'associate'] as FilterRole[]).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.filterOption,
                    roleFilter === role && styles.filterOptionActive
                  ]}
                  onPress={() => setRoleFilter(role)}
                  testID={`role-filter-${role}`}
                >
                  <Text style={[
                    styles.filterOptionText,
                    roleFilter === role && styles.filterOptionTextActive
                  ]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Team Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{providers.filter(p => p.isActive).length}</Text>
          <Text style={styles.statTitle}>Active Providers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            ${providers.reduce((sum, p) => sum + p.totalEarnings, 0).toLocaleString()}
          </Text>
          <Text style={styles.statTitle}>Total Earnings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {Math.round(providers.reduce((sum, p) => sum + p.occupancyRate, 0) / providers.length)}%
          </Text>
          <Text style={styles.statTitle}>Avg Occupancy</Text>
        </View>
      </View>

      {/* Providers List */}
      <FlatList
        data={filteredProviders}
        renderItem={renderProviderItem}
        keyExtractor={(item) => item.id}
        style={styles.providersList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.providersListContent}
        testID="providers-list"
      />

      {/* Edit Provider Modal */}
      <EditProviderModal
        visible={showEditModal}
        provider={selectedProvider}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProvider(null);
        }}
        onSave={handleSaveProvider}
      />

      {/* Remove Provider Confirmation Modal */}
      {showRemoveModal && providerToRemove && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Trash2 size={24} color="#F44336" />
              <Text style={styles.modalTitle}>Remove Provider</Text>
            </View>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove <Text style={styles.providerNameHighlight}>{providerToRemove.name}</Text> from your team?
            </Text>
            <Text style={styles.modalWarning}>
              This will also remove all their appointments and cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelRemoveProvider}
                testID="cancel-remove-button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmRemoveButton}
                onPress={confirmRemoveProvider}
                testID="confirm-remove-button"
              >
                <Text style={styles.confirmRemoveButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.input,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  filterButton: {
    ...GLASS_STYLES.button,
    padding: 8,
  },
  filtersContainer: {
    ...GLASS_STYLES.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    ...GLASS_STYLES.button,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    ...GLASS_STYLES.card,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  providersList: {
    flex: 1,
  },
  providersListContent: {
    padding: 16,
  },
  providerCard: {
    ...GLASS_STYLES.card,
    padding: 16,
    marginBottom: 12,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  providerEmail: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  removeButton: {
    padding: 8,
  },
  providerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  compensationInfo: {
    paddingTop: 12,
    alignItems: 'center',
  },
  compensationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 50,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 24,
    maxWidth: 400,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  providerNameHighlight: {
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  modalWarning: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    ...GLASS_STYLES.button,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmRemoveButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmRemoveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});