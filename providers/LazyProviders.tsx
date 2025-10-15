import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Critical providers - load immediately
import { AppointmentProvider } from '@/providers/AppointmentProvider';
import { OnboardingProvider } from '@/providers/OnboardingProvider';

// Import non-critical providers directly (not lazy) to avoid export issues
import { ServicesProvider } from '@/providers/ServicesProvider';
import { PaymentProvider } from '@/providers/PaymentProvider';
import { SocialProvider } from '@/providers/SocialProvider';
import { WaitlistProvider } from '@/providers/WaitlistProvider';
import { TeamManagementProvider } from '@/providers/TeamManagementProvider';
import { ShopManagementProvider } from '@/providers/ShopManagementProvider';
import { AvailabilityProvider } from '@/providers/AvailabilityProvider';

const ProviderErrorFallback = React.memo(() => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Service Loading Failed</Text>
      <Text style={styles.errorText}>Unable to initialize app services. Please restart the app.</Text>
    </View>
  );
});

ProviderErrorFallback.displayName = 'ProviderErrorFallback';

const ProviderLoadingFallback = React.memo(({ stage }: { stage: string }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading {stage}...</Text>
    </View>
  );
});

ProviderLoadingFallback.displayName = 'ProviderLoadingFallback';

// Staggered provider loading stages
type LoadingStage = 'critical' | 'services' | 'social' | 'management' | 'complete';

interface StaggeredProvidersProps {
  children: React.ReactNode;
  stage: LoadingStage;
}

const StaggeredProviders = React.memo(({ children, stage }: StaggeredProvidersProps) => {
  // Define all provider combinations to avoid recursion and nesting issues
  const getProvidersForStage = useCallback((currentStage: LoadingStage) => {
    switch (currentStage) {
      case 'critical':
        return (
          <AppointmentProvider>
            <OnboardingProvider>
              {children}
            </OnboardingProvider>
          </AppointmentProvider>
        );

      case 'services':
        return (
          <ServicesProvider>
            <PaymentProvider>
              <AppointmentProvider>
                <OnboardingProvider>
                  {children}
                </OnboardingProvider>
              </AppointmentProvider>
            </PaymentProvider>
          </ServicesProvider>
        );

      case 'social':
        return (
          <SocialProvider>
            <WaitlistProvider>
              <ServicesProvider>
                <PaymentProvider>
                  <AppointmentProvider>
                    <OnboardingProvider>
                      {children}
                    </OnboardingProvider>
                  </AppointmentProvider>
                </PaymentProvider>
              </ServicesProvider>
            </WaitlistProvider>
          </SocialProvider>
        );

      case 'management':
        return (
          <TeamManagementProvider>
            <ShopManagementProvider>
              <SocialProvider>
                <WaitlistProvider>
                  <ServicesProvider>
                    <PaymentProvider>
                      <AppointmentProvider>
                        <OnboardingProvider>
                          {children}
                        </OnboardingProvider>
                      </AppointmentProvider>
                    </PaymentProvider>
                  </ServicesProvider>
                </WaitlistProvider>
              </SocialProvider>
            </ShopManagementProvider>
          </TeamManagementProvider>
        );

      case 'complete':
      default:
        return (
          <TeamManagementProvider>
            <ShopManagementProvider>
              <SocialProvider>
                <WaitlistProvider>
                  <ServicesProvider>
                    <PaymentProvider>
                      <AppointmentProvider>
                        <OnboardingProvider>
                          {children}
                        </OnboardingProvider>
                      </AppointmentProvider>
                    </PaymentProvider>
                  </ServicesProvider>
                </WaitlistProvider>
              </SocialProvider>
            </ShopManagementProvider>
          </TeamManagementProvider>
        );
    }
  }, [children]);

  return getProvidersForStage(stage);
});

StaggeredProviders.displayName = 'StaggeredProviders';

interface LazyProvidersProps {
  children: React.ReactNode;
}

