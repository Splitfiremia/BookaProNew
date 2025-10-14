import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, Bell, Lock, CreditCard, HelpCircle, LogOut, Store, Users, Calendar, Plus, Edit, Trash2, DollarSign, Globe } from 'lucide-react-native';
import { useServices } from '@/providers/ServicesProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useShopManagement } from '@/providers/ShopManagementProvider';
import { performSignOut } from '@/utils/navigation';
import ServiceEditModal from '@/components/ServiceEditModal';
import { Service } from '@/models/database';
import { COLORS, FONTS, GLASS_STYLES } from '@/constants/theme';
import { CriticalErrorBoundary, FeatureErrorBoundary } from '@/components/SpecializedErrorBoundaries';
import { LoadingStateManager, SkeletonLoader, ListSkeleton } from '@/components/LoadingStateManager';
import { usePerformanceMonitor } from '@/hooks/useMemoization';


interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  usePerformanceMonitor('SettingsScreen');
  
  const router = useRouter();
  const { logout } = useAuth();
  
  // Safely get services context with fallbacks and loading check
  const servicesContext = useServices();
  console.log('SettingsScreen: Services context:', !!servicesContext);
  
  // Wait for services to initialize before destructuring
  const isServicesReady = servicesContext?.isInitialized ?? false;
  
  const {
    masterServices = [],
    sortedMasterServices = [],
    addMasterService,
    updateMasterService,
    deleteMasterService,
    loadingState = { isLoading: true, error: null, isEmpty: false },
    refreshServices,
    isInitialized = false,
  } = servicesContext || {};
  
  console.log('SettingsScreen: Master services count:', masterServices.length);
  const {
    shops,
    selectedShop,
    isLoading: shopLoading,
  } = useShopManagement();
  const [notifications, setNotifications] = useState(true);
  const [autoAcceptBookings, setAutoAcceptBookings] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);


  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = () => {
    // Prevent multiple sign out attempts
    if (isSigningOut) {
      console.log('Shop Owner Settings: Already signing out, ignoring request');
      return;
    }
    
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            setIsSigningOut(true);
            
            try {
              console.log('Shop Owner Settings: Starting sign out process');
              const result = await performSignOut(logout);
              
              if (!result.success) {
                console.error('Shop Owner Settings: Sign out failed:', result.error);
                Alert.alert(
                  "Sign Out Error",
                  result.error || 'Failed to sign out. Please try again.'
                );
              }
            } catch (error) {
              console.error('Shop Owner Settings: Unexpected sign out error:', error);
              Alert.alert(
                "Sign Out Error",
                'An unexpected error occurred. Please try again.'
              );
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Shop Owner Settings: Saving service:', serviceData.name);
      
      if (editingService && updateMasterService) {
        console.log('Shop Owner Settings: Updating existing service:', editingService.id);
        await updateMasterService(editingService.id, serviceData);
      } else if (addMasterService) {
        console.log('Shop Owner Settings: Adding new service');
        await addMasterService(serviceData);
      } else {
        console.error('Shop Owner Settings: Service functions not available');
        Alert.alert('Error', 'Service management functions are not available. Please try refreshing the app.');
        throw new Error('Service functions not available');
      }
      
      console.log('Shop Owner Settings: Service saved successfully');
    } catch (error) {
      console.error('Shop Owner Settings: Error saving service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save service';
      Alert.alert('Error', `Failed to save service: ${errorMessage}`);
      throw error;
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Shop Owner Settings: Deleting service:', serviceId);
              
              if (deleteMasterService) {
                await deleteMasterService(serviceId);
                console.log('Shop Owner Settings: Service deleted successfully');
              } else {
                console.error('Shop Owner Settings: Delete service function not available');
                Alert.alert('Error', 'Delete function is not available. Please try refreshing the app.');
              }
            } catch (error) {
              console.error('Shop Owner Settings: Error deleting service:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to delete service';
              Alert.alert('Error', `Failed to delete service: ${errorMessage}`);
            }
          },
        },
      ]
    );
  };

  const renderMasterServices = () => {
    // Show loading if services aren't initialized yet
    if (!isInitialized || loadingState.isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      );
    }
    
    // Show error state if there's an error
    if (loadingState.error) {
      return (
        <View style={styles.errorFallback}>
          <Text style={styles.errorText}>Failed to load services</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={refreshServices}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const servicesToRender = sortedMasterServices.length > 0 ? sortedMasterServices : masterServices.filter(s => s.isActive);
    
    if (servicesToRender.length === 0) {
      return (
        <View style={styles.emptyState}>
          <DollarSign size={48} color="#666" />
          <Text style={styles.emptyStateText}>No services added yet</Text>
          <Text style={styles.emptyStateSubtext}>Add your first service to get started</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={servicesToRender}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeatureErrorBoundary featureName="Service Item">
            <View style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceDetails}>
                  {item.baseDuration} min • ${item.basePrice}
                </Text>
                {item.description && (
                  <Text style={styles.serviceDescription}>{item.description}</Text>
                )}
              </View>
              <View style={styles.serviceActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEditingService(item);
                    setShowServiceModal(true);
                  }}
                >
                  <Edit size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteService(item.id)}
                >
                  <Trash2 size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          </FeatureErrorBoundary>
        )}
        scrollEnabled={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    );
  };

  const settingSections = [
    {
      title: 'Shop Management',
      items: [
        {
          id: 'shop-info',
          title: 'Shop Information',
          subtitle: 'Update shop details and hours',
          icon: Store,
          type: 'navigate' as const,
          onPress: () => {
            console.log('Shop Owner Settings: Navigating to shop settings');
            try {
              router.push('/shop-settings/new');
            } catch (error) {
              console.error('Shop Owner Settings: Navigation error:', error);
              Alert.alert('Navigation Error', 'Unable to navigate to shop settings. Please try again.');
            }
          },
        },
        {
          id: 'shop-services',
          title: 'Shop Services & Pricing',
          subtitle: 'Manage your master service list',
          icon: DollarSign,
          type: 'navigate' as const,
          onPress: () => {
            // Services are managed in this same screen - scroll to services section
            console.log('Services section is below');
          },
        },
        {
          id: 'team-permissions',
          title: 'Team Permissions',
          subtitle: 'Manage staff access levels',
          icon: Users,
          type: 'navigate' as const,
          onPress: () => {
            console.log('Shop Owner Settings: Navigating to team management');
            try {
              router.push('/(app)/(shop-owner)/(tabs)/team');
            } catch (error) {
              console.error('Shop Owner Settings: Navigation error:', error);
              Alert.alert('Navigation Error', 'Unable to navigate to team management. Please try again.');
            }
          },
        },
        {
          id: 'website-setup',
          title: 'Shop Website',
          subtitle: 'Set up your online presence',
          icon: Globe,
          type: 'navigate' as const,
          onPress: () => {
            console.log('Shop Owner Settings: Navigating to website builder');
            try {
              router.push('/(app)/(shop-owner)/(tabs)/website');
            } catch (error) {
              console.error('Shop Owner Settings: Navigation error:', error);
              Alert.alert('Navigation Error', 'Unable to navigate to website builder. Please try again.');
            }
          },
        },
        {
          id: 'booking-settings',
          title: 'Booking Settings',
          subtitle: 'Configure appointment rules',
          icon: Calendar,
          type: 'navigate' as const,
          onPress: () => {
            Alert.alert(
              'Booking Settings',
              'Configure appointment rules, booking windows, and cancellation policies.',
              [
                { text: 'OK' }
              ]
            );
          },
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          icon: Bell,
          type: 'toggle' as const,
          value: notifications,
          onPress: () => setNotifications(!notifications),
        },
        {
          id: 'auto-accept',
          title: 'Auto-Accept Bookings',
          subtitle: 'Automatically confirm new appointments',
          icon: Calendar,
          type: 'toggle' as const,
          value: autoAcceptBookings,
          onPress: () => setAutoAcceptBookings(!autoAcceptBookings),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'payment',
          title: 'Payment Methods',
          subtitle: 'Manage billing and payouts',
          icon: CreditCard,
          type: 'navigate' as const,
          onPress: () => {
            console.log('Shop Owner Settings: Navigating to payout settings');
            try {
              router.push('/payout-settings');
            } catch (error) {
              console.error('Shop Owner Settings: Navigation error:', error);
              Alert.alert('Navigation Error', 'Unable to navigate to payout settings. Please try again.');
            }
          },
        },
        {
          id: 'security',
          title: 'Security',
          subtitle: 'Password and authentication',
          icon: Lock,
          type: 'navigate' as const,
          onPress: () => {
            Alert.alert(
              'Security Settings',
              'Manage password, two-factor authentication, and account security.',
              [
                { text: 'OK' }
              ]
            );
          },
        },
      ],
    },
  ];

  const supportSection = {
    title: 'Support',
    items: [
      {
        id: 'help',
        title: 'Help Center',
        icon: HelpCircle,
        type: 'navigate' as const,
        onPress: () => {
          Alert.alert(
            'Help Center',
            'Contact support: support@bookerapp.com\nPhone: 1-800-BOOKER\nHours: Mon-Fri 9AM-6PM EST',
            [
              { text: 'OK' }
            ]
          );
        },
      },
      {
        id: 'signout',
        title: 'Sign Out',
        icon: LogOut,
        type: 'action' as const,
        onPress: handleSignOut,
      },
    ],
  };

  const renderSettingItem = (item: SettingItem) => {
    if (item.type === 'toggle') {
      return (
        <View key={item.id} style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <item.icon size={20} color="#666" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
            thumbColor="#fff"
            disabled={isSigningOut} // Disable all toggles during sign out
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingItem, (isSigningOut && item.id !== 'signout') && styles.disabledItem]}
        onPress={() => {
          console.log('Shop Owner Settings: Item pressed:', item.id);
          // Prevent actions while signing out
          if (isSigningOut) {
            console.log('Already signing out, ignoring tap');
            return;
          }
          try {
            if (item.onPress) {
              item.onPress();
            } else {
              console.warn('Shop Owner Settings: No onPress handler for item:', item.id);
            }
          } catch (error) {
            console.error('Shop Owner Settings: Error handling press:', error);
            Alert.alert('Error', 'Unable to perform this action');
          }
        }}
        disabled={isSigningOut}
        testID={`setting-item-${item.id}`}
        accessibilityLabel={item.title}
      >
        <View style={styles.settingItemLeft}>
          <item.icon size={20} color={item.id === 'signout' ? (isSigningOut ? '#999' : '#FF3B30') : '#666'} />
          <View style={styles.settingTextContainer}>
            <Text style={[
              styles.settingTitle,
              item.id === 'signout' && styles.signOutText,
              (isSigningOut && item.id === 'signout') && styles.disabledText
            ]}>
              {item.id === 'signout' && isSigningOut ? 'Signing Out...' : item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        {item.type === 'navigate' && (
          <ChevronRight size={20} color="#999" />
        )}
      </TouchableOpacity>
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView}>
      {settingSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map(renderSettingItem)}
          </View>
        </View>
      ))}
      
      {/* Shop Services & Pricing Section */}
      <View style={styles.section}>
        <View style={styles.servicesHeader}>
          <Text style={styles.sectionTitle}>Shop Services & Pricing</Text>
          <TouchableOpacity
            style={styles.addServiceButton}
            onPress={() => {
              setEditingService(null);
              setShowServiceModal(true);
            }}
          >
            <Plus size={20} color="#007AFF" />
            <Text style={styles.addServiceButtonText}>Add Service</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.servicesContent}>
          <FeatureErrorBoundary 
            featureName="Services Management"
            fallbackComponent={
              <View style={styles.errorFallback}>
                <Text style={styles.errorText}>Unable to load services</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={refreshServices}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            }
          >
            {renderMasterServices()}
          </FeatureErrorBoundary>
        </View>
      </View>
      
      {/* Support Section - Moved to bottom */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{supportSection.title}</Text>
        <View style={styles.sectionContent}>
          {supportSection.items.map(renderSettingItem)}
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
      
      {/* Service Edit Modal */}
      <ServiceEditModal
        visible={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setEditingService(null);
        }}
        service={editingService}
        onSave={handleSaveService}
        title={editingService ? 'Edit Service' : 'Add New Service'}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    textTransform: 'uppercase' as const,
    marginLeft: 20,
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  sectionContent: {
    ...GLASS_STYLES.card,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  disabledItem: {
    opacity: 0.5,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  signOutText: {
    color: '#FF3B30',
  },
  disabledText: {
    color: '#999',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 8,
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addServiceButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  servicesContent: {
    ...GLASS_STYLES.card,
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...GLASS_STYLES.card,
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.bold,
  },
  serviceDetails: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500' as const,
    marginBottom: 2,
    fontFamily: FONTS.regular,
  },
  serviceDescription: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    ...GLASS_STYLES.button,
    padding: 8,
  },
  errorFallback: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});