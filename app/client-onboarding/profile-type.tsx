import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Scissors, Store } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GLASS_STYLES, BORDER_RADIUS } from '@/constants/theme';

type ProfileType = 'client' | 'provider' | 'owner';

export default function ProfileTypeScreen() {
  const [selectedType, setSelectedType] = useState<ProfileType | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleProfileSelection = useCallback((type: ProfileType) => {
    if (isNavigating) return; // Prevent multiple navigations
    
    console.log('ProfileTypeScreen: Selected profile type', type);
    setSelectedType(type);
    setIsNavigating(true);
    
    // Navigation paths with proper error handling
    const navigationPaths = {
      client: '/client-onboarding/welcome',
      provider: '/provider-onboarding',
      owner: '/shop-owner-onboarding'
    };

    // Add a small delay to show the selection effect
    setTimeout(() => {
      try {
        const targetPath = navigationPaths[type];
        console.log('ProfileTypeScreen: Navigating to', targetPath);
        router.push(targetPath);
      } catch (error) {
        console.error('ProfileTypeScreen: Navigation failed', error);
        // Fallback to client onboarding if navigation fails
        router.push('/client-onboarding/welcome');
      } finally {
        setIsNavigating(false);
      }
    }, 200);
  }, [isNavigating]);

  const handleCreateAccount = useCallback(() => {
    if (isNavigating) return;
    
    const typeToUse = selectedType || 'client';
    console.log('ProfileTypeScreen: Creating account as', typeToUse);
    handleProfileSelection(typeToUse);
  }, [selectedType, isNavigating, handleProfileSelection]);

  const handleLoginTab = useCallback(() => {
    if (isNavigating) return;
    
    try {
      console.log('ProfileTypeScreen: Switching to login');
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('ProfileTypeScreen: Login navigation failed', error);
    }
  }, [isNavigating]);

  // Fallback background image
  const backgroundImage = { 
    uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80' 
  };

  const profileOptions: Array<{
    type: ProfileType;
    title: string;
    description: string;
    icon: React.ReactNode;
    testID: string;
  }> = [
    {
      type: 'client',
      title: 'CLIENT',
      description: 'Search providers and book appointments',
      icon: <User size={32} color={COLORS.white} />,
      testID: 'profile-type-client'
    },
    {
      type: 'provider',
      title: 'PROVIDER',
      description: 'Manage your business and clients',
      icon: <Scissors size={32} color={COLORS.white} />,
      testID: 'profile-type-provider'
    },
    {
      type: 'owner',
      title: 'SHOP OWNER',
      description: 'Manage your shops and providers',
      icon: <Store size={32} color={COLORS.white} />,
      testID: 'profile-type-owner'
    }
  ];

  return (
    <View style={styles.root} testID="client-onboarding-profile-type-root">
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent 
      />
      
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={() => console.warn('ProfileTypeScreen: Background image failed to load')}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <View style={[styles.tab, styles.activeTab]}>
                <Text style={[styles.tabText, styles.activeTabText]}>SIGN UP</Text>
              </View>
              <TouchableOpacity 
                style={styles.tab}
                onPress={handleLoginTab}
                disabled={isNavigating}
                testID="profile-type-login-tab"
              >
                <Text style={styles.tabText}>LOG IN</Text>
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              <Text style={styles.title}>SELECT PROFILE TYPE</Text>

              {/* Profile Options */}
              {profileOptions.map((option) => (
                <Pressable 
                  key={option.type}
                  style={({ pressed }) => [
                    styles.profileOption,
                    selectedType === option.type && styles.selectedOption,
                    pressed && styles.pressedOption,
                    isNavigating && styles.disabledOption
                  ]}
                  onPress={() => handleProfileSelection(option.type)}
                  disabled={isNavigating}
                  testID={option.testID}
                >
                  <View style={[
                    styles.iconContainer,
                    selectedType === option.type && styles.selectedIconContainer
                  ]}>
                    {option.icon}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.optionTitle,
                      selectedType === option.type && styles.selectedOptionTitle
                    ]}>
                      {option.title}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      selectedType === option.type && styles.selectedOptionDescription
                    ]}>
                      {option.description}
                    </Text>
                  </View>
                </Pressable>
              ))}

              {/* Create Account Button */}
              <Pressable 
                style={({ pressed }) => [
                  styles.createButton,
                  (!selectedType || isNavigating) && styles.disabledCreateButton,
                  pressed && styles.pressedCreateButton
                ]}
                onPress={handleCreateAccount}
                disabled={!selectedType || isNavigating}
                testID="profile-type-create-account"
              >
                <Text style={[
                  styles.createButtonText,
                  (!selectedType || isNavigating) && styles.disabledCreateButtonText
                ]}>
                  {isNavigating ? 'CREATING...' : 'CREATE ACCOUNT'}
                </Text>
              </Pressable>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
    ...GLASS_STYLES.card,
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.lightGray,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    letterSpacing: 1.5,
    fontFamily: FONTS.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  profileOption: {
    ...GLASS_STYLES.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    transform: [{ scale: 1.02 }],
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pressedOption: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  disabledOption: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconContainer: {
    backgroundColor: COLORS.white,
    transform: [{ scale: 1.1 }],
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  selectedOptionTitle: {
    color: COLORS.white,
  },
  optionDescription: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
  selectedOptionDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledCreateButton: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
  pressedCreateButton: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  createButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 1.5,
    fontFamily: FONTS.bold,
  },
  disabledCreateButtonText: {
    color: COLORS.gray,
  },
});