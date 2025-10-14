import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';

import { OnboardingNavigation } from '@/components/OnboardingNavigation';
import { useProviderOnboarding, ShopInfo } from '@/providers/ProviderOnboardingProvider';
import { Search, Store, Send } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES } from '@/constants/theme';

export default function ShopSearchScreen() {
  const router = useRouter();
  const { 
    currentStep, 
    totalSteps, 
    searchShops,
    setShopInfo,
    nextStep 
  } = useProviderOnboarding();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ShopInfo[]>([]);
  const [selectedShop, setSelectedShop] = useState<ShopInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  // Search for shops when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true);
      setShowNotFound(false);
      
      // Simulate network delay
      const timer = setTimeout(() => {
        const results = searchShops(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowNotFound(results.length === 0);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowNotFound(false);
    }
  }, [searchQuery, searchShops]);

  const handleSelectShop = (shop: ShopInfo) => {
    setSelectedShop(shop);
  };

  const handleContinueWithShop = () => {
    if (selectedShop) {
      setShopInfo(selectedShop.id, selectedShop.name, selectedShop.address);
      nextStep();
      router.replace('/provider-onboarding/services');
    }
  };

  const handleContinueAsIndependent = () => {
    nextStep();
    router.replace('/provider-onboarding/service-address');
  };

  const handleInviteOwner = () => {
    setShowInviteForm(true);
  };

  const handleSendInvite = () => {
    // In a real app, this would send an SMS or email to the shop owner
    console.log('Sending invite to:', ownerName, ownerPhone);
    
    // Continue as independent after sending invite
    handleContinueAsIndependent();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>GET STARTED</Text>

        </View>

        <View style={styles.content}>
          {!showInviteForm ? (
            <>
              <Text style={styles.question}>Search for your shop</Text>
              <Text style={styles.description}>
                Find the shop where you work to connect with them.
              </Text>

              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Search size={20} color={COLORS.lightGray} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Enter shop name or address"
                    placeholderTextColor="#666666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    testID="shop-search-input"
                  />
                </View>

                {isSearching && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Searching...</Text>
                  </View>
                )}

                {searchResults.length > 0 && (
                  <View style={styles.resultsContainer}>
                    {searchResults.map(shop => (
                      <TouchableOpacity
                        key={shop.id}
                        style={[
                          styles.shopItem,
                          selectedShop?.id === shop.id && styles.selectedShopItem
                        ]}
                        onPress={() => handleSelectShop(shop)}
                        testID={`shop-item-${shop.id}`}
                      >
                        <View style={styles.shopIconContainer}>
                          <Store size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.shopInfoContainer}>
                          <Text style={styles.shopName}>{shop.name}</Text>
                          <Text style={styles.shopAddress}>{shop.address}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {showNotFound && (
                  <View style={styles.notFoundContainer}>
                    <Text style={styles.notFoundText}>
                      No shops found matching your search.
                    </Text>
                    <View style={styles.notFoundActions}>
                      <TouchableOpacity
                        style={styles.notFoundAction}
                        onPress={handleInviteOwner}
                        testID="invite-owner-button"
                      >
                        <Send size={20} color={COLORS.primary} />
                        <Text style={styles.notFoundActionText}>Invite Shop Owner</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.notFoundAction}
                        onPress={handleContinueAsIndependent}
                        testID="continue-independent-button"
                      >
                        <Store size={20} color={COLORS.primary} />
                        <Text style={styles.notFoundActionText}>Continue as Independent</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.question}>Invite Shop Owner</Text>
              <Text style={styles.description}>
                Send an invitation to your shop owner to join the platform.
              </Text>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>OWNER NAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter shop owner's name"
                    placeholderTextColor="#666666"
                    value={ownerName}
                    onChangeText={setOwnerName}
                    testID="owner-name-input"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>OWNER PHONE NUMBER</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter shop owner's phone number"
                    placeholderTextColor="#666666"
                    value={ownerPhone}
                    onChangeText={setOwnerPhone}
                    keyboardType="phone-pad"
                    testID="owner-phone-input"
                  />
                </View>

                <View style={styles.messageContainer}>
                  <Text style={styles.messageLabel}>INVITATION MESSAGE</Text>
                  <View style={styles.messagePreview}>
                    <Text style={styles.messageText}>
                      Hi {ownerName || '[Owner Name]'}, I&apos;m setting up on BookerPro. Can you create a shop account so I can join? Here&apos;s the link: [App Store Link]
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {!showInviteForm ? (
          <OnboardingNavigation
            onBack={() => router.back()}
            onNext={handleContinueWithShop}
            nextDisabled={!selectedShop}
            testID="shop-search-navigation"
          />
        ) : (
          <View style={styles.inviteButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowInviteForm(false)}
              testID="cancel-invite-button"
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <GradientButton
              title="SEND INVITE"
              onPress={handleSendInvite}
              disabled={!ownerName || !ownerPhone}
              testID="send-invite-button"
              style={styles.sendInviteButton}
            />
          </View>
        )}
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
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  content: {
    flex: 1,
  },
  question: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    marginBottom: SPACING.xl,
    fontFamily: FONTS.regular,
  },
  searchContainer: {
    marginBottom: SPACING.xl,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    borderRadius: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  loadingText: {
    color: COLORS.lightGray,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
  },
  resultsContainer: {
    marginTop: SPACING.sm,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS_STYLES.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  selectedShopItem: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
  },
  shopIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.glass.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  shopInfoContainer: {
    flex: 1,
  },
  shopName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  shopAddress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.lightGray,
    fontFamily: FONTS.regular,
  },
  notFoundContainer: {
    ...GLASS_STYLES.card,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  notFoundText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.lightGray,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontFamily: FONTS.regular,
  },
  notFoundActions: {
    width: '100%',
  },
  notFoundAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}20`,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  notFoundActionText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold' as const,
    color: COLORS.input.label,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  input: {
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
  },
  messageContainer: {
    marginTop: SPACING.sm,
  },
  messageLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold' as const,
    color: COLORS.input.label,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  messagePreview: {
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
  },
  messageText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
  inviteButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.glass.background,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold' as const,
    fontFamily: FONTS.bold,
  },
  sendInviteButton: {
    flex: 2,
  },
});