import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { OnboardingButton } from '@/components/OnboardingButton';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useProviderOnboarding } from '@/providers/ProviderOnboardingProvider';
import { useShopOwnerOnboarding } from '@/providers/ShopOwnerOnboardingProvider';

export default function ResetOnboardingScreen() {
  const router = useRouter();
  const { resetOnboarding } = useOnboarding();
  const { resetOnboarding: resetProviderOnboarding } = useProviderOnboarding();
  const { resetOnboarding: resetShopOwnerOnboarding } = useShopOwnerOnboarding();

  const handleReset = () => {
    resetOnboarding();
    router.replace('/');
  };
  
  const handleResetProviderOnboarding = () => {
    resetProviderOnboarding();
    router.replace('/');
  };
  
  const handleResetShopOwnerOnboarding = () => {
    resetShopOwnerOnboarding();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Onboarding</Text>
        <Text style={styles.description}>
          This will reset the onboarding process and allow you to go through it again.
        </Text>
        <View style={styles.buttonContainer}>
          <OnboardingButton 
            title="Reset Client Onboarding" 
            onPress={handleReset}
            testID="reset-onboarding-button"
          />
          <View style={styles.spacer} />
          
          <OnboardingButton 
            title="Reset Provider Onboarding" 
            onPress={handleResetProviderOnboarding}
            testID="reset-provider-onboarding-button"
          />
          <View style={styles.spacer} />
          
          <OnboardingButton 
            title="Reset Shop Owner Onboarding" 
            onPress={handleResetShopOwnerOnboarding}
            testID="reset-shop-owner-onboarding-button"
          />
          <View style={styles.spacer} />
          
          <OnboardingButton 
            title="Go Back" 
            onPress={() => router.back()}
            isPrimary={false}
            testID="go-back-button"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  spacer: {
    height: 12,
  },
});