import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useRouter } from 'expo-router';
import { useAuth } from './AuthProvider';

// Provider types
export type ProviderType = 'Barber' | 'Hair Stylist' | 'Nail Technician' | 'Tattoo Artist' | 'Other';
export type WorkSituation = 'own_shop' | 'work_at_shop' | 'mobile' | 'home_studio';

// Service interface
export interface ProviderService {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

// Availability interface
export interface WeeklyAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // format: "HH:MM"
  end: string; // format: "HH:MM"
}

// Shop interface
export interface ShopInfo {
  id: string;
  name: string;
  address: string;
}

// Onboarding state interface
export interface ProviderOnboardingState {
  currentStep: number;
  totalSteps: number;
  providerType: ProviderType | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  workSituation: WorkSituation | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  travelRadius: number;
  shopId: string | null;
  shopName: string;
  shopAddress: string;
  inviteOwnerName: string;
  inviteOwnerPhone: string;
  services: ProviderService[];
  profileImage: string | null;
  bio: string;
  availability: WeeklyAvailability;
  isCompleted: boolean;
}

// Initial state
const initialState: ProviderOnboardingState = {
  currentStep: 1,
  totalSteps: 9,
  providerType: null,
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  workSituation: null,
  address: '',
  city: '',
  state: '',
  zip: '',
  travelRadius: 10,
  shopId: null,
  shopName: '',
  shopAddress: '',
  inviteOwnerName: '',
  inviteOwnerPhone: '',
  services: [],
  profileImage: null,
  bio: '',
  availability: {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  },
  isCompleted: false
};

// Step navigation mapping
const STEP_ROUTES = [
  '/provider-onboarding/index',
  '/provider-onboarding/provider-type',
  '/provider-onboarding/personal-info',
  '/provider-onboarding/service-address',
  '/provider-onboarding/shop-search',
  '/provider-onboarding/services',
  '/provider-onboarding/profile',
  '/provider-onboarding/availability',
  '/provider-onboarding/summary'
];

// Mock shops for demo
const mockShops: ShopInfo[] = [
  { id: 'shop1', name: 'Elite Cuts', address: '123 Main St, New York, NY 10001' },
  { id: 'shop2', name: 'Style Studio', address: '456 Broadway, New York, NY 10002' },
  { id: 'shop3', name: 'Luxury Salon', address: '789 5th Ave, New York, NY 10003' },
];

