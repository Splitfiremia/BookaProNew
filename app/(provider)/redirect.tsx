import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function ProviderRedirect() {
  useEffect(() => {
    // Redirect to the schedule screen
    console.log('Provider redirect screen redirecting to provider schedule');
    router.replace('/(app)/(provider)/(tabs)/schedule');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});