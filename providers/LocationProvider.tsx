import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

// Types
export type LocationType = 'shop' | 'mobile' | 'home';
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type TimeSlot = {
  open: string;
  close: string;
};

export type BusinessHours = {
  [key in DayOfWeek]: {
    isOpen: boolean;
    hours: TimeSlot;
  };
};

export type LocationData = {
  locationType: LocationType;
  shopName: string;
  streetAddress: string;
  unit: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  businessHours: BusinessHours;
};

const defaultBusinessHours: BusinessHours = {
  Sunday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Monday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Tuesday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Wednesday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Thursday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Friday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
  Saturday: { isOpen: false, hours: { open: '9:00 AM', close: '6:00 PM' } },
};

export const defaultLocationData: LocationData = {
  locationType: 'shop',
  shopName: '',
  streetAddress: '',
  unit: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  businessHours: defaultBusinessHours,
};

export const [LocationProvider, useLocation] = createContextHook(() => {
  const [locationData, setLocationData] = useState<LocationData>(defaultLocationData);
  const [isLoading, setIsLoading] = useState(true);

  // Load location data from storage on mount
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('providerLocationData');
        if (storedData) {
          setLocationData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading location data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocationData();
  }, []);

  // Save location data to storage whenever it changes
  const saveLocationData = useCallback(async (data: LocationData) => {
    if (!data) return false;
    
    try {
      setLocationData(data);
      await AsyncStorage.setItem('providerLocationData', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving location data:', error);
      return false;
    }
  }, []);

  // Update specific fields in location data
  const updateLocationField = useCallback(async <K extends keyof LocationData>(
    field: K, 
    value: LocationData[K]
  ) => {
    const updatedData = {
      ...locationData,
      [field]: value,
    };
    return saveLocationData(updatedData);
  }, [locationData, saveLocationData]);

  // Toggle a specific day's open/closed status
  const toggleDayStatus = useCallback(async (day: DayOfWeek) => {
    if (!day) return false;
    
    const updatedHours = {
      ...locationData.businessHours,
      [day]: {
        ...locationData.businessHours[day],
        isOpen: !locationData.businessHours[day].isOpen,
      },
    };
    
    return updateLocationField('businessHours', updatedHours);
  }, [locationData, updateLocationField]);

  // Update a specific day's hours
  const updateDayHours = useCallback(async (
    day: DayOfWeek, 
    timeType: 'open' | 'close', 
    time: string
  ) => {
    if (!day || !timeType || !time) return false;
    
    const updatedHours = {
      ...locationData.businessHours,
      [day]: {
        ...locationData.businessHours[day],
        hours: {
          ...locationData.businessHours[day].hours,
          [timeType]: time,
        },
      },
    };
    
    return updateLocationField('businessHours', updatedHours);
  }, [locationData, updateLocationField]);

  // Reset location data to defaults
  const resetLocationData = useCallback(async () => {
    return saveLocationData(defaultLocationData);
  }, [saveLocationData]);

  // Format address for display
  const getFormattedAddress = useCallback(() => {
    const parts = [];
    
    if (locationData.shopName) {
      parts.push(locationData.shopName);
    }
    
    if (locationData.streetAddress) {
      parts.push(locationData.streetAddress);
    }
    
    if (locationData.unit) {
      parts.push(locationData.unit);
    }
    
    const cityStateZip = [
      locationData.city,
      locationData.state,
      locationData.zipCode,
    ].filter(Boolean).join(', ');
    
    if (cityStateZip) {
      parts.push(cityStateZip);
    }
    
    if (locationData.country) {
      parts.push(locationData.country);
    }
    
    return parts.join('\n');
  }, [locationData]);

  // Get business hours summary for display
  const getBusinessHoursSummary = useCallback(() => {
    const daysWithHours = Object.entries(locationData.businessHours)
      .filter(([_, data]) => data.isOpen)
      .map(([day, data]) => ({
        day: day as DayOfWeek,
        hours: `${data.hours.open} - ${data.hours.close}`,
      }));
    
    if (daysWithHours.length === 0) {
      return 'No business hours set';
    }
    
    return daysWithHours.map(({ day, hours }) => `${day}: ${hours}`).join('\n');
  }, [locationData]);

  return useMemo(() => ({
    locationData,
    isLoading,
    saveLocationData,
    updateLocationField,
    toggleDayStatus,
    updateDayHours,
    resetLocationData,
    getFormattedAddress,
    getBusinessHoursSummary,
  }), [
    locationData, 
    isLoading, 
    saveLocationData, 
    updateLocationField, 
    toggleDayStatus, 
    updateDayHours, 
    resetLocationData, 
    getFormattedAddress, 
    getBusinessHoursSummary
  ]);
});

export default LocationProvider;