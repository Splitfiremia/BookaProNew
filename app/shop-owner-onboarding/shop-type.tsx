import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopOwnerOnboarding, ShopServiceCategory } from '@/providers/ShopOwnerOnboardingProvider';
import { ChevronRight, Check, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShopType() {
  const router = useRouter();
  const { serviceCategories, setServiceCategories, nextStep } = useShopOwnerOnboarding();
  
  const [selectedCategories, setSelectedCategories] = useState<ShopServiceCategory[]>(serviceCategories);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (category: ShopServiceCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
    setError(null);
  };

  const handleNext = () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one service category');
      return;
    }
    
    setServiceCategories(selectedCategories);
    nextStep();
    router.push('/shop-owner-onboarding/service-list' as any);
  };

  const categories: ShopServiceCategory[] = ['Haircuts', 'Hair Styling', 'Nails', 'Tattoos', 'Other'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="shop-type-back-button"
        >
          <ChevronLeft size={20} color={COLORS.lightGray} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>What services are offered at your shop?</Text>
          <Text style={styles.subtitle}>
            Select all that apply. You can add specific services later.
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryCard,
                selectedCategories.includes(category) && styles.selectedCard
              ]}
              onPress={() => toggleCategory(category)}
              activeOpacity={0.8}
              testID={`category-${category.toLowerCase()}`}
            >
              <Text style={[
                styles.categoryText,
                selectedCategories.includes(category) && styles.selectedText
              ]}>
                {category}
              </Text>
              {selectedCategories.includes(category) && (
                <View style={styles.checkIcon}>
                  <Check size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
          testID="shop-type-next-button"
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.regular,
  },
  header: {
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  categoriesContainer: {
    marginBottom: SPACING.xl,
  },
  categoryCard: {
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.input.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundLight,
  },
  categoryText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '500' as const,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: 'bold' as const,
    fontFamily: FONTS.bold,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  button: {
    ...GLASS_STYLES.button.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.background,
    marginRight: SPACING.sm,
    fontFamily: FONTS.bold,
  },
});