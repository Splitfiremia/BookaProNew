import { useState, useCallback, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Provider } from '@/components/EditProviderModal';
import { Service, Shop, Appointment, mockTeamProviders, mockMasterServiceList, mockShop, mockProviderAppointments } from '@/mocks/teamData';

export const [TeamManagementProvider, useTeamManagement] = createContextHook(() => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [masterServiceList, setMasterServiceList] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize data immediately to prevent loading delays
  useEffect(() => {
    console.log('TeamManagementProvider: Initializing data immediately');
    try {
      setProviders(mockTeamProviders || []);
      setShop(mockShop || null);
      setMasterServiceList(mockMasterServiceList || []);
      setAppointments(mockProviderAppointments || []);
      console.log('TeamManagementProvider: Data initialized successfully');
    } catch (err) {
      console.error('TeamManagementProvider: Initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize team data');
    }
  }, []);

  const updateProvider = useCallback((updatedProvider: Provider) => {
    setProviders(prev => 
      prev.map(provider => 
        provider.id === updatedProvider.id ? updatedProvider : provider
      )
    );
    console.log('Provider updated:', updatedProvider);
  }, []);

  const addProvider = useCallback((newProviderData: Omit<Provider, 'id'>) => {
    const newProvider: Provider = {
      ...newProviderData,
      id: `provider_${Date.now()}`,
    };
    setProviders(prev => [...prev, newProvider]);
    console.log('Provider added:', newProvider);
  }, []);

  const removeProvider = useCallback((providerId: string) => {
    setProviders(prev => prev.filter(provider => provider.id !== providerId));
    // Also remove their appointments
    setAppointments(prev => prev.filter(appointment => appointment.providerId !== providerId));
    console.log('Provider removed:', providerId);
  }, []);

  const updateMasterServiceList = useCallback((services: Service[]) => {
    if (!services || !Array.isArray(services)) {
      console.error('Invalid services array provided');
      return;
    }
    setMasterServiceList(services);
    setShop(prev => prev ? { ...prev, masterServiceList: services } : null);
    console.log('Master service list updated:', services);
  }, []);

  const getProviderAppointments = useCallback((providerId: string): Appointment[] => {
    return appointments.filter(appointment => appointment.providerId === providerId);
  }, [appointments]);

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `appointment_${Date.now()}`,
    };
    setAppointments(prev => [...prev, newAppointment]);
    console.log('Appointment added:', newAppointment);
  }, []);

  const generateInviteLink = useCallback((): string => {
    const baseUrl = 'https://myapp.com/join';
    const shopId = shop?.id || 'default';
    const inviteCode = `${shopId}_${Date.now()}`;
    return `${baseUrl}/${inviteCode}`;
  }, [shop?.id]);

  console.log('TeamManagementProvider: Context value created', {
    providersCount: providers.length,
    shopId: shop?.id || 'none',
    isLoading,
    error
  });

  return {
    // Providers
    providers,
    updateProvider,
    addProvider,
    removeProvider,
    
    // Shop & Services
    shop,
    masterServiceList,
    updateMasterServiceList,
    
    // Appointments
    appointments,
    getProviderAppointments,
    addAppointment,
    
    // Invitation
    generateInviteLink,
    
    // Loading states
    isLoading,
    error,
  };
});