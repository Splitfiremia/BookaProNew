import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Switch, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { Clock, Settings, Edit, LogOut, CreditCard, Search, Users, Award, Store, QrCode, Gift, HelpCircle, Banknote, X, Plus, DollarSign, Trash2, Camera, Image as ImageIcon, Video, Star, Eye, Heart, Grid3X3, Upload, Palette, Scissors } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useServices } from '@/providers/ServicesProvider';
import { performSignOut } from '@/utils/navigation';
import { router } from 'expo-router';
import ServiceEditModal from '@/components/ServiceEditModal';
import EditProviderModal from '@/components/EditProviderModal';
import { Service } from '@/models/database';

export default function ProviderProfileScreen() {
  const { logout, user } = useAuth();
  const {
    services,
    masterServices,
    serviceOfferings,
    addService,
    updateService,
    deleteService,
    addMasterService,
    updateMasterService,
    deleteMasterService,
    toggleServiceOffering,
    isLoading: servicesLoading,
  } = useServices();
  const insets = useSafeAreaInsets();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [activePortfolioTab, setActivePortfolioTab] = useState<'gallery' | 'stats' | 'achievements'>('gallery');

  const handleSignOut = async () => {
    // Prevent multiple sign out attempts
    if (isSigningOut) {
      console.log('Provider Profile: Already signing out, ignoring request');
      return;
    }

    setIsSigningOut(true);
    
    try {
      console.log('Provider Profile: Starting sign out process');
      const result = await performSignOut(logout);
      
      if (!result.success) {
        console.error('Provider Profile: Sign out failed:', result.error);
        setErrorMessage(result.error || 'Failed to sign out. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Provider Profile: Unexpected sign out error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsSigningOut(false);
    }
  };



  // Navigate to existing routes or show placeholder
  const navigateTo = (screen: string) => {
    if (!screen || screen.trim() === '') return;
    if (screen.length > 100) return;
    
    // Map to existing routes or show coming soon message
    const routeMap: { [key: string]: string } = {
      '/subscription': '/subscription', // Will show coming soon
      '/payments': '/complete-payment',
      '/discovery': '/discovery', // Will show coming soon
      '/bookings': '/schedule', // Navigate to existing schedule
      '/refer': '/refer', // Will show coming soon
      '/invite': '/invite', // Will show coming soon
      '/client-referral': '/client-referral', // Will show coming soon
      '/loyalty': '/loyalty', // Will show coming soon
      '/booth-rent': '/booth-rent', // Will show coming soon
      '/find-booth': '/find-booth', // Will show coming soon
      '/redeem': '/redeem', // Will show coming soon
      '/help': '/help', // Will show coming soon
    };
    
    const targetRoute = routeMap[screen];
    if (targetRoute) {
      // For routes that exist, navigate directly
      if (targetRoute === '/schedule' || targetRoute === '/complete-payment') {
        router.push(targetRoute as any);
      } else {
        // For non-existent routes, show coming soon message
        setErrorMessage('This feature is coming soon!');
        setShowErrorModal(true);
      }
    }
  };

  const isIndependentProvider = () => {
    return user?.mockData?.profile?.isIndependent !== false;
  };

  const handleSaveService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingService) {
        if (isIndependentProvider()) {
          await updateService(editingService.id, serviceData);
        } else {
          await updateMasterService(editingService.id, serviceData);
        }
      } else {
        if (isIndependentProvider()) {
          await addService(serviceData);
        } else {
          await addMasterService(serviceData);
        }
      }
    } catch (error) {
      console.error('Error saving service:', error);
      throw error;
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      if (isIndependentProvider()) {
        await deleteService(serviceId);
      } else {
        await deleteMasterService(serviceId);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleServiceOffering = async (serviceId: string, isOffered: boolean) => {
    try {
      await toggleServiceOffering(serviceId, isOffered);
    } catch (error) {
      console.error('Error toggling service offering:', error);
    }
  };

  const renderIndependentServices = () => {
    if (services.length === 0) {
      return (
        <View style={styles.emptyState}>
          <DollarSign size={48} color={COLORS.secondary} />
          <Text style={styles.emptyStateText}>No services added yet</Text>
          <Text style={styles.emptyStateSubtext}>Add your first service to start accepting bookings</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={services.filter(s => s.isActive)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
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
                <Edit size={16} color={COLORS.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteService(item.id)}
              >
                <Trash2 size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        scrollEnabled={false}
      />
    );
  };

  const renderShopBasedServices = () => {
    if (masterServices.length === 0) {
      return (
        <View style={styles.emptyState}>
          <DollarSign size={48} color={COLORS.secondary} />
          <Text style={styles.emptyStateText}>No shop services available</Text>
          <Text style={styles.emptyStateSubtext}>Contact your shop owner to add services</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={masterServices.filter(s => s.isActive)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const offering = serviceOfferings.find(o => o.serviceId === item.id);
          const isOffered = offering?.isOffered || false;
          
          return (
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
              <View style={styles.serviceToggle}>
                <Text style={styles.toggleLabel}>I offer this</Text>
                <Switch
                  value={isOffered}
                  onValueChange={(value) => handleToggleServiceOffering(item.id, value)}
                  trackColor={{ false: '#e0e0e0', true: COLORS.accent }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          );
        }}
        scrollEnabled={false}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="provider-profile-screen">


      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Error</Text>
              <TouchableOpacity onPress={() => setShowErrorModal(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity 
              style={[styles.modalButton, styles.fullWidthButton]} 
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with profile info */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.settingsIcon}>
              <Settings size={24} color={COLORS.accent} />
            </TouchableOpacity>
            <View style={styles.qrCodeContainer}>
              <QrCode size={24} color={COLORS.accent} />
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'Luis Martinez'}</Text>
            <Text style={styles.title}>Provider</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={() => {
              // Create a mock provider object for the EditProviderModal
              const mockProvider = {
                id: user?.id || 'temp-id',
                name: user?.name || 'Provider Name',
                email: user?.email || '',
                phone: user?.phone || '',
                profileImage: '',
                role: 'standard' as const,
                compensationModel: 'commission' as const,
                commissionRate: 60,
                boothRentFee: 200,
                isActive: true,
                shopId: '',
                joinedDate: new Date().toISOString(),
                totalEarnings: 0,
                clientCount: 0,
                occupancyRate: 0
              };
              
              // Show edit modal with provider data
              setEditingProvider(mockProvider);
              setShowEditProviderModal(true);
            }}
            testID="profile-image-container"
          >
            <Text style={styles.profileInitial}>L</Text>
            <View style={styles.editProfileBadge}>
              <Edit size={16} color={COLORS.background} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => {
              // Create a mock provider object for the EditProviderModal
              const mockProvider = {
                id: user?.id || 'temp-id',
                name: user?.name || 'Provider Name',
                email: user?.email || '',
                phone: user?.phone || '',
                profileImage: '',
                role: 'standard' as const,
                compensationModel: 'commission' as const,
                commissionRate: 60,
                boothRentFee: 200,
                isActive: true,
                shopId: '',
                joinedDate: new Date().toISOString(),
                totalEarnings: 0,
                clientCount: 0,
                occupancyRate: 0
              };
              
              // Show edit modal with provider data
              setEditingProvider(mockProvider);
              setShowEditProviderModal(true);
            }}
            testID="edit-profile-button"
          >
            <Text style={styles.editProfileText}>EDIT PROFILE</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription and Payments section */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/subscription')}>
            <View style={styles.menuIconContainer}>
              <Award size={24} color={COLORS.accent} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Subscription</Text>
              <View style={styles.menuSubtitleRow}>
                <Text style={styles.menuSubtitle}>Pro (Trial - 15 days)</Text>
                <View style={styles.notificationDot} />
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/payments')}>
            <View style={styles.menuIconContainer}>
              <CreditCard size={24} color={COLORS.accent} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Payments</Text>
              <View style={styles.menuSubtitleRow}>
                <Text style={styles.menuSubtitle}>Setup Required</Text>
                <View style={styles.notificationDot} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Discovery and Bookings section */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/discovery')}>
            <View style={styles.menuIconContainer}>
              <Search size={24} color={COLORS.accent} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Discovery</Text>
              <View style={styles.menuSubtitleRow}>
                <View style={styles.notificationDot} />
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/schedule')}>
            <View style={styles.menuIconContainer}>
              <Clock size={24} color={COLORS.accent} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Schedule</Text>
              <View style={styles.menuSubtitleRow}>
                <View style={styles.notificationDot} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Single row menu items */}
        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/refer')}>
          <View style={styles.singleMenuIconContainer}>
            <Users size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Refer a Provider</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/invite')}>
          <View style={styles.singleMenuIconContainer}>
            <Users size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Invite Your Clients</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/client-referral')}>
          <View style={styles.singleMenuIconContainer}>
            <Users size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Client Referral Program</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/loyalty')}>
          <View style={styles.singleMenuIconContainer}>
            <Award size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Client Loyalty Program</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/booth-rent')}>
          <View style={styles.singleMenuIconContainer}>
            <Banknote size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Booth Rent</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/find-booth')}>
          <View style={styles.singleMenuIconContainer}>
            <Store size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Find A New Booth</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/redeem')}>
          <View style={styles.singleMenuIconContainer}>
            <Gift size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Redeem Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.singleMenuItem} onPress={() => navigateTo('/help')}>
          <View style={styles.singleMenuIconContainer}>
            <HelpCircle size={24} color={COLORS.text} />
          </View>
          <Text style={styles.singleMenuText}>Help & Resources</Text>
        </TouchableOpacity>

        {/* Portfolio Section */}
        {user?.role === 'provider' && (
          <View style={styles.portfolioSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Portfolio</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowPortfolioModal(true)}
              >
                <Plus size={20} color={COLORS.accent} />
                <Text style={styles.addButtonText}>Manage</Text>
              </TouchableOpacity>
            </View>
            
            {/* Portfolio Stats */}
            <View style={styles.portfolioStatsContainer}>
              <View style={styles.portfolioStatItem}>
                <ImageIcon size={20} color={COLORS.accent} />
                <Text style={styles.portfolioStatNumber}>24</Text>
                <Text style={styles.portfolioStatLabel}>Photos</Text>
              </View>
              <View style={styles.portfolioStatItem}>
                <Video size={20} color={COLORS.accent} />
                <Text style={styles.portfolioStatNumber}>8</Text>
                <Text style={styles.portfolioStatLabel}>Videos</Text>
              </View>
              <View style={styles.portfolioStatItem}>
                <Eye size={20} color={COLORS.accent} />
                <Text style={styles.portfolioStatNumber}>1.2k</Text>
                <Text style={styles.portfolioStatLabel}>Views</Text>
              </View>
              <View style={styles.portfolioStatItem}>
                <Heart size={20} color={COLORS.accent} />
                <Text style={styles.portfolioStatNumber}>156</Text>
                <Text style={styles.portfolioStatLabel}>Likes</Text>
              </View>
            </View>
            
            {/* Recent Portfolio Items */}
            <View style={styles.recentPortfolioContainer}>
              <Text style={styles.recentPortfolioTitle}>Recent Work</Text>
              <View style={styles.portfolioGrid}>
                {[1, 2, 3, 4].map((item) => (
                  <TouchableOpacity key={item} style={styles.portfolioGridItem}>
                    <View style={styles.portfolioImagePlaceholder}>
                      <Camera size={24} color={COLORS.secondary} />
                    </View>
                    <View style={styles.portfolioItemOverlay}>
                      <View style={styles.portfolioItemStats}>
                        <Heart size={12} color="#fff" />
                        <Text style={styles.portfolioItemStatsText}>24</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Services Section */}
        {user?.role === 'provider' && (
          <View style={styles.servicesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Services</Text>
              {isIndependentProvider() && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setEditingService(null);
                    setShowServiceModal(true);
                  }}
                >
                  <Plus size={20} color={COLORS.accent} />
                  <Text style={styles.addButtonText}>Add Service</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {servicesLoading ? (
              <Text style={styles.loadingText}>Loading services...</Text>
            ) : (
              <View style={styles.servicesList}>
                {isIndependentProvider() ? renderIndependentServices() : renderShopBasedServices()}
              </View>
            )}
          </View>
        )}

        <TouchableOpacity 
          style={[styles.signOutButton, isSigningOut && styles.disabledSignOutButton]} 
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut size={20} color={isSigningOut ? '#999' : '#FFFFFF'} />
          <Text style={[styles.signOutText, isSigningOut && styles.disabledSignOutText]}>
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
        
        {/* Bottom spacing for safe scrolling */}
        <View style={styles.bottomSpacer} />
        
        {/* Portfolio Management Modal */}
        <Modal
          visible={showPortfolioModal}
          transparent
          animationType="slide"
        >
          <View style={styles.portfolioModalOverlay}>
            <View style={styles.portfolioModalContainer}>
              <View style={styles.portfolioModalHeader}>
                <Text style={styles.portfolioModalTitle}>Portfolio Management</Text>
                <TouchableOpacity onPress={() => setShowPortfolioModal(false)}>
                  <X size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              
              {/* Portfolio Tab Navigation */}
              <View style={styles.portfolioTabNavigation}>
                <TouchableOpacity 
                  style={[styles.portfolioTabButton, activePortfolioTab === 'gallery' && styles.activePortfolioTabButton]}
                  onPress={() => setActivePortfolioTab('gallery')}
                >
                  <Grid3X3 size={16} color={activePortfolioTab === 'gallery' ? COLORS.accent : COLORS.secondary} />
                  <Text style={[styles.portfolioTabButtonText, activePortfolioTab === 'gallery' && styles.activePortfolioTabButtonText]}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.portfolioTabButton, activePortfolioTab === 'stats' && styles.activePortfolioTabButton]}
                  onPress={() => setActivePortfolioTab('stats')}
                >
                  <Eye size={16} color={activePortfolioTab === 'stats' ? COLORS.accent : COLORS.secondary} />
                  <Text style={[styles.portfolioTabButtonText, activePortfolioTab === 'stats' && styles.activePortfolioTabButtonText]}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.portfolioTabButton, activePortfolioTab === 'achievements' && styles.activePortfolioTabButton]}
                  onPress={() => setActivePortfolioTab('achievements')}
                >
                  <Award size={16} color={activePortfolioTab === 'achievements' ? COLORS.accent : COLORS.secondary} />
                  <Text style={[styles.portfolioTabButtonText, activePortfolioTab === 'achievements' && styles.activePortfolioTabButtonText]}>Awards</Text>
                </TouchableOpacity>
              </View>
              
              {/* Portfolio Tab Content */}
              <ScrollView style={styles.portfolioTabContent}>
                {activePortfolioTab === 'gallery' && (
                  <View>
                    <TouchableOpacity style={styles.uploadButton}>
                      <Upload size={20} color={COLORS.accent} />
                      <Text style={styles.uploadButtonText}>Upload New Work</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.portfolioManagementGrid}>
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <TouchableOpacity key={item} style={styles.portfolioManagementItem}>
                          <View style={styles.portfolioManagementImagePlaceholder}>
                            <Camera size={20} color={COLORS.secondary} />
                          </View>
                          <View style={styles.portfolioManagementOverlay}>
                            <TouchableOpacity style={styles.portfolioEditButton}>
                              <Edit size={12} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.portfolioDeleteButton}>
                              <Trash2 size={12} color="#fff" />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.portfolioManagementStats}>
                            <View style={styles.portfolioManagementStatItem}>
                              <Heart size={10} color={COLORS.accent} />
                              <Text style={styles.portfolioManagementStatText}>24</Text>
                            </View>
                            <View style={styles.portfolioManagementStatItem}>
                              <Eye size={10} color={COLORS.accent} />
                              <Text style={styles.portfolioManagementStatText}>156</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                
                {activePortfolioTab === 'stats' && (
                  <View>
                    <View style={styles.analyticsCard}>
                      <Text style={styles.analyticsCardTitle}>Portfolio Performance</Text>
                      <View style={styles.analyticsMetrics}>
                        <View style={styles.analyticsMetricItem}>
                          <Text style={styles.analyticsMetricValue}>2.4k</Text>
                          <Text style={styles.analyticsMetricLabel}>Total Views</Text>
                          <Text style={styles.analyticsMetricChange}>+12% this week</Text>
                        </View>
                        <View style={styles.analyticsMetricItem}>
                          <Text style={styles.analyticsMetricValue}>342</Text>
                          <Text style={styles.analyticsMetricLabel}>Total Likes</Text>
                          <Text style={styles.analyticsMetricChange}>+8% this week</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.analyticsCard}>
                      <Text style={styles.analyticsCardTitle}>Top Performing Work</Text>
                      <View style={styles.topPerformingList}>
                        {[1, 2, 3].map((item) => (
                          <View key={item} style={styles.topPerformingItem}>
                            <View style={styles.topPerformingImagePlaceholder}>
                              <Camera size={16} color={COLORS.secondary} />
                            </View>
                            <View style={styles.topPerformingInfo}>
                              <Text style={styles.topPerformingTitle}>Hair Transformation #{item}</Text>
                              <View style={styles.topPerformingStats}>
                                <View style={styles.topPerformingStat}>
                                  <Eye size={12} color={COLORS.accent} />
                                  <Text style={styles.topPerformingStatText}>456</Text>
                                </View>
                                <View style={styles.topPerformingStat}>
                                  <Heart size={12} color={COLORS.accent} />
                                  <Text style={styles.topPerformingStatText}>89</Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
                
                {activePortfolioTab === 'achievements' && (
                  <View>
                    <View style={styles.achievementsCard}>
                      <Text style={styles.achievementsCardTitle}>Professional Achievements</Text>
                      <View style={styles.achievementsList}>
                        <View style={styles.achievementItem}>
                          <Award size={20} color="#FFB800" />
                          <View style={styles.achievementInfo}>
                            <Text style={styles.achievementTitle}>Master Stylist Certification</Text>
                            <Text style={styles.achievementDate}>Earned 2023</Text>
                          </View>
                        </View>
                        <View style={styles.achievementItem}>
                          <Scissors size={20} color="#007AFF" />
                          <View style={styles.achievementInfo}>
                            <Text style={styles.achievementTitle}>5+ Years Experience</Text>
                            <Text style={styles.achievementDate}>Since 2019</Text>
                          </View>
                        </View>
                        <View style={styles.achievementItem}>
                          <Palette size={20} color="#FF3B30" />
                          <View style={styles.achievementInfo}>
                            <Text style={styles.achievementTitle}>Color Specialist</Text>
                            <Text style={styles.achievementDate}>Certified 2022</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.achievementsCard}>
                      <Text style={styles.achievementsCardTitle}>Client Milestones</Text>
                      <View style={styles.milestonesList}>
                        <View style={styles.milestoneItem}>
                          <View style={styles.milestoneIcon}>
                            <Users size={16} color={COLORS.accent} />
                          </View>
                          <View style={styles.milestoneInfo}>
                            <Text style={styles.milestoneNumber}>500+</Text>
                            <Text style={styles.milestoneLabel}>Happy Clients</Text>
                          </View>
                        </View>
                        <View style={styles.milestoneItem}>
                          <View style={styles.milestoneIcon}>
                            <Star size={16} color={COLORS.accent} />
                          </View>
                          <View style={styles.milestoneInfo}>
                            <Text style={styles.milestoneNumber}>4.9</Text>
                            <Text style={styles.milestoneLabel}>Average Rating</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

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
        
        {/* Provider Edit Modal */}
        {editingProvider && (
          <EditProviderModal
            visible={showEditProviderModal}
            provider={editingProvider}
            onClose={() => {
              setShowEditProviderModal(false);
              setEditingProvider(null);
            }}
            onSave={(updatedProvider) => {
              console.log('Provider updated:', updatedProvider);
              // Here you would typically update the provider data in your state/backend
              setShowEditProviderModal(false);
            }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  fullWidthButton: {
    marginHorizontal: 0,
  },
  cancelButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmButton: {
    backgroundColor: '#DC2626',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#181611',
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding at bottom for safe scrolling
  },
  bottomSpacer: {
    height: 50, // Additional spacing at the very bottom
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingsIcon: {
    padding: 5,
  },
  qrCodeContainer: {
    padding: 5,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'center',
    position: 'relative',
  },
  profileInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editProfileBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  editProfileButton: {
    alignItems: 'center',
    marginTop: 5,
  },
  editProfileText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItem: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginHorizontal: 5,
  },
  menuIconContainer: {
    marginBottom: 10,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  menuSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuSubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  singleMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  singleMenuIconContainer: {
    marginRight: 16,
  },
  singleMenuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  signOutText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  servicesSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  servicesList: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    color: COLORS.secondary,
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
    color: COLORS.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  serviceDetails: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  serviceToggle: {
    alignItems: 'center',
    gap: 4,
  },
  toggleLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  portfolioSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  portfolioStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 16,
  },
  portfolioStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  portfolioStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  portfolioStatLabel: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  recentPortfolioContainer: {
    marginTop: 8,
  },
  recentPortfolioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  portfolioGridItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  portfolioImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioItemOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  portfolioItemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  portfolioItemStatsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  portfolioModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  portfolioModalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  portfolioModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  portfolioModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  portfolioTabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
  },
  portfolioTabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
    borderRadius: 8,
  },
  activePortfolioTabButton: {
    backgroundColor: COLORS.background,
  },
  portfolioTabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.secondary,
  },
  activePortfolioTabButtonText: {
    color: COLORS.accent,
  },
  portfolioTabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
  portfolioManagementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  portfolioManagementItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.card,
  },
  portfolioManagementImagePlaceholder: {
    width: '100%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  portfolioManagementOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  portfolioEditButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 4,
    borderRadius: 4,
  },
  portfolioDeleteButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    padding: 4,
    borderRadius: 4,
  },
  portfolioManagementStats: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    paddingVertical: 4,
  },
  portfolioManagementStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  portfolioManagementStatText: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '500',
  },
  analyticsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  analyticsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  analyticsMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analyticsMetricItem: {
    alignItems: 'center',
  },
  analyticsMetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 4,
  },
  analyticsMetricLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  analyticsMetricChange: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },
  topPerformingList: {
    gap: 12,
  },
  topPerformingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topPerformingImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topPerformingInfo: {
    flex: 1,
  },
  topPerformingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  topPerformingStats: {
    flexDirection: 'row',
    gap: 12,
  },
  topPerformingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topPerformingStatText: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  achievementsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  achievementsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  milestonesList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  milestoneItem: {
    alignItems: 'center',
    gap: 8,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneInfo: {
    alignItems: 'center',
  },
  milestoneNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  milestoneLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  disabledSignOutButton: {
    opacity: 0.6,
  },
  disabledSignOutText: {
    color: '#999',
  },
});