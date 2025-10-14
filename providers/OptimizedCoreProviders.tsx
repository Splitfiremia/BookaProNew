import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { COLORS } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Individual provider hooks - import only what's needed
import { useAuth } from './AuthProvider';
import { useAppointments } from './AppointmentProvider';
import { useServices } from './ServicesProvider';

// Core context for essential app functionality
interface CoreContextType {
  auth: ReturnType<typeof useAuth>;
  appointments: ReturnType<typeof useAppointments>;
  services: ReturnType<typeof useServices>;
  isReady: boolean;
}

// Create focused core context with initialization tracking
export const [CoreProvider, useCoreContext] = createContextHook(() => {
  console.log('CoreProvider: Initializing core context');
  
  const [isReady, setIsReady] = useState(false);
  const auth = useAuth();
  const appointments = useAppointments();
  const services = useServices();

  // Track when all providers are ready
  useEffect(() => {
    const authReady = auth?.isInitialized ?? false;
    const servicesReady = services?.isInitialized ?? false;
    const appointmentsReady = appointments?.isInitialized ?? false;
    
    const allReady = authReady && servicesReady && appointmentsReady;
    
    if (allReady && !isReady) {
      console.log('CoreProvider: All providers ready');
      setIsReady(true);
    }
  }, [auth?.isInitialized, services?.isInitialized, appointments?.isInitialized]);

  const coreContext: CoreContextType = {
    auth,
    appointments,
    services,
    isReady,
  };

  console.log('CoreProvider: Core context created, ready:', isReady);
  return coreContext;
});

// Individual hook exports for direct access
export const useAuthContext = () => useCoreContext().auth;
export const useAppointmentsContext = () => useCoreContext().appointments;
export const useServicesContext = () => useCoreContext().services;
export const useCoreReady = () => useCoreContext().isReady;

// Loading fallback component
function CoreProviderLoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading core services...</Text>
    </View>
  );
}

// Error fallback component
function CoreProviderErrorFallback() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load core services</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
  },
});

// Wrapper component with error boundary and loading state
interface CoreProviderWrapperProps {
  children: React.ReactNode;
  showLoadingUntilReady?: boolean;
}

export function CoreProviderWrapper({ children, showLoadingUntilReady = false }: CoreProviderWrapperProps) {
  return (
    <ErrorBoundary 
      fallback={<CoreProviderErrorFallback />}
      level="critical"
    >
      <React.Suspense fallback={<CoreProviderLoadingFallback />}>
        <CoreProvider>
          {showLoadingUntilReady ? (
            <CoreReadyGate>
              {children}
            </CoreReadyGate>
          ) : (
            children
          )}
        </CoreProvider>
      </React.Suspense>
    </ErrorBoundary>
  );
}

// Gate component that shows loading until all providers are ready
function CoreReadyGate({ children }: { children: React.ReactNode }) {
  const isReady = useCoreReady();
  
  if (!isReady) {
    return <CoreProviderLoadingFallback />;
  }
  
  return <>{children}</>;
}

// Feature-specific provider for shop management (lazy loaded)
export const ShopManagementProviderLazy = React.lazy(() => 
  import('./ShopManagementProvider').then(module => ({ 
    default: module.ShopManagementProvider 
  }))
);

// Feature-specific provider for social features (lazy loaded)
export const SocialProviderLazy = React.lazy(() => 
  import('./SocialProvider').then(module => ({ 
    default: module.SocialProvider 
  }))
);

// Utility hook for conditional provider loading
export function useFeatureProvider<T>(
  providerName: string,
  loader: () => Promise<T>,
  dependencies: any[] = []
): T | null {
  return useMemo(() => {
    // Only load if dependencies are met
    if (dependencies.some(dep => !dep)) {
      return null;
    }
    
    // In a real implementation, you'd use React.lazy or dynamic imports
    console.log(`Loading feature provider: ${providerName}`);
    return null;
  }, dependencies);
}