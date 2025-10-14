import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

const SAVED_PROVIDERS_KEY = "saved_providers";

export const [SavedProvidersProvider, useSavedProviders] = createContextHook(() => {
  const [savedProviders, setSavedProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSavedProviders();
  }, []);

  const loadSavedProviders = async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_PROVIDERS_KEY);
      if (saved) {
        setSavedProviders(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading saved providers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSavedProviders = async (providers: string[]) => {
    try {
      await AsyncStorage.setItem(SAVED_PROVIDERS_KEY, JSON.stringify(providers));
    } catch (error) {
      console.error("Error saving providers:", error);
    }
  };

  const toggleSavedProvider = useCallback((providerId: string) => {
    const newSavedProviders = savedProviders.includes(providerId)
      ? savedProviders.filter(id => id !== providerId)
      : [...savedProviders, providerId];
    
    setSavedProviders(newSavedProviders);
    saveSavedProviders(newSavedProviders);
  }, [savedProviders]);

  const isProviderSaved = useCallback((providerId: string) => {
    return savedProviders.includes(providerId);
  }, [savedProviders]);

  return useMemo(() => ({
    savedProviders,
    isLoading,
    toggleSavedProvider,
    isProviderSaved,
  }), [savedProviders, isLoading, toggleSavedProvider, isProviderSaved]);
});