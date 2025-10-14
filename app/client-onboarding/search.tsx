import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, MapPin, Filter, Star, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES, BORDER_RADIUS } from '@/constants/theme';

interface Shop {
  id: string;
  name: string;
  image: string;
  description: string;
  type: string;
}

interface Provider {
  id: string;
  name: string;
  image: string;
  rating: number;
  distance: string;
}

const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Legacy',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
    description: 'Uptown Barbershop',
    type: 'Barber Shop'
  },
  {
    id: '2',
    name: 'LATHER & FADE',
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400',
    description: 'Lather and Fade Barbershop',
    type: 'Barber Shop'
  },
  {
    id: '3',
    name: 'Elite Cuts',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    description: 'Modern Barbershop & Salon',
    type: 'Barber Shop'
  },
  {
    id: '4',
    name: "The Gentleman's Den",
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
    description: 'Traditional Barbershop',
    type: 'Barber Shop'
  },
  {
    id: '5',
    name: 'Fresh Cuts Studio',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
    description: 'Contemporary Hair Studio',
    type: 'Hair Salon'
  }
];

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Papi Kutz',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 5.0,
    distance: '0.6 Miles'
  }
];

const filterOptions = ['Nearby', 'Price', 'Available', 'Top Rated'];

export default function SearchScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const [searchText, setSearchText] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('Nearby');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const isShopSearch = type === 'shop';

  const filteredShops = mockShops.filter(shop => 
    shop.name.toLowerCase().includes(searchText.toLowerCase()) ||
    shop.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleNext = () => {
    if (isShopSearch && selectedShop) {
      console.log('Selected shop:', selectedShop.name);
    }
    router.push('/client-onboarding/payment' as any);
  };

  const handleShopSelect = (shop: Shop) => {
    if (!shop?.id?.trim()) return;
    if (!shop?.name?.trim()) return;
    if (shop.name.length > 100) return;
    const sanitizedShop = {
      ...shop,
      name: shop.name.trim(),
      description: shop.description.trim()
    };
    setSelectedShop(sanitizedShop);
  };

  if (isShopSearch) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=80' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <SafeAreaView style={styles.container}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                testID="search-back-button"
              >
                <ChevronLeft size={20} color="#CCCCCC" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>GET STARTED</Text>
                <View style={styles.progressDots}>
                  <View style={[styles.dot, styles.activeDot]} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>

              <View style={styles.shopSearchContent}>
                <Text style={styles.shopSearchTitle}>Search for your shop</Text>
                <Text style={styles.shopSearchSubtitle}>
                  Find the Shop where you work to connect with them.
                </Text>

                <View style={styles.shopSearchContainer}>
                  <Search size={20} color="#666666" />
                  <TextInput
                    style={styles.shopSearchInput}
                    placeholder="Enter shop name or address"
                    placeholderTextColor="#666666"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </View>

                {searchText.length > 0 && (
                  <ScrollView style={styles.shopResults} showsVerticalScrollIndicator={false}>
                    {filteredShops.map((shop) => (
                      <TouchableOpacity
                        key={shop.id}
                        style={[
                          styles.shopResultItem,
                          selectedShop?.id === shop.id && styles.shopResultItemSelected
                        ]}
                        onPress={() => {
                          if (!shop?.id?.trim()) return;
                          if (!shop?.name?.trim()) return;
                          if (shop.name.length > 100) return;
                          const sanitizedShop = {
                            ...shop,
                            name: shop.name.trim(),
                            description: shop.description.trim()
                          };
                          handleShopSelect(sanitizedShop);
                        }}
                      >
                        <Image source={{ uri: shop.image }} style={styles.shopResultImage} />
                        <View style={styles.shopResultInfo}>
                          <Text style={styles.shopResultName}>{shop.name}</Text>
                          <Text style={styles.shopResultDescription}>{shop.description}</Text>
                          <Text style={styles.shopResultType}>{shop.type}</Text>
                        </View>
                        {selectedShop?.id === shop.id && (
                          <View style={styles.selectedIndicator} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.shopSearchBottom}>
                <TouchableOpacity 
                  style={[
                    styles.continueButton,
                    (!selectedShop || searchText.length === 0) && styles.continueButtonDisabled
                  ]}
                  onPress={handleNext}
                  disabled={!selectedShop || searchText.length === 0}
                >
                  <Text style={[
                    styles.continueButtonText,
                    (!selectedShop || searchText.length === 0) && styles.continueButtonTextDisabled
                  ]}>
                    CONTINUE
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container}>
            <View style={styles.header}>
              <View style={styles.searchContainer}>
                <Search size={20} color="#666666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  placeholderTextColor="#666666"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              <TouchableOpacity style={styles.locationContainer}>
                <MapPin size={16} color="#666666" />
                <Text style={styles.locationText}>Houston, TX</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.filtersContainer}
              contentContainerStyle={styles.filtersContent}
            >
              <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
                <Filter size={16} color="#000000" />
              </TouchableOpacity>
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.filterButtonActive
                  ]}
                  onPress={() => {
                    if (!filter?.trim()) return;
                    if (filter.length > 100) return;
                    const sanitizedFilter = filter.trim();
                    setSelectedFilter(sanitizedFilter);
                  }}
                >
                  <Text style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive
                  ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SHOPS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {mockShops.map((shop) => (
                    <View key={shop.id} style={styles.shopCard}>
                      <Image source={{ uri: shop.image }} style={styles.shopImage} />
                      <View style={styles.shopInfo}>
                        <Text style={styles.shopName}>{shop.name}</Text>
                        <Text style={styles.shopDescription}>{shop.description}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PROVIDERS</Text>
                {mockProviders.map((provider) => (
                  <View key={provider.id} style={styles.providerCard}>
                    <View style={styles.providerHeader}>
                      <Image source={{ uri: provider.image }} style={styles.providerAvatar} />
                      <View style={styles.providerInfo}>
                        <Text style={styles.providerName}>{provider.name}</Text>
                        <Text style={styles.providerService}>Papi Kutz</Text>
                        <View style={styles.ratingContainer}>
                          <Star size={14} color="#FFD700" fill="#FFD700" />
                          <Text style={styles.rating}>{provider.rating} (5)</Text>
                          <Text style={styles.distance}>{provider.distance}</Text>
                        </View>
                      </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioContainer}>
                      {[1, 2, 3, 4].map((item) => (
                        <Image 
                          key={item}
                          source={{ uri: `https://images.unsplash.com/photo-150795191487${item}?w=200&q=80` }}
                          style={styles.portfolioImage} 
                        />
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.bottomSection}>
              <Text style={styles.bottomTitle}>SEARCH</Text>
              <Text style={styles.bottomDescription}>
                Quickly find top providers in your area with just a few taps.
              </Text>

              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleNext}
                testID="search-next-button"
              >
                <Text style={styles.nextButtonText}>NEXT</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  searchContainer: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.regular,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  filtersContainer: {
    paddingBottom: SPACING.md,
  },
  filtersContent: {
    paddingHorizontal: SPACING.lg,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginRight: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
    minHeight: 32,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: '500' as const,
    fontFamily: FONTS.regular,
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
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  shopCard: {
    width: 160,
    marginLeft: SPACING.lg,
    ...GLASS_STYLES.card,
    overflow: 'hidden',
  },
  shopImage: {
    width: '100%',
    height: 100,
  },
  shopInfo: {
    padding: SPACING.sm,
  },
  shopName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  shopDescription: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
  },
  providerCard: {
    ...GLASS_STYLES.card,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  providerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  providerService: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.xs,
    marginRight: SPACING.md,
    fontFamily: FONTS.regular,
  },
  distance: {
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
  bottomSection: {
    ...GLASS_STYLES.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  backButton: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginLeft: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginLeft: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  progressText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold' as const,
    marginBottom: SPACING.md,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  progressDots: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
  shopSearchContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  shopSearchTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 36,
    fontFamily: FONTS.bold,
  },
  shopSearchSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginBottom: SPACING.xl,
    lineHeight: 24,
    fontFamily: FONTS.regular,
  },
  shopSearchContainer: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  shopSearchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.regular,
  },
  shopResults: {
    flex: 1,
  },
  shopResultItem: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shopResultItemSelected: {
    borderColor: COLORS.primary,
  },
  shopResultImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  shopResultInfo: {
    flex: 1,
  },
  shopResultName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  shopResultDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    marginBottom: 2,
    fontFamily: FONTS.regular,
  },
  shopResultType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500' as const,
    fontFamily: FONTS.regular,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  shopSearchBottom: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  continueButton: {
    ...GLASS_STYLES.button.primary,
    paddingVertical: SPACING.md,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  continueButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  continueButtonTextDisabled: {
    color: COLORS.lightGray,
  },
  bottomTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold' as const,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  bottomDescription: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
    fontFamily: FONTS.regular,
  },
  nextButton: {
    ...GLASS_STYLES.button.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl * 2,
  },
  nextButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
});