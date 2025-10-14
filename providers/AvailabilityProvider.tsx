import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@/utils/contextHook';
import { 
  ProviderAvailability, 
  DayAvailability, 
  TimeInterval, 
  DayOfWeek,
  ShopOperatingHours 
} from '@/models/database';
import { 
  createDefaultAvailability, 
  validateDayIntervals,
  timeToMinutes 
} from '@/utils/availability';
import { useAuth } from './AuthProvider';

export const [AvailabilityProvider, useAvailability] = createContextHook(() => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<ProviderAvailability | null>(null);
  const [shopOperatingHours, setShopOperatingHours] = useState<ShopOperatingHours | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Load availability on mount
  useEffect(() => {
    const loadAvailability = async () => {
      if (!user || user.role !== 'provider') {
        setIsLoading(false);
        return;
      }

      try {
        console.log('AvailabilityProvider: Loading availability for provider:', user.id);
        
        // Try to load saved availability
        const savedAvailability = await AsyncStorage.getItem(`availability_${user.id}`);
        if (savedAvailability) {
          const parsedAvailability = JSON.parse(savedAvailability);
          console.log('AvailabilityProvider: Loaded saved availability');
          setAvailability(parsedAvailability);
        } else {
          // Create default availability
          const defaultAvailability = createDefaultAvailability(user.id!);
          console.log('AvailabilityProvider: Created default availability');
          setAvailability(defaultAvailability);
          await AsyncStorage.setItem(`availability_${user.id}`, JSON.stringify(defaultAvailability));
        }

        // Load shop operating hours if provider is shop-based
        if (user.mockData?.provider?.shopId) {
          const shopHours = await AsyncStorage.getItem(`shop_hours_${user.mockData.provider.shopId}`);
          if (shopHours) {
            setShopOperatingHours(JSON.parse(shopHours));
          } else {
            // Create default shop hours (9 AM - 6 PM, Monday-Saturday)
            const defaultShopHours: ShopOperatingHours = {
              id: `shop-hours-${user.mockData.provider.shopId}`,
              shopId: user.mockData.provider.shopId,
              weeklyHours: [
                { day: 'monday', isEnabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
                { day: 'tuesday', isEnabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
                { day: 'wednesday', isEnabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
                { day: 'thursday', isEnabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
                { day: 'friday', isEnabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
                { day: 'saturday', isEnabled: true, intervals: [{ start: '09:00', end: '17:00' }] },
                { day: 'sunday', isEnabled: false, intervals: [] }
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setShopOperatingHours(defaultShopHours);
            await AsyncStorage.setItem(`shop_hours_${user.mockData.provider.shopId}`, JSON.stringify(defaultShopHours));
          }
        }
      } catch (error) {
        console.error('AvailabilityProvider: Error loading availability:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailability();
  }, [user]);

  // Update a day's availability
  const updateDayAvailability = useCallback((day: DayOfWeek, dayAvailability: DayAvailability) => {
    if (!availability) return;

    console.log('AvailabilityProvider: Updating day availability:', day, dayAvailability);
    
    setAvailability(prev => {
      if (!prev) return prev;
      
      const updatedSchedule = prev.weeklySchedule.map(d => 
        d.day === day ? dayAvailability : d
      );
      
      return {
        ...prev,
        weeklySchedule: updatedSchedule,
        updatedAt: new Date().toISOString()
      };
    });
    
    setHasUnsavedChanges(true);
  }, [availability]);

  // Add time interval to a day
  const addTimeInterval = useCallback((day: DayOfWeek, interval: TimeInterval) => {
    if (!availability) return;

    console.log('AvailabilityProvider: Adding time interval:', day, interval);
    
    setAvailability(prev => {
      if (!prev) return prev;
      
      const updatedSchedule = prev.weeklySchedule.map(d => {
        if (d.day === day) {
          const newIntervals = [...d.intervals, interval];
          // Sort intervals by start time
          newIntervals.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
          return { ...d, intervals: newIntervals };
        }
        return d;
      });
      
      return {
        ...prev,
        weeklySchedule: updatedSchedule,
        updatedAt: new Date().toISOString()
      };
    });
    
    setHasUnsavedChanges(true);
  }, [availability]);

  // Remove time interval from a day
  const removeTimeInterval = useCallback((day: DayOfWeek, intervalIndex: number) => {
    if (!availability) return;

    console.log('AvailabilityProvider: Removing time interval:', day, intervalIndex);
    
    setAvailability(prev => {
      if (!prev) return prev;
      
      const updatedSchedule = prev.weeklySchedule.map(d => {
        if (d.day === day) {
          const newIntervals = d.intervals.filter((_, index) => index !== intervalIndex);
          return { ...d, intervals: newIntervals };
        }
        return d;
      });
      
      return {
        ...prev,
        weeklySchedule: updatedSchedule,
        updatedAt: new Date().toISOString()
      };
    });
    
    setHasUnsavedChanges(true);
  }, [availability]);

  // Update time interval
  const updateTimeInterval = useCallback((day: DayOfWeek, intervalIndex: number, interval: TimeInterval) => {
    if (!availability) return;

    console.log('AvailabilityProvider: Updating time interval:', day, intervalIndex, interval);
    
    setAvailability(prev => {
      if (!prev) return prev;
      
      const updatedSchedule = prev.weeklySchedule.map(d => {
        if (d.day === day) {
          const newIntervals = d.intervals.map((int, index) => 
            index === intervalIndex ? interval : int
          );
          // Sort intervals by start time
          newIntervals.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
          return { ...d, intervals: newIntervals };
        }
        return d;
      });
      
      return {
        ...prev,
        weeklySchedule: updatedSchedule,
        updatedAt: new Date().toISOString()
      };
    });
    
    setHasUnsavedChanges(true);
  }, [availability]);

  // Toggle day enabled/disabled
  const toggleDayEnabled = useCallback((day: DayOfWeek) => {
    if (!availability) return;

    console.log('AvailabilityProvider: Toggling day enabled:', day);
    
    setAvailability(prev => {
      if (!prev) return prev;
      
      const updatedSchedule = prev.weeklySchedule.map(d => {
        if (d.day === day) {
          return { ...d, isEnabled: !d.isEnabled };
        }
        return d;
      });
      
      return {
        ...prev,
        weeklySchedule: updatedSchedule,
        updatedAt: new Date().toISOString()
      };
    });
    
    setHasUnsavedChanges(true);
  }, [availability]);

  // Copy schedule from one day to another
  const copyDaySchedule = useCallback((fromDay: DayOfWeek, toDay: DayOfWeek) => {
    if (!availability) return;

    console.log('AvailabilityProvider: Copying schedule from', fromDay, 'to', toDay);
    
    const fromDaySchedule = availability.weeklySchedule.find(d => d.day === fromDay);
    if (!fromDaySchedule) return;

    setAvailability(prev => {
      if (!prev) return prev;
      
      const updatedSchedule = prev.weeklySchedule.map(d => {
        if (d.day === toDay) {
          return {
            ...d,
            isEnabled: fromDaySchedule.isEnabled,
            intervals: [...fromDaySchedule.intervals]
          };
        }
        return d;
      });
      
      return {
        ...prev,
        weeklySchedule: updatedSchedule,
        updatedAt: new Date().toISOString()
      };
    });
    
    setHasUnsavedChanges(true);
  }, [availability]);

  // Validate entire availability schedule
  const validateAvailability = useCallback((): { isValid: boolean; errors: string[] } => {
    if (!availability) return { isValid: false, errors: ['No availability data'] };

    const errors: string[] = [];

    for (const daySchedule of availability.weeklySchedule) {
      if (!daySchedule.isEnabled) continue;

      const validation = validateDayIntervals(daySchedule.intervals);
      if (!validation.isValid) {
        errors.push(`${daySchedule.day}: ${validation.error}`);
      }

      // Check against shop operating hours if applicable
      if (shopOperatingHours) {
        const shopDay = shopOperatingHours.weeklyHours.find(d => d.day === daySchedule.day);
        if (shopDay && shopDay.isEnabled) {
          for (const interval of daySchedule.intervals) {
            const intervalStart = timeToMinutes(interval.start);
            const intervalEnd = timeToMinutes(interval.end);
            
            const isWithinShopHours = shopDay.intervals.some(shopInterval => {
              const shopStart = timeToMinutes(shopInterval.start);
              const shopEnd = timeToMinutes(shopInterval.end);
              return intervalStart >= shopStart && intervalEnd <= shopEnd;
            });
            
            if (!isWithinShopHours) {
              errors.push(`${daySchedule.day}: Time ${interval.start}-${interval.end} is outside shop operating hours`);
            }
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }, [availability, shopOperatingHours]);

  // Save availability
  const saveAvailability = useCallback(async (): Promise<{ success: boolean; errors?: string[] }> => {
    if (!availability || !user) {
      return { success: false, errors: ['No availability data or user'] };
    }

    const validation = validateAvailability();
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    try {
      console.log('AvailabilityProvider: Saving availability');
      await AsyncStorage.setItem(`availability_${user.id}`, JSON.stringify(availability));
      setHasUnsavedChanges(false);
      console.log('AvailabilityProvider: Availability saved successfully');
      return { success: true };
    } catch (error) {
      console.error('AvailabilityProvider: Error saving availability:', error);
      return { success: false, errors: ['Failed to save availability'] };
    }
  }, [availability, user, validateAvailability]);

  // Get constrained intervals for a day (within shop hours if applicable)
  const getConstrainedIntervalsForDay = useCallback((day: DayOfWeek): TimeInterval[] => {
    if (!shopOperatingHours) {
      // No constraints, return full day
      return [{ start: '00:00', end: '23:59' }];
    }

    const shopDay = shopOperatingHours.weeklyHours.find(d => d.day === day);
    if (!shopDay || !shopDay.isEnabled) {
      return [];
    }

    return shopDay.intervals;
  }, [shopOperatingHours]);

  const contextValue = useMemo(() => ({
    availability,
    shopOperatingHours,
    isLoading,
    hasUnsavedChanges,
    updateDayAvailability,
    addTimeInterval,
    removeTimeInterval,
    updateTimeInterval,
    toggleDayEnabled,
    copyDaySchedule,
    validateAvailability,
    saveAvailability,
    getConstrainedIntervalsForDay
  }), [
    availability,
    shopOperatingHours,
    isLoading,
    hasUnsavedChanges,
    updateDayAvailability,
    addTimeInterval,
    removeTimeInterval,
    updateTimeInterval,
    toggleDayEnabled,
    copyDaySchedule,
    validateAvailability,
    saveAvailability,
    getConstrainedIntervalsForDay
  ]);

  return contextValue;
});