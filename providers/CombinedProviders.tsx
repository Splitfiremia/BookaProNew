import React, { Suspense } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { COLORS } from '@/constants/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import individual provider hooks
import { useAuth } from './AuthProvider';
import { useAppointments } from './AppointmentProvider';
import { usePayments } from './PaymentProvider';
import { useServices } from './ServicesProvider';
import { useOnboarding } from './OnboardingProvider';
import { useSocial } from './SocialProvider';
import { useWaitlist } from './WaitlistProvider';
import { useTeamManagement } from './TeamManagementProvider';
import { useShopManagement } from './ShopManagementProvider';

// Combined context type
interface CombinedContextType {
  // Auth
  auth: ReturnType<typeof useAuth>;
  // Core business logic
  appointments: ReturnType<typeof useAppointments>;
  payments: ReturnType<typeof usePayments>;
  services: ReturnType<typeof useServices>;
  // User experience
  onboarding: ReturnType<typeof useOnboarding>;
  social: ReturnType<typeof useSocial>;
  waitlist: ReturnType<typeof useWaitlist>;
  // Management
  teamManagement: ReturnType<typeof useTeamManagement>;
  shopManagement: ReturnType<typeof useShopManagement>;
}

// Create combined context hook
export const [CombinedProvider, useCombinedContext] = createContextHook(() => {
  console.log('CombinedProvider: Initializing combined context');
  
  // Get all provider contexts
  const auth = useAuth();
  const appointments = useAppointments();
  const payments = usePayments();
  const services = useServices();
  const onboarding = useOnboarding();
  const social = useSocial();
  const waitlist = useWaitlist();
  const teamManagement = useTeamManagement();
  const shopManagement = useShopManagement();

  const combinedContext: CombinedContextType = {
    auth,
    appointments,
    payments,
    services,
    onboarding,
    social,
    waitlist,
    teamManagement,
    shopManagement,
  };

  console.log('CombinedProvider: Combined context created');
  return combinedContext;
});

// Individual hook exports for backward compatibility
export const useAuthContext = () => useCombinedContext().auth;
export const useAppointmentsContext = () => useCombinedContext().appointments;
export const usePaymentsContext = () => useCombinedContext().payments;
export const useServicesContext = () => useCombinedContext().services;
export const useOnboardingContext = () => useCombinedContext().onboarding;
export const useSocialContext = () => useCombinedContext().social;
export const useWaitlistContext = () => useCombinedContext().waitlist;
export const useTeamManagementContext = () => useCombinedContext().teamManagement;
export const useShopManagementContext = () => useCombinedContext().shopManagement;

// Loading fallback component
function CombinedProviderLoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading application...</Text>
    </View>
  );
}

// Error fallback component
function CombinedProviderErrorFallback() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load application providers</Text>
    </View>
  );
}

// Wrapper component with error boundary and suspense
interface CombinedProviderWrapperProps {
  children: React.ReactNode;
}

export function CombinedProviderWrapper({ children }: CombinedProviderWrapperProps) {
  return (
    <ErrorBoundary fallback={<CombinedProviderErrorFallback />}>
      <Suspense fallback={<CombinedProviderLoadingFallback />}>
        <CombinedProvider>
          {children}
        </CombinedProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});