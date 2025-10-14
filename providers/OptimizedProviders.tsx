import React, { Suspense, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { COLORS, FONTS } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Core providers that are always needed
import { useAuth } from './AuthProvider';
import { useAppointments } from './AppointmentProvider';
import { useServices } from './ServicesProvider';

// Feature providers that are conditionally loaded
const ShopManagementProvider = React.lazy(() => 
  import('./ShopManagementProvider').then(module => ({ 
    default: module.ShopManagementProvider 
  }))
);

const SocialProvider = React.lazy(() => 
  import('./SocialProvider').then(module => ({ 
    default: module.SocialProvider 
  }))
);

const WaitlistProvider = React.lazy(() => 
  import('./WaitlistProvider').then(module => ({ 
    default: module.WaitlistProvider 
  }))
);

const TeamManagementProvider = React.lazy(() => 
  import('./TeamManagementProvider').then(module => ({ 
    default: module.TeamManagementProvider 
  }))
);

// Core context for essential functionality
interface CoreContextType {
  auth: ReturnType<typeof useAuth>;
  appointments: ReturnType<typeof useAppointments>;
  services: ReturnType<typeof useServices>;
}

// Create optimized core context
export const [CoreProvider, useCoreContext] = createContextHook(() => {
  console.log('CoreProvider: Initializing core context');
  
  const auth = useAuth();
  const appointments = useAppointments();
  const services = useServices();

  return useMemo(() => ({
    auth,
    appointments,
    services,
  }), [auth, appointments, services]);
});

// Individual hook exports for direct access
export const useAuthContext = () => useCoreContext().auth;
export const useAppointmentsContext = () => useCoreContext().appointments;
export const useServicesContext = () => useCoreContext().services;

// Loading components
function CoreLoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading core services...</Text>
    </View>
  );
}

function FeatureLoadingFallback() {
  return (
    <View style={styles.featureLoadingContainer}>
      <Text style={styles.featureLoadingText}>Loading feature...</Text>
    </View>
  );
}

// Error fallback components
function CoreErrorFallback() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load core services</Text>
    </View>
  );
}

function FeatureErrorFallback() {
  return (
    <View style={styles.featureErrorContainer}>
      <Text style={styles.featureErrorText}>Feature temporarily unavailable</Text>
    </View>
  );
}

// Core provider wrapper
interface CoreProviderWrapperProps {
  children: React.ReactNode;
}

