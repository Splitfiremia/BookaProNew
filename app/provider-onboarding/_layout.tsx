import React from 'react';
import { Stack } from 'expo-router';
import { ProviderOnboardingProvider } from '@/providers/ProviderOnboardingProvider';

export default function ProviderOnboardingLayout() {
  return (
    <ProviderOnboardingProvider>
      <Stack screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: { backgroundColor: '#000000' },
        gestureEnabled: true,
        gestureDirection: 'horizontal'
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="provider-type" />
        <Stack.Screen name="personal-info" />
        <Stack.Screen name="service-address" />
        <Stack.Screen name="shop-search" />
        <Stack.Screen name="invite-owner" />
        <Stack.Screen name="services" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="availability" />
        <Stack.Screen name="summary" />
      </Stack>
    </ProviderOnboardingProvider>
  );
}