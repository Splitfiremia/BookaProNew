import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ImageWithFallback from '@/components/ImageWithFallback';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

interface Shop {
  id: string;
  name: string;
  image: string;
  description: string;
  type: string;
}

interface ShopCardProps {
  shop: Shop;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <TouchableOpacity style={styles.shopCard}>
      <ImageWithFallback
        source={{ uri: shop.image }}
        style={styles.shopImage}
        fallbackIcon="image"
      />
      <View style={styles.shopInfo}>
        <Text style={styles.shopName} numberOfLines={2}>{shop.name}</Text>
        <Text style={styles.shopDescription} numberOfLines={1}>{shop.description}</Text>
        <Text style={styles.shopType}>{shop.type}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});