export function CoreProviderWrapper({ children }: CoreProviderWrapperProps) {
  return (
    <ErrorBoundary 
      fallback={<CoreErrorFallback />}
      level="critical"
      resetOnPropsChange={true}
    >
      <Suspense fallback={<CoreLoadingFallback />}>
        <CoreProvider>
          {children}
        </CoreProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

// Feature provider wrapper for conditional loading
interface FeatureProviderWrapperProps {
  children: React.ReactNode;
  userRole?: string;
  features?: string[];
}

export function FeatureProviderWrapper({ 
  children, 
  userRole, 
  features = [] 
}: FeatureProviderWrapperProps) {
  const shouldLoadShopManagement = userRole === 'owner' || features.includes('shop-management');
  const shouldLoadSocial = features.includes('social');
  const shouldLoadWaitlist = features.includes('waitlist');
  const shouldLoadTeamManagement = userRole === 'owner' || features.includes('team-management');

  return (
    <ErrorBoundary 
      fallback={<FeatureErrorFallback />}
      level="warning"
      resetOnPropsChange={true}
    >
      {shouldLoadShopManagement ? (
        <Suspense fallback={<FeatureLoadingFallback />}>
          <ShopManagementProvider>
            {shouldLoadSocial ? (
              <Suspense fallback={<FeatureLoadingFallback />}>
                <SocialProvider>
                  {shouldLoadWaitlist ? (
                    <Suspense fallback={<FeatureLoadingFallback />}>
                      <WaitlistProvider>
                        {shouldLoadTeamManagement ? (
                          <Suspense fallback={<FeatureLoadingFallback />}>
                            <TeamManagementProvider>
                              {children}
                            </TeamManagementProvider>
                          </Suspense>
                        ) : children}
                      </WaitlistProvider>
                    </Suspense>
                  ) : shouldLoadTeamManagement ? (
                    <Suspense fallback={<FeatureLoadingFallback />}>
                      <TeamManagementProvider>
                        {children}
                      </TeamManagementProvider>
                    </Suspense>
                  ) : children}
                </SocialProvider>
              </Suspense>
            ) : shouldLoadWaitlist ? (
              <Suspense fallback={<FeatureLoadingFallback />}>
                <WaitlistProvider>
                  {shouldLoadTeamManagement ? (
                    <Suspense fallback={<FeatureLoadingFallback />}>
                      <TeamManagementProvider>
                        {children}
                      </TeamManagementProvider>
                    </Suspense>
                  ) : children}
                </WaitlistProvider>
              </Suspense>
            ) : shouldLoadTeamManagement ? (
              <Suspense fallback={<FeatureLoadingFallback />}>
                <TeamManagementProvider>
                  {children}
                </TeamManagementProvider>
              </Suspense>
            ) : children}
          </ShopManagementProvider>
        </Suspense>
      ) : shouldLoadSocial ? (
        <Suspense fallback={<FeatureLoadingFallback />}>
          <SocialProvider>
            {shouldLoadWaitlist ? (
              <Suspense fallback={<FeatureLoadingFallback />}>
                <WaitlistProvider>
                  {shouldLoadTeamManagement ? (
                    <Suspense fallback={<FeatureLoadingFallback />}>
                      <TeamManagementProvider>
                        {children}
                      </TeamManagementProvider>
                    </Suspense>
                  ) : children}
                </WaitlistProvider>
              </Suspense>
            ) : shouldLoadTeamManagement ? (
              <Suspense fallback={<FeatureLoadingFallback />}>
                <TeamManagementProvider>
                  {children}
                </TeamManagementProvider>
              </Suspense>
            ) : children}
          </SocialProvider>
        </Suspense>
      ) : shouldLoadWaitlist ? (
        <Suspense fallback={<FeatureLoadingFallback />}>
          <WaitlistProvider>
            {shouldLoadTeamManagement ? (
              <Suspense fallback={<FeatureLoadingFallback />}>
                <TeamManagementProvider>
                  {children}
                </TeamManagementProvider>
              </Suspense>
            ) : children}
          </WaitlistProvider>
        </Suspense>
      ) : shouldLoadTeamManagement ? (
        <Suspense fallback={<FeatureLoadingFallback />}>
          <TeamManagementProvider>
            {children}
          </TeamManagementProvider>
        </Suspense>
      ) : children}
    </ErrorBoundary>
  );
}

// Combined optimized provider
interface OptimizedProvidersProps {
  children: React.ReactNode;
}

export function OptimizedProviders({ children }: OptimizedProvidersProps) {
  const { user } = useAuthContext();
  
  const features = useMemo(() => {
    const featureList: string[] = [];
    
    if (user?.role === 'owner') {
      featureList.push('shop-management', 'team-management');
    }
    
    if (user?.role === 'client' || user?.role === 'provider') {
      featureList.push('social', 'waitlist');
    }
    
    return featureList;
  }, [user?.role]);

  return (
    <FeatureProviderWrapper userRole={user?.role} features={features}>
      {children}
    </FeatureProviderWrapper>
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
    fontFamily: FONTS.regular,
  },
  featureLoadingContainer: {
    padding: 10,
    backgroundColor: COLORS.glass.background,
    borderRadius: 8,
    margin: 5,
  },
  featureLoadingText: {
    color: COLORS.lightGray,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: FONTS.regular,
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
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  featureErrorContainer: {
    padding: 10,
    backgroundColor: COLORS.glass.background,
    borderRadius: 8,
    margin: 5,
  },
  featureErrorText: {
    color: COLORS.error,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
});