import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Clock,
  Heart,
  Share,
  Users,
  Calendar,
  UserPlus
} from 'lucide-react-native';
import { getShopById, getShopProviders, getShopRating } from '@/mocks/shops';
import { useWaitlist } from '@/providers/WaitlistProvider';
import JoinWaitlistModal from '@/components/JoinWaitlistModal';

const tabOptions = [
  { id: 'overview', label: 'Overview' },
  { id: 'team', label: 'Team' },
  { id: 'services', label: 'Services' },
  { id: 'reviews', label: 'Reviews' },
];

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const { getUserWaitlistEntry, getShopWaitlist } = useWaitlist();

  const shop = getShopById(id!);
  const providers = getShopProviders(id!);
  const shopRating = getShopRating(id!);

  if (!shop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Shop not found</Text>
      </View>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${shop.phone}`);
  };

  const handleWebsite = () => {
    if (shop.website) {
      Linking.openURL(`https://${shop.website}`);
    }
  };

  const handleShare = () => {
    // In a real app, implement native sharing
    console.log('Share shop:', shop.name);
  };

  const handleProviderPress = (providerId: string) => {
    router.push(`/(app)/(client)/provider/${providerId}`);
  };

  const handleBookNow = () => {
    // Navigate to booking flow
    router.push(`/(app)/(client)/booking/select-service?shopId=${id}`);
  };

  const handleJoinWaitlist = () => {
    setShowWaitlistModal(true);
  };

  const userWaitlistEntry = getUserWaitlistEntry(id!);
  const shopWaitlist = getShopWaitlist(id!);
  const waitingCount = shopWaitlist.filter(entry => entry.status === 'waiting').length;

  const renderProviderCard = ({ item }: { item: typeof providers[0] }) => (
    <TouchableOpacity 
      style={styles.providerCard}
      onPress={() => handleProviderPress(item.id)}
      testID={`provider-card-${item.id}`}
    >
      <Image source={{ uri: item.profileImage }} style={styles.providerAvatar} />
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{item.name}</Text>
        <Text style={styles.providerCategory}>{item.category}</Text>
        <View style={styles.providerRating}>
          <Star size={12} color={COLORS.accent} fill={COLORS.accent} />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewText}>({item.reviewCount})</Text>
        </View>
        {item.specialties && (
          <Text style={styles.specialties} numberOfLines={1}>
            {item.specialties.join(', ')}
          </Text>
        )}
      </View>
      <View style={styles.providerActions}>
        <Text style={styles.startingPrice}>From ${item.startingPrice}</Text>
        <TouchableOpacity style={styles.providerBookButton}>
          <Text style={styles.providerBookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }: { item: any }) => (
    <View style={styles.serviceItem}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDuration}>{item.duration}</Text>
      </View>
      <Text style={styles.servicePrice}>${item.price}</Text>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{shop.description}</Text>
            
            <Text style={styles.sectionTitle}>Hours</Text>
            <View style={styles.hoursContainer}>
              {shop.hours.weeklyHours.map((dayHour) => (
                <View key={dayHour.day} style={styles.hourRow}>
                  <Text style={styles.dayText}>
                    {dayHour.day.charAt(0).toUpperCase() + dayHour.day.slice(1)}
                  </Text>
                  <Text style={styles.hourText}>
                    {dayHour.isEnabled 
                      ? `${dayHour.intervals[0]?.start} - ${dayHour.intervals[0]?.end}`
                      : 'Closed'
                    }
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.contactContainer}>
              <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                <Phone size={16} color={COLORS.accent} />
                <Text style={styles.contactText}>{shop.phone}</Text>
              </TouchableOpacity>
              {shop.website && (
                <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
                  <Globe size={16} color={COLORS.accent} />
                  <Text style={styles.contactText}>{shop.website}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case 'team':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Our Team ({providers.length})</Text>
            <FlatList
              data={providers}
              renderItem={renderProviderCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        );

      case 'services':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Services</Text>
            {providers.map((provider) => (
              <View key={provider.id} style={styles.providerServicesSection}>
                <Text style={styles.providerServicesTitle}>{provider.name}</Text>
                <FlatList
                  data={provider.services}
                  renderItem={renderServiceItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            ))}
          </View>
        );

      case 'reviews':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.reviewsPlaceholder}>
              <Text style={styles.placeholderText}>Reviews coming soon...</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image source={{ uri: shop.image }} style={styles.headerImage} />
        <View style={styles.headerOverlay}>
          <TouchableOpacity 
            style={[styles.headerButton, { top: insets.top + SPACING.sm }]}
            onPress={() => router.back()}
            testID="back-button"
          >
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={[styles.headerActions, { top: insets.top + SPACING.sm }]}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setIsFavorited(!isFavorited)}
              testID="favorite-button"
            >
              <Heart 
                size={24} 
                color={isFavorited ? COLORS.accent : COLORS.white}
                fill={isFavorited ? COLORS.accent : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleShare}
              testID="share-button"
            >
              <Share size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Shop Info */}
      <View style={styles.shopInfoContainer}>
        <View style={styles.shopHeader}>
          <View style={styles.shopTitleContainer}>
            <Text style={styles.shopName}>{shop.name}</Text>
            <View style={styles.shopRating}>
              <Star size={16} color={COLORS.accent} fill={COLORS.accent} />
              <Text style={styles.ratingValue}>
                {shopRating.rating > 0 ? shopRating.rating : 'New'}
              </Text>
              {shopRating.reviewCount > 0 && (
                <Text style={styles.reviewCount}>({shopRating.reviewCount})</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.shopLocation}>
          <MapPin size={14} color={COLORS.lightGray} />
          <Text style={styles.locationText}>
            {shop.address}, {shop.city}, {shop.state} {shop.zip}
          </Text>
        </View>

        <View style={styles.shopStats}>
          <View style={styles.statItem}>
            <Users size={16} color={COLORS.lightGray} />
            <Text style={styles.statText}>{providers.length} providers</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={16} color={COLORS.lightGray} />
            <Text style={styles.statText}>Open today</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabOptions.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab(tab.id)}
              testID={`tab-${tab.id}`}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.waitlistButton}
          onPress={handleJoinWaitlist}
          testID="join-waitlist-button"
        >
          <UserPlus size={20} color={COLORS.white} />
          <Text style={styles.waitlistButtonText}>
            {userWaitlistEntry && userWaitlistEntry.status === 'waiting' 
              ? 'On Waitlist' 
              : 'Join Waitlist'
            }
          </Text>
          {waitingCount > 0 && (
            <View style={styles.waitlistBadge}>
              <Text style={styles.waitlistBadgeText}>{waitingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBookNow}
          testID="book-now-button"
        >
          <Calendar size={20} color={COLORS.background} />
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* Waitlist Modal */}
      <JoinWaitlistModal
        visible={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
        shopId={id!}
        shopName={shop?.name || ''}
      />
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
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.regular,
  },
  headerImageContainer: {
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    position: 'absolute',
    right: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  shopInfoContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  shopTitleContainer: {
    flex: 1,
  },
  shopName: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  shopRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.xs,
  },
  reviewCount: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
  },
  shopLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  shopStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
  },
  tabsContainer: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  tabButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
  },
  tabTextActive: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
  },
  description: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  hoursContainer: {
    marginBottom: SPACING.xl,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  dayText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
  },
  hourText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
  },
  contactContainer: {
    gap: SPACING.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.sm,
  },
  providerCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  providerCategory: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
  },
  reviewText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
  },
  specialties: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
  },
  providerActions: {
    alignItems: 'flex-end',
  },
  startingPrice: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  providerBookButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  providerBookButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
  },
  providerServicesSection: {
    marginBottom: SPACING.xl,
  },
  providerServicesTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
  },
  serviceDuration: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  servicePrice: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
  },
  reviewsPlaceholder: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    gap: SPACING.md,
  },
  waitlistButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    position: 'relative',
  },
  waitlistButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.xs,
  },
  waitlistBadge: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  waitlistBadgeText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  bookButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.xs,
  },
});