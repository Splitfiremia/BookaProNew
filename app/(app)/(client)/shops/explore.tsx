import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { Search, MapPin, Star, Users } from 'lucide-react-native';
import { mockShops, getShopRating, getShopProviders, getShopStartingPrice } from '@/mocks/shops';
import { router } from 'expo-router';

const filterOptions = [
  { id: 'nearby', label: 'Nearby' },
  { id: 'price', label: 'Price' },
  { id: 'available', label: 'Available' },
  { id: 'rating', label: 'Top Rated' },
];

export default function ShopsExploreScreen() {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('nearby');
  const insets = useSafeAreaInsets();

  const filteredShops = mockShops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         shop.description?.toLowerCase().includes(searchText.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (selectedFilter) {
      case 'rating':
        return getShopRating(shop.id).rating >= 4.5;
      case 'available':
        // Mock availability check - in real app would check actual availability
        return Math.random() > 0.5;
      default:
        return true;
    }
  });

  const renderShopCard = ({ item }: { item: typeof mockShops[0] }) => {
    const shopRating = getShopRating(item.id);
    const providers = getShopProviders(item.id);
    const startingPrice = getShopStartingPrice(item.id);

    return (
      <TouchableOpacity 
        style={styles.shopCard}
        onPress={() => router.push(`/(app)/(client)/shops/${item.id}`)}
        testID={`shop-card-${item.id}`}
      >
        <Image source={{ uri: item.image }} style={styles.shopImage} />
        
        <View style={styles.shopContent}>
          <View style={styles.shopHeader}>
            <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={12} color={COLORS.accent} fill={COLORS.accent} />
              <Text style={styles.rating}>
                {shopRating.rating > 0 ? shopRating.rating.toFixed(1) : 'New'}
              </Text>
              {shopRating.reviewCount > 0 && (
                <Text style={styles.reviewCount}>({shopRating.reviewCount})</Text>
              )}
            </View>
          </View>

          <View style={styles.shopLocation}>
            <MapPin size={12} color={COLORS.lightGray} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.address}, {item.city}
            </Text>
          </View>

          <Text style={styles.shopDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.shopFooter}>
            <View style={styles.providersInfo}>
              <Users size={14} color={COLORS.lightGray} />
              <Text style={styles.providersText}>
                {providers.length} provider{providers.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            {startingPrice > 0 && (
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>From </Text>
                <Text style={styles.priceValue}>${startingPrice}</Text>
              </View>
            )}
          </View>

          {/* Provider Preview */}
          {providers.length > 0 && (
            <View style={styles.providerPreview}>
              <View style={styles.providerPreviewContainer}>
                {providers.slice(0, 3).map((provider) => (
                  <View key={provider.id} style={styles.providerPreviewItem}>
                    <Image 
                      source={{ uri: provider.profileImage }} 
                      style={styles.providerPreviewAvatar} 
                    />
                    <Text style={styles.providerPreviewName} numberOfLines={1}>
                      {provider.name.split(' ')[0]}
                    </Text>
                  </View>
                ))}
                {providers.length > 3 && (
                  <View style={[styles.providerPreviewItem, { alignItems: 'center' }]}>
                    <View style={styles.moreProvidersIndicator}>
                      <Text style={styles.moreProvidersText}>+{providers.length - 3}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.headerTitle}>Explore Shops</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.lightGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search shops..."
            placeholderTextColor={COLORS.lightGray}
            value={searchText}
            onChangeText={setSearchText}
            testID="search-input"
          />
        </View>
      </View>

      {/* Filter Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter.id)}
            testID={`filter-${filter.id}`}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Shops List */}
      <FlatList
        data={filteredShops}
        renderItem={renderShopCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.shopsList}
        testID="shops-list"
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
  },
  filtersContainer: {
    paddingBottom: SPACING.md,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  filterButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
  },
  filterText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  filterTextActive: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
  resultsHeader: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  resultsCount: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  shopsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  shopCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  shopImage: {
    width: '100%',
    height: 160,
  },
  shopContent: {
    padding: SPACING.md,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  shopName: {
    flex: 1,
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginRight: SPACING.md,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 80,
  },
  rating: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
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
    marginBottom: SPACING.sm,
  },
  locationText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  shopDescription: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  shopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  providersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providersText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  priceValue: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
  },
  providerPreview: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    paddingTop: SPACING.sm,
  },
  providerPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  providerPreviewItem: {
    alignItems: 'center',
    marginRight: SPACING.sm,
    width: 44,
  },
  providerPreviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 4,
  },
  providerPreviewName: {
    color: COLORS.lightGray,
    fontSize: 10,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 12,
  },
  moreProvidersIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: SPACING.sm,
  },
  moreProvidersText: {
    color: COLORS.lightGray,
    fontSize: 9,
    fontFamily: FONTS.bold,
  },
});