export function LazyProviders({ children }: LazyProvidersProps) {
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('critical');
  const [isHydrated, setIsHydrated] = useState(false);
  const hasInitializedRef = useRef(false);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, []);
  
  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    
    hasInitializedRef.current = true;
    
    if (__DEV__) {
      console.log('LazyProviders: Initializing with staggered loading');
    }
    
    // Set hydrated immediately to show UI
    setIsHydrated(true);
    
    // Stagger provider loading with more realistic delays
    const stageTimings = [
      { stage: 'services' as LoadingStage, delay: 150 },
      { stage: 'social' as LoadingStage, delay: 300 },
      { stage: 'management' as LoadingStage, delay: 450 },
      { stage: 'complete' as LoadingStage, delay: 600 },
    ];
    
    stageTimings.forEach(({ stage, delay }) => {
      const timeout = setTimeout(() => {
        if (__DEV__) {
          console.log('LazyProviders: Progressing to stage:', stage);
        }
        setLoadingStage(stage);
      }, delay);
      timeoutRefs.current.push(timeout);
    });
  }, []);
  
  // Show loading during initial hydration
  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing App...</Text>
      </View>
    );
  }
  
  // Show stage-specific loading for better UX
  if (loadingStage !== 'complete') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          {loadingStage === 'critical' && 'Loading Core Services...'}
          {loadingStage === 'services' && 'Loading Payment Services...'}
          {loadingStage === 'social' && 'Loading Social Features...'}
          {loadingStage === 'management' && 'Loading Management Tools...'}
        </Text>
      </View>
    );
  }
  
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
      <StaggeredProviders stage={loadingStage}>
        {children}
      </StaggeredProviders>
    </ErrorBoundary>
  );
}

// Flat providers for client and provider layouts (no extra nesting)
export function FlatProviders({ children }: LazyProvidersProps) {
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  if (__DEV__) {
    console.log('FlatProviders: Rendering flat provider structure');
  }
  
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
      <AvailabilityProvider>
        <AppointmentProvider>
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </AppointmentProvider>
      </AvailabilityProvider>
    </ErrorBoundary>
  );
}

// Provider layouts for different user roles
export function ClientProviders({ children }: LazyProvidersProps) {
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  if (__DEV__) {
    console.log('ClientProviders: Rendering client provider structure');
  }
  
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
      <ServicesProvider>
        <PaymentProvider>
          <SocialProvider>
            <WaitlistProvider>
              <AppointmentProvider>
                <OnboardingProvider>
                  {children}
                </OnboardingProvider>
              </AppointmentProvider>
            </WaitlistProvider>
          </SocialProvider>
        </PaymentProvider>
      </ServicesProvider>
    </ErrorBoundary>
  );
}

export function ProviderProviders({ children }: LazyProvidersProps) {
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  if (__DEV__) {
    console.log('ProviderProviders: Rendering provider structure');
  }
  
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
      <AvailabilityProvider>
        <TeamManagementProvider>
          <ServicesProvider>
            <PaymentProvider>
              <SocialProvider>
                <AppointmentProvider>
                  <OnboardingProvider>
                    {children}
                  </OnboardingProvider>
                </AppointmentProvider>
              </SocialProvider>
            </PaymentProvider>
          </ServicesProvider>
        </TeamManagementProvider>
      </AvailabilityProvider>
    </ErrorBoundary>
  );
}

// Shop owner specific providers
export function ShopOwnerProviders({ children }: LazyProvidersProps) {
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  if (__DEV__) {
    console.log('ShopOwnerProviders: Rendering shop owner provider structure');
  }
  
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
      <ShopManagementProvider>
        <TeamManagementProvider>
          <ServicesProvider>
            <PaymentProvider>
              <SocialProvider>
                <WaitlistProvider>
                  <AppointmentProvider>
                    <OnboardingProvider>
                      {children}
                    </OnboardingProvider>
                  </AppointmentProvider>
                </WaitlistProvider>
              </SocialProvider>
            </PaymentProvider>
          </ServicesProvider>
        </TeamManagementProvider>
      </ShopManagementProvider>
    </ErrorBoundary>
  );
}

// Minimal providers for authentication screens
export function AuthProviders({ children }: LazyProvidersProps) {
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  if (__DEV__) {
    console.log('AuthProviders: Rendering auth provider structure');
  }
  
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
      <OnboardingProvider>
        {children}
      </OnboardingProvider>
    </ErrorBoundary>
  );
}

// Universal provider for unknown roles or fallback
export function UniversalProviders({ children }: LazyProvidersProps) {
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  if (__DEV__) {
    console.log('UniversalProviders: Rendering universal provider structure');
  }
  
  return (
    <ErrorBoundary fallback={<ProviderErrorFallback />}>
      <ServicesProvider>
        <PaymentProvider>
          <SocialProvider>
            <AppointmentProvider>
              <OnboardingProvider>
                {children}
              </OnboardingProvider>
            </AppointmentProvider>
          </SocialProvider>
        </PaymentProvider>
      </ServicesProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: COLORS.secondary,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});