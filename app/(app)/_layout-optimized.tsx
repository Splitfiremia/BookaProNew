import React, { Suspense, lazy, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { OptimizedAuthProvider, useOptimizedAuth } from '@/providers/OptimizedAuthProvider';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load role-specific layouts
const ClientLayout = lazy(() => import('@/app/(app)/(client)/_layout'));
const ProviderLayout = lazy(() => import('@/app/(app)/(provider)/_layout'));
const ShopOwnerLayout = lazy(() => import('@/app/(app)/(shop-owner)/_layout'));

// Performance-optimized loading component
function OptimizedLoadingFallback({ message = 'Loading...' }: { message?: string }) {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>{message}{dots}</Text>
    </View>
  );
}

// Role-based layout selector
function RoleBasedLayout() {
  const { userRole, userId, isAuthenticated, isLoading, isInitialized } = useOptimizedAuth();
  const [isReady, setIsReady] = useState(false);
  
  // Initialize immediately to prevent hydration timeout
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated && isReady) {
      console.log('RoleBasedLayout: User not authenticated, redirecting');
      const timeoutId = setTimeout(() => {
        try {
          router.replace('/');
        } catch (error) {
          console.error('RoleBasedLayout: Redirect error:', error);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isInitialized, isLoading, isAuthenticated, isReady]);
  
  // Show loading while initializing
  if (!isReady || !isInitialized || isLoading) {
    return <OptimizedLoadingFallback message="Initializing app" />;
  }
  
  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated || !userRole || !userId) {
    return <OptimizedLoadingFallback message="Redirecting to login" />;
  }
  
  // Render role-specific layout with lazy loading
  const renderRoleLayout = () => {
    switch (userRole) {
      case 'client':
        return (
          <Suspense fallback={<OptimizedLoadingFallback message="Loading client dashboard" />}>
            <ClientLayout />
          </Suspense>
        );
      case 'provider':
        return (
          <Suspense fallback={<OptimizedLoadingFallback message="Loading provider dashboard" />}>
            <ProviderLayout />
          </Suspense>
        );
      case 'owner':
        return (
          <Suspense fallback={<OptimizedLoadingFallback message="Loading shop owner dashboard" />}>
            <ShopOwnerLayout />
          </Suspense>
        );
      default:
        console.error('RoleBasedLayout: Unknown user role:', userRole);
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unknown user role: {userRole}</Text>
          </View>
        );
    }
  };
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(client)" />
      <Stack.Screen name="(provider)" />
      <Stack.Screen name="(shop-owner)" />
      {renderRoleLayout()}
    </Stack>
  );
}

// Main optimized app layout
export default function OptimizedAppLayout() {
  console.log('OptimizedAppLayout: Rendering optimized app layout');
  
  return (
    <OptimizedAuthProvider>
      <ErrorBoundary
        level="critical"
        resetOnPropsChange={false}
        fallback={
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load application</Text>
          </View>
        }
      >
        <RoleBasedLayout />
      </ErrorBoundary>
    </OptimizedAuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.regular,
    marginTop: SPACING.lg,
    textAlign: 'center',
    minHeight: 28, // Prevent layout shift from dots
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});