export const [ProviderOnboardingProvider, useProviderOnboarding] = createContextHook(() => {
  const [state, setState] = useState<ProviderOnboardingState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { register } = useAuth();

  // Load onboarding state on mount
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const storedState = await AsyncStorage.getItem('providerOnboardingState');
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          setState(prevState => ({
            ...prevState,
            ...parsedState
          }));
        }
      } catch (error) {
        console.error('Error loading provider onboarding state:', error);
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
        await AsyncStorage.setItem('providerOnboardingState', JSON.stringify(state));
      }
    } catch (error) {
      console.error('Error saving provider onboarding state:', error);
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

  const navigateToStep = useCallback((step: number) => {
    if (step >= 0 && step < STEP_ROUTES.length) {
      router.replace(STEP_ROUTES[step] as any);
    }
  }, [router]);

  const navigateNext = useCallback(() => {
    const nextStepIndex = state.currentStep;
    if (nextStepIndex < STEP_ROUTES.length) {
      navigateToStep(nextStepIndex);
    }
  }, [state.currentStep, navigateToStep]);

  const navigateBack = useCallback(() => {
    const prevStepIndex = state.currentStep - 2; // -1 for 0-based index, -1 for previous
    if (prevStepIndex >= 0) {
      navigateToStep(prevStepIndex);
    }
  }, [state.currentStep, navigateToStep]);

  const getNextRoute = useCallback((workSituation?: WorkSituation) => {
    const currentStepIndex = state.currentStep - 1; // Convert to 0-based index
    
    // Handle conditional routing based on work situation
    if (currentStepIndex === 0) { // index step (how do you work)
      const situation = workSituation || state.workSituation;
      if (situation === 'work_at_shop') {
        return '/provider-onboarding/shop-search';
      } else {
        return '/provider-onboarding/service-address';
      }
    }
    
    // Handle shop-search routing
    if (currentStepIndex === 4) { // shop-search step
      return '/provider-onboarding/services';
    }
    
    // Default next route
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEP_ROUTES.length) {
      return STEP_ROUTES[nextIndex];
    }
    
    return null;
  }, [state.currentStep, state.workSituation]);

  // Update functions for each step
  const setProviderType = useCallback((type: ProviderType) => {
    setState(prevState => ({
      ...prevState,
      providerType: type
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setPersonalInfo = useCallback((firstName: string, lastName: string, phone: string, email: string) => {
    setState(prevState => ({
      ...prevState,
      firstName,
      lastName,
      phone,
      email
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setWorkSituation = useCallback((situation: WorkSituation) => {
    setState(prevState => ({
      ...prevState,
      workSituation: situation
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setAddress = useCallback((address: string, city: string, state: string, zip: string) => {
    setState(prevState => ({
      ...prevState,
      address,
      city,
      state,
      zip
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setTravelRadius = useCallback((radius: number) => {
    setState(prevState => ({
      ...prevState,
      travelRadius: radius
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setShopInfo = useCallback((shopId: string, shopName: string, shopAddress: string) => {
    setState(prevState => ({
      ...prevState,
      shopId,
      shopName,
      shopAddress
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setInviteOwnerInfo = useCallback((name: string, phone: string) => {
    setState(prevState => ({
      ...prevState,
      inviteOwnerName: name,
      inviteOwnerPhone: phone
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const addService = useCallback((service: ProviderService) => {
    setState(prevState => ({
      ...prevState,
      services: [...prevState.services, service]
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const updateService = useCallback((serviceId: string, updatedService: Partial<ProviderService>) => {
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

  const setProfileImage = useCallback((imageUri: string) => {
    setState(prevState => ({
      ...prevState,
      profileImage: imageUri
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setBio = useCallback((bio: string) => {
    setState(prevState => ({
      ...prevState,
      bio
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const setAvailability = useCallback((availability: WeeklyAvailability) => {
    setState(prevState => ({
      ...prevState,
      availability
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  const updateDayAvailability = useCallback((day: keyof WeeklyAvailability, slots: TimeSlot[]) => {
    setState(prevState => ({
      ...prevState,
      availability: {
        ...prevState.availability,
        [day]: slots
      }
    }));
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  // Search for shops
  const searchShops = useCallback((query: string): ShopInfo[] => {
    // In a real app, this would be an API call
    if (!query.trim()) return [];
    
    return mockShops.filter(shop => 
      shop.name.toLowerCase().includes(query.toLowerCase()) ||
      shop.address.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  // Complete onboarding and create provider account
  const completeOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Create the user account first
      const newUser = await register({
        email: state.email,
        name: `${state.firstName} ${state.lastName}`,
        role: 'provider',
        phone: state.phone,
        profileImage: state.profileImage || undefined
      }, 'password123'); // In a real app, you'd collect a password
      
      // Mark onboarding as completed
      setState(prevState => ({
        ...prevState,
        isCompleted: true
      }));
      
      // In a real app, you would create the provider profile in your database
      console.log('Provider onboarding completed:', {
        userId: newUser.id,
        providerType: state.providerType,
        workSituation: state.workSituation,
        shopId: state.shopId,
        services: state.services,
        bio: state.bio,
        availability: state.availability
      });
      
      // Navigate to the app which will handle role-based redirection
      router.replace('/(app)' as any);
      
      return true;
    } catch (error) {
      console.error('Error completing provider onboarding:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state, register, router]);

  // Reset onboarding state
  const resetOnboarding = useCallback(() => {
    setState(initialState);
    // Save after state update
    setTimeout(saveOnboardingState, 0);
  }, [saveOnboardingState]);

  return {
    ...state,
    isLoading,
    nextStep,
    previousStep,
    goToStep,
    navigateNext,
    navigateBack,
    getNextRoute,
    setProviderType,
    setPersonalInfo,
    setWorkSituation,
    setAddress,
    setTravelRadius,
    setShopInfo,
    setInviteOwnerInfo,
    addService,
    updateService,
    removeService,
    setProfileImage,
    setBio,
    setAvailability,
    updateDayAvailability,
    searchShops,
    completeOnboarding,
    resetOnboarding
  };
});