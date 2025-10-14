import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, GLASS_STYLES } from '@/constants/theme';
import { MapPin, Filter, Star, Heart, Clock } from 'lucide-react-native';
import { mockProviders } from '@/mocks/providers';
import { router } from 'expo-router';
import { FeatureErrorBoundary } from '@/components/SpecializedErrorBoundaries';
import { SearchContainer } from '@/components/home/SearchContainer';
import { SearchSuggestions } from '@/components/home/SearchSuggestions';
import { ProviderCard } from '@/components/home/ProviderCard';



interface Shop {
  id: string;
  name: string;
  image: string;
  description: string;
  type: string;
}

const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Uptown And Fresh 183rd Street',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
    description: 'Ronaldinho barbershop With The Best.',
    type: 'Barber Shop'
  },
  {
    id: '2',
    name: 'Aura Barber & Beauty Studio',
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400',
    description: 'Premium cuts and styling services.',
    type: 'Barber & Beauty Studio'
  },
  {
    id: '3',
    name: 'Elite Cuts Barbershop',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    description: 'Traditional and modern barbering.',
    type: 'Barbershop'
  }
];

const filterOptions = [
  { id: 'filter', label: 'Filter', icon: Filter },
  { id: 'nearby', label: 'Nearby', icon: MapPin },
  { id: 'price', label: 'Price', icon: null },
  { id: 'available', label: 'Available', icon: Clock },
  { id: 'rating', label: 'Top Rated', icon: Star },
];

const searchSuggestions = [
  'Haircut',
  'Hair Color',
  'Highlights',
  'Balayage',
  'Beard Trim',
  'Manicure',
  'Pedicure',
  'Facial',
  'Massage',
  'Eyebrow Threading',
  'Hair Wash',
  'Blowout',
  'Hair Extensions',
  'Keratin Treatment',
  'Hair Styling',
];

const recentSearches = [
  'Barber near me',
  'Hair salon Manhattan',
  'Nail salon',
];



