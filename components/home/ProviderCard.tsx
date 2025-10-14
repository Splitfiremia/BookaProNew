import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Star, CreditCard } from 'lucide-react-native';
import ImageWithFallback from '@/components/ImageWithFallback';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, GLASS_STYLES } from '@/constants/theme';
import { router } from 'expo-router';

interface Provider {
  id: string;
  name: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  distanceText: string;
  portfolio?: { id: string; image: string }[];
}

interface ProviderCardProps {
  provider: Provider;
}

// Memoized portfolio image component
const PortfolioImage = memo<{ item: { id: string; image: string } }>(({ item }) => (
  <ImageWithFallback
    source={{ uri: item.image }}
    style={styles.portfolioImage}
    fallbackIcon="camera"
  />
));

PortfolioImage.displayName = 'PortfolioImage';

export const ProviderCard = memo<ProviderCardProps>(({ provider }) => {
  console.log('ProviderCard: Rendering for provider', provider?.id || 'unknown');
  
  const handlePress = useCallback(() => {
    if (provider?.id) {
      router.push(`/(app)/(client)/provider/${provider.id}`);
    }
  }, [provider?.id]);

  const handleBookPress = useCallback(() => {
    if (provider?.id) {
      console.log('Book appointment for provider:', provider.id);
    }
  }, [provider?.id]);

  // Validate provider data after hooks
  if (!provider || !provider.id || !provider.name) {
    console.error('Invalid provider data:', provider);
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.providerCard}
      onPress={handlePress}
      testID={`provider-card-${provider.id}`}
    >
      <View style={styles.providerHeader}>
        <ImageWithFallback
          source={{ uri: provider.profileImage }}
          style={styles.providerAvatar}
          fallbackIcon="user"
        />
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerService}>Free Advice</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={COLORS.accent} fill={COLORS.accent} />
            <Text style={styles.rating}>{provider.rating} ({provider.reviewCount})</Text>
            <Text style={styles.distance}>{provider.distanceText}</Text>
          </View>
          <Text style={styles.location}>New York, NY • $</Text>
        </View>
      </View>
      
      {provider.portfolio && provider.portfolio.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.portfolioContainer}
          removeClippedSubviews={true}
          maxToRenderPerBatch={4}
          windowSize={4}
        >
          {provider.portfolio.slice(0, 4).map((portfolioItem) => (
            <PortfolioImage key={portfolioItem.id} item={portfolioItem} />
          ))}
        </ScrollView>
      )}
      
      <View style={styles.providerFooter}>
        <View style={styles.acceptsCards}>
          <CreditCard size={16} color={COLORS.white} />
          <Text style={styles.acceptsText}>Accepts cards</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookPress}>
          <Text style={styles.bookButtonText}>BOOK APPOINTMENT</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

ProviderCard.displayName = 'ProviderCard';

const styles = StyleSheet.create({
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
});