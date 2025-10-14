import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Service, ProviderServiceOffering } from '@/models/database';
import { useAuth } from './AuthProvider';
import { ServicesRepository, ServiceOfferingsRepository } from '@/repositories/ServicesRepository';
import { LoadingState } from '@/components/LoadingStateManager';
import { useMemoizedFilter, useMemoizedSort, usePerformanceMonitor } from '@/hooks/useMemoization';
import { useProviderPerformanceTracking } from '@/utils/performanceUtils';



// Repository instances
const servicesRepository = new ServicesRepository();
const serviceOfferingsRepository = new ServiceOfferingsRepository();

export const [ServicesProvider, useServices] = createContextHook(() => {
  console.log('ServicesProvider: Initializing context...');
  usePerformanceMonitor('ServicesProvider');
  const { trackOperation } = useProviderPerformanceTracking('ServicesProvider');
  
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [masterServices, setMasterServices] = useState<Service[]>([]);
  const [serviceOfferings, setServiceOfferings] = useState<ProviderServiceOffering[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true, // Start with loading true to prevent undefined errors
    error: null,
    isEmpty: false,
  });
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const loadServices = useCallback(async () => {
    if (!user) {
      console.log('ServicesProvider: No user, setting defaults');
      setMasterServices([]);
      setServices([]);
      setServiceOfferings([]);
      setLoadingState({ isLoading: false, error: null, isEmpty: true });
      setIsInitialized(true);
      return;
    }
    
    console.log('ServicesProvider: Loading services for user role:', user.role);
    setLoadingState({ isLoading: true, error: null, isEmpty: false });
    
    // Track the loading operation for performance monitoring
    return trackOperation('loadServices', async () => {
    
    try {
      // Load based on user role and provider type
      if (user.role === 'provider') {
        const mockData = user.mockData;
        if (mockData?.profile?.isIndependent !== false) {
          // Independent provider - load from repository
          try {
            const storedServices = await servicesRepository.getByProviderId(user.id!);
            if (storedServices.length > 0) {
              setServices(storedServices);
            } else {
              // Initialize with mock data if no stored services
              const initialServices: Service[] = mockData?.profile?.services?.map((s: any, index: number) => ({
                id: `service_${index + 1}`,
                name: s.name,
                description: s.description || '',
                baseDuration: parseInt(s.duration) || 30,
                basePrice: s.price,
                isActive: true,
                providerId: user.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })) || [];
              setServices(initialServices);
              
              // Save initial services to repository
              for (const service of initialServices) {
                await servicesRepository.createForProvider(user.id!, {
                  name: service.name,
                  description: service.description,
                  baseDuration: service.baseDuration,
                  basePrice: service.basePrice,
                  isActive: service.isActive,
                });
              }
            }
          } catch (error) {
            console.error('ServicesProvider: Error loading provider services:', error);
            setLoadingState({ isLoading: false, error: 'Failed to load services', isEmpty: false });
            return;
          }
        } else {
          // Shop-based provider - load master services and offerings
          try {
            const shopId = user.mockData?.shops?.[0]?.id || 'shop_1';
            const [masterServicesData, offeringsData] = await Promise.all([
              servicesRepository.getByShopId(shopId),
              serviceOfferingsRepository.getByProviderId(user.id!)
            ]);
            
            if (masterServicesData.length === 0) {
              // Initialize with default master services
              const defaultMasterServices: Service[] = [
                {
                  id: 'master_1',
                  name: "Women's Haircut",
                  description: 'Professional haircut and styling',
                  baseDuration: 45,
                  basePrice: 75,
                  isActive: true,
                  shopId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: 'master_2',
                  name: "Men's Haircut",
                  description: 'Classic and modern cuts',
                  baseDuration: 30,
                  basePrice: 55,
                  isActive: true,
                  shopId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ];
              setMasterServices(defaultMasterServices);
              
              // Save to repository
              for (const service of defaultMasterServices) {
                await servicesRepository.createForShop(shopId, {
                  name: service.name,
                  description: service.description,
                  baseDuration: service.baseDuration,
                  basePrice: service.basePrice,
                  isActive: service.isActive,
                });
              }
            } else {
              setMasterServices(masterServicesData);
            }
            
            setServiceOfferings(offeringsData);
          } catch (error) {
            console.error('ServicesProvider: Error loading shop services:', error);
            setLoadingState({ isLoading: false, error: 'Failed to load shop services', isEmpty: false });
            return;
          }
        }
      } else if (user.role === 'owner') {
        // Shop owner - load master services
        try {
          const shopId = user.mockData?.shops?.[0]?.id || 'shop_1';
          const masterServicesData = await servicesRepository.getByShopId(shopId);
          
          if (masterServicesData.length === 0) {
            // Initialize with default master services
            const defaultMasterServices: Service[] = [
              {
                id: 'master_1',
                name: "Women's Haircut",
                description: 'Professional haircut and styling',
                baseDuration: 45,
                basePrice: 75,
                isActive: true,
                shopId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'master_2',
                name: "Men's Haircut",
                description: 'Classic and modern cuts',
                baseDuration: 30,
                basePrice: 55,
                isActive: true,
                shopId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ];
            setMasterServices(defaultMasterServices);
            
            // Save to repository
            for (const service of defaultMasterServices) {
              await servicesRepository.createForShop(shopId, {
                name: service.name,
                description: service.description,
                baseDuration: service.baseDuration,
                basePrice: service.basePrice,
                isActive: service.isActive,
              });
            }
          } else {
            setMasterServices(masterServicesData);
          }
        } catch (error) {
          console.error('ServicesProvider: Error loading owner services:', error);
          setLoadingState({ isLoading: false, error: 'Failed to load services', isEmpty: false });
          return;
        }
      }
      
      setLoadingState({ isLoading: false, error: null, isEmpty: false });
      setIsInitialized(true);
    } catch (error) {
      console.error('ServicesProvider: Error loading services:', error);
      // Set defaults even on error to prevent undefined issues
      setMasterServices([]);
      setServices([]);
      setServiceOfferings([]);
      setLoadingState({ isLoading: false, error: 'Failed to load services', isEmpty: false });
      setIsInitialized(true);
      throw error; // Re-throw for performance tracking
    }
    });
  }, [user, trackOperation]);

  // Load services with debouncing to prevent multiple calls
  useEffect(() => {
    console.log('ServicesProvider: useEffect triggered, user:', !!user);
    
    // Set defaults immediately to prevent undefined errors
    if (!isInitialized) {
      if (user) {
        // Defer loading to next tick to prevent blocking
        const timeoutId = setTimeout(() => {
          loadServices();
        }, 0);
        return () => clearTimeout(timeoutId);
      } else {
        // No user, set defaults immediately
        setMasterServices([]);
        setServices([]);
        setServiceOfferings([]);
        setLoadingState({ isLoading: false, error: null, isEmpty: true });
        setIsInitialized(true);
      }
    }
  }, [user, loadServices, isInitialized]);

  // Independent provider service management
  const addService = useCallback(async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'providerId'>) => {
    if (!user?.id) return;
    
    try {
      const newService = await servicesRepository.createForProvider(user.id, serviceData);
      setServices(prev => [...prev, newService]);
    } catch (error) {
      console.error('ServicesProvider: Error adding service:', error);
      throw error;
    }
  }, [user]);

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    if (!user?.id) return;
    
    try {
      const updatedService = await servicesRepository.updateForProvider(user.id, id, updates);
      if (updatedService) {
        setServices(prev => prev.map(service => 
          service.id === id ? updatedService : service
        ));
      }
    } catch (error) {
      console.error('ServicesProvider: Error updating service:', error);
      throw error;
    }
  }, [user]);

  const deleteService = useCallback(async (id: string) => {
    if (!user?.id) return;
    
    try {
      const success = await servicesRepository.deleteForProvider(user.id, id);
      if (success) {
        setServices(prev => prev.filter(service => service.id !== id));
      }
    } catch (error) {
      console.error('ServicesProvider: Error deleting service:', error);
      throw error;
    }
  }, [user]);

  // Shop master service management
  const addMasterService = useCallback(async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'shopId'>) => {
    if (!user?.id) return;
    
    try {
      const shopId = user.mockData?.shops?.[0]?.id || 'shop_1';
      const newService = await servicesRepository.createForShop(shopId, serviceData);
      setMasterServices(prev => [...prev, newService]);
    } catch (error) {
      console.error('ServicesProvider: Error adding master service:', error);
      throw error;
    }
  }, [user]);

  const updateMasterService = useCallback(async (id: string, updates: Partial<Service>) => {
    if (!user?.id) return;
    
    try {
      const shopId = user.mockData?.shops?.[0]?.id || 'shop_1';
      const updatedService = await servicesRepository.updateForShop(shopId, id, updates);
      if (updatedService) {
        setMasterServices(prev => prev.map(service => 
          service.id === id ? updatedService : service
        ));
      }
    } catch (error) {
      console.error('ServicesProvider: Error updating master service:', error);
      throw error;
    }
  }, [user]);

  const deleteMasterService = useCallback(async (id: string) => {
    if (!user?.id) return;
    
    try {
      const shopId = user.mockData?.shops?.[0]?.id || 'shop_1';
      const success = await servicesRepository.deleteForShop(shopId, id);
      if (success) {
        setMasterServices(prev => prev.filter(service => service.id !== id));
      }
    } catch (error) {
      console.error('ServicesProvider: Error deleting master service:', error);
      throw error;
    }
  }, [user]);

  // Provider service offering management
  const toggleServiceOffering = useCallback(async (serviceId: string, isOffered: boolean) => {
    if (!user?.id) return;
    
    try {
      const service = masterServices.find(s => s.id === serviceId);
      if (!service) return;
      
      const updatedOffering = await serviceOfferingsRepository.toggleOffering(
        user.id,
        serviceId,
        isOffered,
        service
      );
      
      setServiceOfferings(prev => {
        const existingIndex = prev.findIndex(o => o.serviceId === serviceId);
        if (existingIndex >= 0) {
          return prev.map((offering, index) => 
            index === existingIndex ? updatedOffering : offering
          );
        } else {
          return [...prev, updatedOffering];
        }
      });
    } catch (error) {
      console.error('ServicesProvider: Error toggling service offering:', error);
      throw error;
    }
  }, [user, masterServices]);

  // Get services for display based on provider type with memoization
  const getProviderServices = useCallback((): Service[] => {
    if (!user) return [];
    
    if (user.role === 'provider') {
      const mockData = user.mockData;
      if (mockData?.profile?.isIndependent !== false) {
        // Independent provider - return their personal services
        return services.filter(s => s.isActive);
      } else {
        // Shop-based provider - return shop services they offer
        return masterServices.filter(service => {
          const offering = serviceOfferings.find(o => o.serviceId === service.id);
          return service.isActive && offering?.isOffered;
        });
      }
    }
    
    return [];
  }, [user, services, masterServices, serviceOfferings]);
  
  // Memoized filtered services
  const activeServices = useMemoizedFilter(
    services,
    (service) => service.isActive,
    [services]
  );
  
  const activeMasterServices = useMemoizedFilter(
    masterServices,
    (service) => service.isActive,
    [masterServices]
  );
  
  // Memoized sorted services
  const sortedServices = useMemoizedSort(
    activeServices,
    (a, b) => a.name.localeCompare(b.name),
    [activeServices]
  );
  
  const sortedMasterServices = useMemoizedSort(
    activeMasterServices,
    (a, b) => a.name.localeCompare(b.name),
    [activeMasterServices]
  );

  const contextValue = useMemo(() => {
    const value = {
      // Raw data - always provide arrays to prevent undefined errors
      services: services || [],
      masterServices: masterServices || [],
      serviceOfferings: serviceOfferings || [],
      
      // Processed data
      activeServices: activeServices || [],
      activeMasterServices: activeMasterServices || [],
      sortedServices: sortedServices || [],
      sortedMasterServices: sortedMasterServices || [],
      
      // Actions
      addService,
      updateService,
      deleteService,
      addMasterService,
      updateMasterService,
      deleteMasterService,
      toggleServiceOffering,
      getProviderServices,
      
      // State
      loadingState,
      isLoading: loadingState.isLoading,
      error: loadingState.error,
      isEmpty: loadingState.isEmpty,
      isInitialized,
      
      // Utilities
      refreshServices: loadServices,
    };
    console.log('ServicesProvider: Context value created with', {
      servicesCount: (services || []).length,
      masterServicesCount: (masterServices || []).length,
      offeringsCount: (serviceOfferings || []).length,
      isLoading: loadingState.isLoading,
      hasError: !!loadingState.error,
      isInitialized,
    });
    return value;
  }, [
    services,
    masterServices,
    serviceOfferings,
    activeServices,
    activeMasterServices,
    sortedServices,
    sortedMasterServices,
    addService,
    updateService,
    deleteService,
    addMasterService,
    updateMasterService,
    deleteMasterService,
    toggleServiceOffering,
    getProviderServices,
    loadingState,
    loadServices,
    isInitialized,
  ]);

  return contextValue;
});