// Memoized filter bar component
const FilterBar = React.memo<{
  filterOptions: { id: string; label: string; icon: any }[];
  selectedFilter: string;
  onFilterSelect: (filterId: string) => void;
}>(({ filterOptions, selectedFilter, onFilterSelect }) => {
  console.log('FilterBar: Rendering');
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      {filterOptions.map((filter) => {
        const IconComponent = filter.icon;
        return (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive
            ]}
            onPress={() => onFilterSelect(filter.id)}
          >
            {IconComponent && (
              <IconComponent 
                size={14} 
                color={selectedFilter === filter.id ? COLORS.background : COLORS.lightGray} 
              />
            )}
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

FilterBar.displayName = 'FilterBar';

// Memoized shop card component
const ShopCard = React.memo<{ item: Shop }>(({ item }) => (
  <TouchableOpacity style={styles.shopCard}>
    <ImageWithFallback
      source={{ uri: item.image }}
      style={styles.shopImage}
      fallbackIcon="image"
    />
    <View style={styles.shopInfo}>
      <Text style={styles.shopName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.shopDescription} numberOfLines={1}>{item.description}</Text>
      <Text style={styles.shopType}>{item.type}</Text>
    </View>
  </TouchableOpacity>
));

ShopCard.displayName = 'ShopCard';

// Memoized header component
const HomeHeader = React.memo<{
  searchText: string;
  onSearchChange: (text: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  followedCount: number;
  insets: any;
}>(({ searchText, onSearchChange, onSearchFocus, onSearchBlur, followedCount, insets }) => {
  console.log('HomeHeader: Rendering');
  
  return (
    <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
      <SearchContainer
        searchText={searchText}
        onSearchChange={onSearchChange}
        onFocus={onSearchFocus}
        onBlur={onSearchBlur}
      />
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.locationContainer}>
          <MapPin size={16} color={COLORS.lightGray} />
          <Text style={styles.locationText}>Current Location</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.followingButton}
          onPress={() => router.push('/(app)/(client)/following')}
        >
          <Heart size={16} color={COLORS.accent} />
          {followedCount > 0 && (
            <View style={styles.followingBadge}>
              <Text style={styles.followingBadgeText}>{followedCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

HomeHeader.displayName = 'HomeHeader';

// Main home screen content component
const HomeScreenContent = React.memo(() => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('nearby');
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  
  // Mock followed count for now
  const followedCount = 0;

  // Simulate location permission check
  useEffect(() => {
    setLocationEnabled(false);
  }, []);

  // Enhanced autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!searchText.trim()) return [];
    
    const query = searchText.toLowerCase();
    const suggestions = [];
    
    // Add matching services
    const matchingServices = searchSuggestions.filter(service => 
      service.toLowerCase().includes(query)
    );
    suggestions.push(...matchingServices.slice(0, 3));
    
    // Add matching provider names
    const matchingProviders = mockProviders
      .filter(provider => provider.name.toLowerCase().includes(query))
      .map(provider => provider.name)
      .slice(0, 2);
    suggestions.push(...matchingProviders);
    
    // Add matching shop names
    const matchingShops = mockShops
      .filter(shop => shop.name.toLowerCase().includes(query))
      .map(shop => shop.name)
      .slice(0, 2);
    suggestions.push(...matchingShops);
    
    return [...new Set(suggestions)].slice(0, 6);
  }, [searchText]);

  // Filter data based on search and filters
  const filteredProviders = useMemo(() => {
    try {
      // Validate mockProviders exists and is an array
      if (!Array.isArray(mockProviders)) {
        console.error('mockProviders is not an array:', mockProviders);
        return [];
      }

      // Filter out providers with invalid data
      const validProviders = mockProviders.filter(provider => {
        if (!provider || typeof provider !== 'object') {
          console.warn('Invalid provider object:', provider);
          return false;
        }
        if (!provider.id || !provider.name) {
          console.warn('Provider missing required fields:', provider);
          return false;
        }
        // Ensure profileImage exists and is valid
        if (!provider.profileImage || typeof provider.profileImage !== 'string') {
          console.warn('Provider missing or invalid profileImage:', provider.id, provider.profileImage);
          // Don't filter out, just log warning - ImageWithFallback will handle it
        }
        return true;
      });

      let filtered = [...validProviders];
      
      // Apply search filter
      if (searchText.trim()) {
        const query = searchText.toLowerCase();
        filtered = filtered.filter(provider => 
          provider.name.toLowerCase().includes(query) ||
          provider.services?.some(service => 
            service.name.toLowerCase().includes(query)
          ) ||
          provider.specialties?.some(specialty => 
            specialty.toLowerCase().includes(query)
          ) ||
          provider.shopName?.toLowerCase().includes(query)
        );
      }
      
      // Apply additional filters
      switch (selectedFilter) {
        case 'rating':
          filtered = filtered.filter(provider => provider.rating >= 4.5);
          break;
        case 'available':
          // Filter for available providers (mock implementation)
          filtered = filtered.filter(provider => provider.rating > 4.0);
          break;
        case 'price':
          // Sort by rating as a proxy for price range
          filtered = filtered.sort((a, b) => a.rating - b.rating);
          break;
        default:
          break;
      }
      
      return filtered;
    } catch (error) {
      console.error('Error filtering providers:', error);
      return [];
    }
  }, [searchText, selectedFilter]);

  const filteredShops = useMemo(() => {
    if (!searchText.trim()) return mockShops;
    
    const query = searchText.toLowerCase();
    return mockShops.filter(shop => 
      shop.name.toLowerCase().includes(query) ||
      shop.type.toLowerCase().includes(query) ||
      shop.description.toLowerCase().includes(query)
    );
  }, [searchText]);

  const handleSearchFocus = useCallback(() => {
    setShowSearchSuggestions(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => setShowSearchSuggestions(false), 200);
  }, []);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    if (!suggestion?.trim()) return;
    if (suggestion.length > 100) return;
    const sanitized = suggestion.trim();
    setSearchText(sanitized);
    setShowSearchSuggestions(false);
  }, []);

  const renderShopCard = useCallback(({ item }: { item: Shop }) => (
    <ShopCard item={item} />
  ), []);



  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <HomeHeader
        searchText={searchText}
        onSearchChange={setSearchText}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        followedCount={followedCount}
        insets={insets}
      />

      <FilterBar
        filterOptions={filterOptions}
        selectedFilter={selectedFilter}
        onFilterSelect={setSelectedFilter}
      />

      {/* Quick Book Section */}
      <View style={styles.quickBookContainer}>
        <Text style={styles.quickBookTitle}>Book Your Next Cut</Text>
        <TouchableOpacity 
          style={styles.quickBookButton}
          onPress={() => router.push('/(app)/(client)/booking/select-service')}
          testID="quick-book-button"
        >
          <Text style={styles.quickBookButtonText}>BOOK NOW</Text>
        </TouchableOpacity>
      </View>

      <SearchSuggestions
        visible={showSearchSuggestions}
        searchText={searchText}
        autocompleteSuggestions={autocompleteSuggestions}
        recentSearches={recentSearches}
        popularServices={searchSuggestions}
        onSuggestionPress={handleSuggestionPress}
        onClose={() => setShowSearchSuggestions(false)}
      />

      {/* Content */}
      {!locationEnabled ? (
        // Location Unavailable State
        <View style={styles.locationUnavailableContainer}>
          <View style={styles.locationUnavailableContent}>
            <Text style={styles.locationUnavailableTitle}>LOCATION UNAVAILABLE</Text>
            <Text style={styles.locationUnavailableText}>
              Please allow theCut access to your location (when in use) in your device settings, or type in a location to search.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Results */}
          {searchText.trim() && (
            <View style={styles.searchResultsHeader}>
              <Text style={styles.searchResultsText}>
                {filteredProviders.length + filteredShops.length} results for &quot;{searchText}&quot;
              </Text>
            </View>
          )}
          
          {/* Shops Section */}
          {(!searchText.trim() || filteredShops.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SHOPS</Text>
              <FlatList
                data={filteredShops}
                renderItem={renderShopCard}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                windowSize={5}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.shopsContainer}
                ListEmptyComponent={
                  searchText.trim() ? (
                    <Text style={styles.noResultsText}>No shops found</Text>
                  ) : null
                }
              />
            </View>
          )}

          {/* Providers Section */}
          {(!searchText.trim() || filteredProviders.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                PROVIDERS {searchText.trim() && `(${filteredProviders.length})`}
              </Text>
              {filteredProviders.length > 0 ? (
                filteredProviders.slice(0, searchText.trim() ? filteredProviders.length : 3).map((provider) => {
                  try {
                    return <ProviderCard key={provider.id} provider={provider} />;
                  } catch (error) {
                    console.error('Error rendering provider card:', provider.id, error);
                    return null;
                  }
                })
              ) : (
                searchText.trim() ? (
                  <Text style={styles.noResultsText}>No providers found</Text>
                ) : (
                  <Text style={styles.noResultsText}>Failed to load providers</Text>
                )
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
});

HomeScreenContent.displayName = 'HomeScreenContent';

export default function HomeScreen() {
  console.log('HomeScreen: Rendering');
  
  return (
    <FeatureErrorBoundary featureName="HomeScreen">
      <Suspense fallback={
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
          <View style={styles.locationUnavailableContainer}>
            <Text style={styles.locationUnavailableTitle}>Loading...</Text>
          </View>
        </View>
      }>
        <HomeScreenContent />
      </Suspense>
    </FeatureErrorBoundary>
  );
}

HomeScreen.displayName = 'Home';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.card,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  followingButton: {
    position: 'relative',
    width: 40,
    height: 40,
    ...GLASS_STYLES.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  followingBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  followingBadgeText: {
    color: COLORS.background,
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  locationText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
  },
  filtersContainer: {
    paddingBottom: SPACING.md,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    whiteSpace: 'nowrap' as any,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(31, 41, 55, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.lightGray,
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginLeft: 4,
  },
  filterTextActive: {
    color: COLORS.background,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  shopsContainer: {
    paddingHorizontal: SPACING.md,
  },
  shopCard: {
    width: 200,
    marginRight: SPACING.md,
    ...GLASS_STYLES.card,
    overflow: 'hidden',
  },
  shopImage: {
    width: '100%',
    height: 120,
  },
  shopInfo: {
    padding: SPACING.md,
  },
  shopName: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  shopDescription: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
  },
  shopType: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  providerCard: {
    ...GLASS_STYLES.card,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  providerHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
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
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  providerService: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  rating: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
    marginRight: SPACING.md,
  },
  distance: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  location: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  portfolioContainer: {
    marginBottom: SPACING.md,
  },
  portfolioImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  providerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acceptsCards: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptsText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.xs,
  },
  bookButton: {
    ...GLASS_STYLES.button.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  bookButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  locationUnavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  locationUnavailableContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  locationUnavailableTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: 1,
  },
  locationUnavailableText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
  quickBookContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    ...GLASS_STYLES.card,
    marginHorizontal: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  quickBookTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  quickBookButton: {
    ...GLASS_STYLES.button.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    minWidth: 200,
  },
  quickBookButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    letterSpacing: 1,
  },

  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  suggestionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 120,
  },
  suggestionsContainer: {
    ...GLASS_STYLES.card,
    marginHorizontal: SPACING.md,
    maxHeight: 400,
  },
  suggestionSection: {
    paddingVertical: SPACING.md,
  },
  suggestionSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.lightGray,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  suggestionText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  searchResultsHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...GLASS_STYLES.card,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchResultsText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.lightGray,
  },
  noResultsText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.lightGray,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
});