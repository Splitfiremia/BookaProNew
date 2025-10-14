import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useRouter } from 'expo-router';
import { useAuth } from './AuthProvider';

// Shop service categories
export type ShopServiceCategory = 'Haircuts' | 'Hair Styling' | 'Nails' | 'Tattoos' | 'Other';

// Shop service interface
export interface ShopService {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

// Subscription plan interface
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingFrequency: 'monthly' | 'yearly';
  maxProviders: number;
  features: string[];
}

// Payment method interface
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account';
  last4: string;
  expiryDate?: string;
  brand?: string;
}

// Onboarding state interface
export interface ShopOwnerOnboardingState {
  currentStep: number;
  totalSteps: number;
  // Shop Information
  shopName: string;
  shopPhone: string;
  shopEmail: string;
  shopAddress: string;
  shopCity: string;
  shopState: string;
  shopZip: string;
  // Owner Information
  ownerFirstName: string;
  ownerLastName: string;
  ownerPhone: string;
  // Shop Type
  serviceCategories: ShopServiceCategory[];
  // Master Service List
  services: ShopService[];
  // Subscription Plan
  selectedPlanId: string | null;
  // Payment Information
  paymentMethod: PaymentMethod | null;
  // Policies
  cancellationPolicy: string;
  // Completion
  isCompleted: boolean;
  // Provider invite code
  providerInviteCode: string | null;
}

// Initial state
const initialState: ShopOwnerOnboardingState = {
  currentStep: 1,
  totalSteps: 7,
  shopName: '',
  shopPhone: '',
  shopEmail: '',
  shopAddress: '',
  shopCity: '',
  shopState: '',
  shopZip: '',
  ownerFirstName: '',
  ownerLastName: '',
  ownerPhone: '',
  serviceCategories: [],
  services: [],
  selectedPlanId: null,
  paymentMethod: null,
  cancellationPolicy: '',
  isCompleted: false,
  providerInviteCode: null
};

// Mock subscription plans
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'pro',
    name: 'Professional',
    price: 99.99,
    billingFrequency: 'monthly',
    maxProviders: 10,
    features: [
      'Up to 10 providers',
      'Online booking',
      'Client management',
      'Advanced analytics',
      'Marketing tools',
      'Custom branding'
    ]
  }
];

