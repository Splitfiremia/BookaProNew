import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, FlatList, Modal } from "react-native";
import ImageWithFallback from '@/components/ImageWithFallback';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Star, MapPin, Clock, Calendar, Heart, UserPlus, MessageCircle, Share2, Grid3X3, Award, Scissors, Palette, Camera, Play, Eye, TrendingUp, Users, Trophy, Bookmark, Filter, ChevronDown, Image as ImageIcon, Video } from "lucide-react-native";
import { mockProviders } from "@/mocks/providers";
import { useSocial } from "@/providers/SocialProvider";
import { COLORS } from "@/constants/theme";

type TabType = 'services' | 'portfolio' | 'posts';

export default function ProviderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [portfolioFilter, setPortfolioFilter] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { isFollowing, followProvider, unfollowProvider, getProviderPosts } = useSocial();

  // Find provider from mock data
  const mockProvider = mockProviders.find(p => p.id === id);
  
  if (!mockProvider) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Provider not found</Text>
        </View>
      </View>
    );
  }

  // Enhanced provider data with social features
  const provider = {
    ...mockProvider,
    followerCount: 1247,
    followingCount: 89,
    postsCount: 156,
    isVerified: true,
  } as const;

  const handleBookAppointment = () => {
    router.push(`/(app)/(client)/booking/select-service?providerId=${id}`);
  };

  const handleFollowToggle = async () => {
    if (!id) return;
    
    try {
      if (isFollowing(id)) {
        await unfollowProvider(id);
      } else {
        await followProvider(id);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const handleServicePress = (serviceId: string) => {
    router.push(`/(app)/(client)/booking/select-service?providerId=${id}&serviceId=${serviceId}`);
  };

  const renderServicesTab = () => (
    <View style={styles.tabContent}>
      {provider.services?.map((service) => (
        <TouchableOpacity 
          key={service.id} 
          style={styles.serviceItem}
          onPress={() => handleServicePress(service.id)}
        >
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <View style={styles.serviceDetails}>
              <Clock size={14} color="#666" />
              <Text style={styles.serviceDetailText}>{service.duration}</Text>
            </View>
          </View>
          <Text style={styles.servicePrice}>${service.price}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPortfolioTab = () => {
    const portfolioData = provider.portfolio || [];
    const featuredWork = portfolioData.slice(0, 2);
    const recentWork = portfolioData.slice(2);
    
    const portfolioCategories = ['all', 'Before & After', 'Beard Work', 'Creative Work', 'Color Work'];
    const filteredPortfolio = portfolioFilter === 'all' 
      ? portfolioData 
      : portfolioData.filter(item => item.category === portfolioFilter);
    
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Enhanced Portfolio Stats */}
        <View style={styles.enhancedPortfolioStats}>
          <View style={styles.portfolioStatsRow}>
            <View style={styles.statItemEnhanced}>
              <View style={styles.statIconContainer}>
                <Award size={18} color="#FFB800" />
              </View>
              <Text style={styles.statValueEnhanced}>5+</Text>
              <Text style={styles.statLabelEnhanced}>Years Experience</Text>
            </View>
            <View style={styles.statItemEnhanced}>
              <View style={styles.statIconContainer}>
                <Users size={18} color="#007AFF" />
              </View>
              <Text style={styles.statValueEnhanced}>500+</Text>
              <Text style={styles.statLabelEnhanced}>Happy Clients</Text>
            </View>
            <View style={styles.statItemEnhanced}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={18} color="#10B981" />
              </View>
              <Text style={styles.statValueEnhanced}>98%</Text>
              <Text style={styles.statLabelEnhanced}>Satisfaction</Text>
            </View>
          </View>
          
          <View style={styles.portfolioStatsRow}>
            <View style={styles.statItemEnhanced}>
              <View style={styles.statIconContainer}>
                <ImageIcon size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.statValueEnhanced}>24</Text>
              <Text style={styles.statLabelEnhanced}>Portfolio Items</Text>
            </View>
            <View style={styles.statItemEnhanced}>
              <View style={styles.statIconContainer}>
                <Video size={18} color="#F59E0B" />
              </View>
              <Text style={styles.statValueEnhanced}>8</Text>
              <Text style={styles.statLabelEnhanced}>Video Demos</Text>
            </View>
            <View style={styles.statItemEnhanced}>
              <View style={styles.statIconContainer}>
                <Trophy size={18} color="#EF4444" />
              </View>
              <Text style={styles.statValueEnhanced}>3</Text>
              <Text style={styles.statLabelEnhanced}>Awards</Text>
            </View>
          </View>
        </View>
        
        {/* Professional Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Professional Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.achievementCard}>
              <Trophy size={24} color="#FFB800" />
              <Text style={styles.achievementTitle}>Master Stylist</Text>
              <Text style={styles.achievementSubtitle}>Certified 2023</Text>
            </View>
            <View style={styles.achievementCard}>
              <Award size={24} color="#007AFF" />
              <Text style={styles.achievementTitle}>Top Rated</Text>
              <Text style={styles.achievementSubtitle}>2024</Text>
            </View>
            <View style={styles.achievementCard}>
              <Palette size={24} color="#FF3B30" />
              <Text style={styles.achievementTitle}>Color Expert</Text>
              <Text style={styles.achievementSubtitle}>Specialized</Text>
            </View>
          </ScrollView>
        </View>
        
        {/* Specialties with Enhanced Design */}
        <View style={styles.specialtiesSection}>
          <Text style={styles.sectionTitle}>Specialties & Skills</Text>
          <View style={styles.specialtiesContainer}>
            {(provider.specialties || ['Haircuts', 'Color', 'Styling', 'Treatments']).map((specialty, index) => (
              <View key={index} style={styles.enhancedSpecialtyTag}>
                <Scissors size={12} color="#fff" />
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Portfolio Filter */}
        <View style={styles.portfolioFilterSection}>
          <View style={styles.portfolioFilterHeader}>
            <Text style={styles.sectionTitle}>Portfolio Gallery</Text>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={16} color="#007AFF" />
              <Text style={styles.filterButtonText}>{portfolioFilter === 'all' ? 'All Work' : portfolioFilter}</Text>
              <ChevronDown size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Featured Work with Enhanced Layout */}
        {featuredWork.length > 0 && (
          <View style={styles.portfolioSection}>
            <Text style={styles.subsectionTitle}>Featured Transformations</Text>
            <View style={styles.featuredGrid}>
              {featuredWork.map((item) => (
                <TouchableOpacity key={item.id} style={styles.enhancedFeaturedItem}>
                  <ImageWithFallback
                    source={{ uri: item.image }}
                    style={styles.featuredImage}
                    fallbackIcon="camera"
                  />
                  <View style={styles.enhancedFeaturedOverlay}>
                    <View style={styles.featuredHeader}>
                      <Text style={styles.featuredTitle}>{item.title}</Text>
                      <View style={styles.featuredActions}>
                        <TouchableOpacity style={styles.bookmarkButton}>
                          <Bookmark size={14} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.viewsContainer}>
                          <Eye size={12} color="#fff" />
                          <Text style={styles.viewsText}>1.2k</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.featuredDescription}>{item.description}</Text>
                    <View style={styles.featuredTags}>
                      <View style={styles.featuredTag}>
                        <Text style={styles.featuredTagText}>{item.category}</Text>
                      </View>
                      <View style={styles.featuredTag}>
                        <Text style={styles.featuredTagText}>Trending</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Enhanced Recent Work Grid */}
        {filteredPortfolio.length > 0 && (
          <View style={styles.portfolioSection}>
            <Text style={styles.subsectionTitle}>Recent Work ({filteredPortfolio.length} items)</Text>
            <View style={styles.enhancedPortfolioGrid}>
              {filteredPortfolio.map((item) => (
                <TouchableOpacity key={item.id} style={[styles.enhancedPortfolioItem, { width: (width - 60) / 2 }]}>
                  <ImageWithFallback
                    source={{ uri: item.image }}
                    style={styles.portfolioImage}
                    fallbackIcon="image"
                  />
                  <View style={styles.enhancedPortfolioOverlay}>
                    <View style={styles.portfolioHeader}>
                      <Text style={styles.portfolioTitle}>{item.title}</Text>
                      <TouchableOpacity style={styles.portfolioLikeButton}>
                        <Heart size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.portfolioDescription}>{item.description}</Text>
                    <View style={styles.portfolioFooter}>
                      <View style={styles.portfolioCategory}>
                        <Text style={styles.portfolioCategoryText}>{item.category}</Text>
                      </View>
                      <View style={styles.portfolioStats}>
                        <Eye size={10} color="#fff" />
                        <Text style={styles.portfolioStatsText}>156</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Enhanced Video Portfolio */}
        <View style={styles.portfolioSection}>
          <Text style={styles.subsectionTitle}>Video Transformations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3, 4].map((index) => (
              <TouchableOpacity key={index} style={styles.enhancedVideoItem}>
                <View style={styles.videoThumbnail}>
                  <View style={styles.videoPlaceholder}>
                    <Camera size={24} color="#ccc" />
                  </View>
                  <View style={styles.playButton}>
                    <Play size={16} color="#fff" fill="#fff" />
                  </View>
                  <View style={styles.videoDurationBadge}>
                    <Text style={styles.videoDurationText}>2:30</Text>
                  </View>
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>Hair Transformation #{index}</Text>
                  <View style={styles.videoStats}>
                    <View style={styles.videoStat}>
                      <Eye size={12} color="#666" />
                      <Text style={styles.videoStatText}>1.2k</Text>
                    </View>
                    <View style={styles.videoStat}>
                      <Heart size={12} color="#666" />
                      <Text style={styles.videoStatText}>89</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Client Testimonials in Portfolio */}
        <View style={styles.portfolioSection}>
          <Text style={styles.subsectionTitle}>Client Testimonials</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3].map((index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <View style={styles.testimonialAvatar}>
                    <Text style={styles.testimonialAvatarText}>J</Text>
                  </View>
                  <View style={styles.testimonialInfo}>
                    <Text style={styles.testimonialName}>John D.</Text>
                    <View style={styles.testimonialRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={12} color="#FFB800" fill="#FFB800" />
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={styles.testimonialText}>
                  &quot;Amazing work! Best haircut I&apos;ve ever had. Highly recommend!&quot;
                </Text>
                <Text style={styles.testimonialDate}>2 weeks ago</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  const renderPostsTab = () => {
    const posts = getProviderPosts((id as string) || '');
    return (
      <View style={styles.tabContent}>
        <FlatList
          data={posts.map(p => ({ id: p.id, imageUrl: p.imageUri, likes: p.likes }))}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.postItem, { width: (width - 60) / 3 }]}>
              <ImageWithFallback
                source={{ uri: item.imageUrl }}
                style={styles.postImage}
                fallbackIcon="image"
              />
              <View style={styles.postOverlay}>
                <Heart size={12} color="#fff" />
                <Text style={styles.postLikes}>{item.likes}</Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={(
            <View style={styles.emptyPostsContainer}>
              <Text style={styles.emptyPostsText}>No posts yet</Text>
            </View>
          )}
        />
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'services':
        return renderServicesTab();
      case 'portfolio':
        return renderPortfolioTab();
      case 'posts':
        return renderPostsTab();
      default:
        return renderServicesTab();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.profileImageContainer}>
            <ImageWithFallback
              source={{ uri: provider.profileImage || provider.image }}
              style={styles.profileImage}
              fallbackIcon="user"
            />
            {provider.isVerified && (
              <View style={styles.verifiedBadge}>
                <Star size={12} color="#fff" fill="#fff" />
              </View>
            )}
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.followButton, isFollowing(id || '') && styles.followingButton]}
              onPress={handleFollowToggle}
            >
              <UserPlus size={16} color={isFollowing(id || '') ? "#666" : "#fff"} />
              <Text style={[styles.followButtonText, isFollowing(id || '') && styles.followingButtonText]}>
                {isFollowing(id || '') ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={16} color="#333" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Provider Info */}
        <View style={styles.infoSection}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerCategory}>{provider.category}</Text>
          <Text style={styles.shopName}>{provider.shopName}</Text>
          
          {provider.about && (
            <Text style={styles.bioText}>{provider.about}</Text>
          )}
          
          <View style={styles.locationRow}>
            <MapPin size={14} color="#666" />
            <Text style={styles.locationText}>{provider.address}</Text>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsSection}>
          <View style={styles.statItemMain}>
            <Text style={styles.statNumber}>{provider.followerCount.toLocaleString()}</Text>
            <Text style={styles.statLabelMain}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItemMain}>
            <Text style={styles.statNumber}>{provider.postsCount}</Text>
            <Text style={styles.statLabelMain}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItemMain}>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFB800" fill="#FFB800" />
              <Text style={styles.statNumber}>{provider.rating}</Text>
            </View>
            <Text style={styles.statLabelMain}>({provider.reviewCount} reviews)</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'services' && styles.activeTabButton]}
            onPress={() => setActiveTab('services')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'services' && styles.activeTabButtonText]}>
              Services
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'portfolio' && styles.activeTabButton]}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'portfolio' && styles.activeTabButtonText]}>
              Portfolio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'posts' && styles.activeTabButton]}
            onPress={() => setActiveTab('posts')}
          >
            <Grid3X3 size={16} color={activeTab === 'posts' ? "#007AFF" : "#666"} />
            <Text style={[styles.tabButtonText, activeTab === 'posts' && styles.activeTabButtonText]}>
              Posts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Portfolio Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModalContainer}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filter Portfolio</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.filterModalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filterOptions}>
              {['all', 'Before & After', 'Beard Work', 'Creative Work', 'Color Work'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    portfolioFilter === category && styles.activeFilterOption
                  ]}
                  onPress={() => {
                    setPortfolioFilter(category);
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    portfolioFilter === category && styles.activeFilterOptionText
                  ]}>
                    {category === 'all' ? 'All Work' : category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Fixed Book Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
          <Calendar size={20} color="#fff" />
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#666',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  providerCategory: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  shopName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: COLORS.lightGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItemMain: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 2,
  },
  statLabelMain: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#007AFF',
  },
  tabContent: {
    backgroundColor: COLORS.background,
    minHeight: 400,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
    marginBottom: 4,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDetailText: {
    fontSize: 12,
    color: '#666',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },

  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  specialtiesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  portfolioSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  featuredGrid: {
    gap: 12,
  },
  featuredItem: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  featuredImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  featuredDescription: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 8,
  },
  featuredTags: {
    flexDirection: 'row',
    gap: 6,
  },
  featuredTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  portfolioActions: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  portfolioLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  portfolioLikesText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  videoItem: {
    width: 140,
    marginRight: 12,
  },
  videoThumbnail: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  videoPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  videoDuration: {
    fontSize: 10,
    color: '#666',
  },
  portfolioItem: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  portfolioImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  portfolioOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  portfolioTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  portfolioDescription: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.9,
  },
  postItem: {
    aspectRatio: 1,
    margin: 1,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  postOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  postLikes: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  bookButtonContainer: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPostsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyPostsText: {
    color: '#666',
  },
  enhancedPortfolioStats: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  portfolioStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItemEnhanced: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValueEnhanced: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabelEnhanced: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  achievementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  enhancedSpecialtyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  portfolioFilterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  portfolioFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  enhancedFeaturedItem: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  enhancedFeaturedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
  },
  featuredActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookmarkButton: {
    padding: 4,
  },
  enhancedPortfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  enhancedPortfolioItem: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  enhancedPortfolioOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  portfolioLikeButton: {
    padding: 2,
  },
  portfolioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  portfolioCategory: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  portfolioCategoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  portfolioStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  portfolioStatsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  enhancedVideoItem: {
    width: 160,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  videoInfo: {
    padding: 12,
  },
  videoStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  videoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoStatText: {
    fontSize: 12,
    color: '#666',
  },
  testimonialCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testimonialAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  testimonialRating: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  testimonialDate: {
    fontSize: 12,
    color: '#666',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterModalClose: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  filterOptions: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  activeFilterOption: {
    backgroundColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeFilterOptionText: {
    color: '#fff',
  },
});