import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';
import { performanceCache } from '@/services/PerformanceCacheService';
import { measureAsyncOperation, useDelayedOneTimeEffect } from '@/utils/performanceUtils';

// Import only essential providers
import { AuthProvider } from './AuthProvider';
import { WithSafeAreaDeviceProvider } from './DeviceProvider';
import { LazyProviders } from './LazyProviders';

// Create optimized QueryClient with performance monitoring
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnMount: false,
      refetchOnReconnect: false,
      networkMode: 'online',
    },
    mutations: {
      networkMode: 'online',
      retry: 1,
      onSuccess: (data, variables, context) => {
        // Invalidate related cache entries on mutations
        if (__DEV__) {
          console.log('OptimizedProviderTree: Mutation successful, considering cache invalidation');
        }
      },
    },
  },
});

// Add performance monitoring to QueryClient
if (__DEV__) {
  queryClient.setMutationDefaults(['user'], {
    onMutate: async () => {
      console.log('OptimizedProviderTree: User mutation started');
      return {};
    },
  });
}

// Error fallback for providers
function ProvidersErrorFallback() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Service Initialization Failed</Text>
      <Text style={styles.errorText}>
        Unable to initialize app services. Please restart the app.
      </Text>
    </View>
  );
}

// Core providers that must load immediately
interface CoreProvidersProps {
  children: React.ReactNode;
}

const CoreProviders = React.memo(({ children }: CoreProvidersProps) => {
  if (__DEV__) {
    console.log('CoreProviders: Rendering optimized core providers');
  }
  
  useDelayedOneTimeEffect(() => {
    const initStart = Date.now();
    
    measureAsyncOperation('core_providers_init', async () => {
      await performanceCache.preload('app', 'init', async () => {
        return { initialized: true, timestamp: Date.now() };
      });
      
      if (__DEV__) {
        console.log(`CoreProviders: Core providers initialized in ${Date.now() - initStart}ms`);
      }
    }).catch((error) => {
      if (__DEV__) {
        console.error('CoreProviders: Initialization error:', error);
      }
    });
  }, 2000);
  
  return (
    <QueryClientProvider client={queryClient}>
      <WithSafeAreaDeviceProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </WithSafeAreaDeviceProvider>
    </QueryClientProvider>
  );
});

CoreProviders.displayName = 'CoreProviders';

// Main optimized provider tree
interface OptimizedProviderTreeProps {
  children: React.ReactNode;
}

export default function OptimizedProviderTree({ children }: OptimizedProviderTreeProps) {
  if (__DEV__) {
    console.log('OptimizedProviderTree: Rendering optimized provider tree');
  }
  
  return (
    <ErrorBoundary 
      level="critical" 
      fallback={<ProvidersErrorFallback />}
    >
      <CoreProviders>
        <LazyProviders>
          {children}
        </LazyProviders>
      </CoreProviders>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  errorTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.lightGray,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
});