export const [ShopOwnerOnboardingProvider, useShopOwnerOnboarding] = createContextHook(() => {
  const [state, setState] = useState<ShopOwnerOnboardingState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, register } = useAuth();

  // Load onboarding state on mount
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const storedState = await AsyncStorage.getItem('shopOwnerOnboardingState');
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          setState(prevState => ({
            ...prevState,
            ...parsedState
          }));
        }
      } catch (error) {
        console.error('Error loading shop owner onboarding state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingState();
  }, []);

  // Save onboarding state - moved to a separate function to avoid infinite loops
  const saveOnboardingState = useCallback(async () => {
    try {
      if (!isLoading) {
        await AsyncStorage.setItem('shopOwnerOnboardingState', JSON.stringify(state));
      }
    } catch (error) {
      console.error('Error saving shop owner onboarding state:', error);
    }
  }, [state, isLoading]);

  // Navigation functions
  const nextStep = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      currentStep: Math.min(prevState.currentStep + 1, prevState.totalSteps)
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const previousStep = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      currentStep: Math.max(prevState.currentStep - 1, 1)
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const goToStep = useCallback((step: number) => {
    setState(prevState => ({
      ...prevState,
      currentStep: Math.min(Math.max(step, 1), prevState.totalSteps)
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  // Update functions for each step
  const setShopInfo = useCallback((shopName: string, shopPhone: string, shopEmail: string, shopAddress: string, shopCity: string, shopState: string, shopZip: string) => {
    setState(prevState => ({
      ...prevState,
      shopName,
      shopPhone,
      shopEmail,
      shopAddress,
      shopCity,
      shopState,
      shopZip
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setOwnerInfo = useCallback((ownerFirstName: string, ownerLastName: string, ownerPhone: string) => {
    setState(prevState => ({
      ...prevState,
      ownerFirstName,
      ownerLastName,
      ownerPhone
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setServiceCategories = useCallback((categories: ShopServiceCategory[]) => {
    setState(prevState => ({
      ...prevState,
      serviceCategories: categories
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const addService = useCallback((service: ShopService) => {
    setState(prevState => ({
      ...prevState,
      services: [...prevState.services, service]
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const updateService = useCallback((serviceId: string, updatedService: Partial<ShopService>) => {
    setState(prevState => ({
      ...prevState,
      services: prevState.services.map(service => 
        service.id === serviceId ? { ...service, ...updatedService } : service
      )
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const removeService = useCallback((serviceId: string) => {
    setState(prevState => ({
      ...prevState,
      services: prevState.services.filter(service => service.id !== serviceId)
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const selectSubscriptionPlan = useCallback((planId: string) => {
    setState(prevState => ({
      ...prevState,
      selectedPlanId: planId
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setState(prevState => ({
      ...prevState,
      paymentMethod: method
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setCancellationPolicy = useCallback((policy: string) => {
    setState(prevState => ({
      ...prevState,
      cancellationPolicy: policy
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  // Generate a unique invite code for providers
  const generateProviderInviteCode = useCallback(() => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setState(prevState => ({
      ...prevState,
      providerInviteCode: result
    }));
    
    // Save after state update
    setTimeout(saveOnboardingState, 0);
    
    return result;
  }, [saveOnboardingState]);

  // Complete onboarding and create shop owner account
  const completeOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Generate invite code if not already generated
      if (!state.providerInviteCode) {
        generateProviderInviteCode();
      }
      
      // Create the user account first
      const newUser = await register({
        email: state.shopEmail,
        name: `${state.ownerFirstName} ${state.ownerLastName}`,
        role: 'owner',
        phone: state.ownerPhone
      }, 'password123'); // In a real app, you'd collect a password
      
      // Mark onboarding as completed
      setState(prevState => ({
        ...prevState,
        isCompleted: true
      }));
      
      // In a real app, you would create the shop in your database
      console.log('Shop owner onboarding completed:', {
        userId: newUser.id,
        shopName: state.shopName,
        shopAddress: state.shopAddress,
        serviceCategories: state.serviceCategories,
        services: state.services,
        subscriptionPlan: subscriptionPlans.find(plan => plan.id === state.selectedPlanId),
        cancellationPolicy: state.cancellationPolicy,
        providerInviteCode: state.providerInviteCode
      });
      
      // Navigate to the shop owner dashboard
      router.replace('/shop-owner-dashboard');
      
      return true;
    } catch (error) {
      console.error('Error completing shop owner onboarding:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state, register, router, generateProviderInviteCode]);

  // Reset onboarding state
  const resetOnboarding = useCallback(() => {
    setState(initialState);
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  // Get subscription plans
  const getSubscriptionPlans = useCallback(() => {
    return subscriptionPlans;
  }, []);

  return useMemo(() => ({
    ...state,
    isLoading,
    nextStep,
    previousStep,
    goToStep,
    setShopInfo,
    setOwnerInfo,
    setServiceCategories,
    addService,
    updateService,
    removeService,
    selectSubscriptionPlan,
    setPaymentMethod,
    setCancellationPolicy,
    generateProviderInviteCode,
    completeOnboarding,
    resetOnboarding,
    getSubscriptionPlans
  }), [
    state,
    isLoading,
    nextStep,
    previousStep,
    goToStep,
    setShopInfo,
    setOwnerInfo,
    setServiceCategories,
    addService,
    updateService,
    removeService,
    selectSubscriptionPlan,
    setPaymentMethod,
    setCancellationPolicy,
    generateProviderInviteCode,
    completeOnboarding,
    resetOnboarding,
    getSubscriptionPlans
  ]);
});