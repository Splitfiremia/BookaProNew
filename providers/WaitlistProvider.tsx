import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "@/providers/AuthProvider";

export interface WaitlistEntry {
  id: string;
  shopId: string;
  clientId: string;
  clientName: string;
  partySize: number;
  status: 'waiting' | 'ready' | 'cancelled';
  joinTime: string;
  estimatedWait: number; // in minutes
  notifiedAt?: string;
}

interface WaitlistState {
  entries: WaitlistEntry[];
  isLoading: boolean;
}

interface WaitlistContextValue {
  entries: WaitlistEntry[];
  isLoading: boolean;
  joinWaitlist: (shopId: string, partySize: number) => Promise<WaitlistEntry | null>;
  leaveWaitlist: (entryId: string) => Promise<void>;
  markReady: (entryId: string) => Promise<void>;
  markCancelled: (entryId: string) => Promise<void>;
  getShopWaitlist: (shopId: string) => WaitlistEntry[];
  getUserWaitlistEntry: (shopId: string) => WaitlistEntry | null;
  getEstimatedWaitTime: (shopId: string, partySize: number) => number;
  updateEstimatedWait: (entryId: string, estimatedWait: number) => Promise<void>;
}

const STORAGE_KEY = "waitlist_entries";

// Mock function to calculate estimated wait time based on current queue
const calculateEstimatedWait = (currentEntries: WaitlistEntry[], partySize: number): number => {
  const waitingEntries = currentEntries.filter(entry => entry.status === 'waiting');
  
  // Base wait time: 15 minutes per party ahead in queue
  const baseWaitTime = waitingEntries.length * 15;
  
  // Add extra time for larger parties (5 minutes per additional person)
  const partySizeMultiplier = Math.max(1, partySize - 1) * 5;
  
  // Add some randomness to make it more realistic (±10 minutes)
  const randomVariation = Math.floor(Math.random() * 21) - 10;
  
  return Math.max(10, baseWaitTime + partySizeMultiplier + randomVariation);
};

export const [WaitlistProvider, useWaitlist] = createContextHook(() => {
  const { user } = useAuth();
  const [waitlistState, setWaitlistState] = useState<WaitlistState>({
    entries: [],
    isLoading: true,
  });

  // Load waitlist data from AsyncStorage on mount
  useEffect(() => {
    const loadWaitlistData = async () => {
      try {
        console.log('WaitlistProvider: Loading waitlist data');
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        const entries = storedData ? JSON.parse(storedData) as WaitlistEntry[] : [];
        
        // Filter out old entries (older than 24 hours)
        const now = new Date();
        const validEntries = entries.filter(entry => {
          const entryTime = new Date(entry.joinTime);
          const hoursDiff = (now.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
          return hoursDiff < 24;
        });
        
        console.log('WaitlistProvider: Loaded waitlist entries:', validEntries.length);
        setWaitlistState({ entries: validEntries, isLoading: false });
        
        // Save cleaned data back if we removed old entries
        if (validEntries.length !== entries.length) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validEntries));
        }
      } catch (error) {
        console.error('WaitlistProvider: Error loading waitlist data:', error);
        setWaitlistState({ entries: [], isLoading: false });
      }
    };

    loadWaitlistData();
  }, []);

  // Save waitlist data to AsyncStorage
  const saveWaitlistData = useCallback(async (entries: WaitlistEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      console.log('WaitlistProvider: Saved waitlist data');
    } catch (error) {
      console.error('WaitlistProvider: Error saving waitlist data:', error);
    }
  }, []);

  // Join waitlist
  const joinWaitlist = useCallback(async (shopId: string, partySize: number): Promise<WaitlistEntry | null> => {
    if (!user?.id) {
      console.warn('WaitlistProvider: Cannot join waitlist - user not authenticated');
      return null;
    }

    // Check if user is already on waitlist for this shop
    const existingEntry = waitlistState.entries.find(
      entry => entry.shopId === shopId && entry.clientId === user.id && entry.status === 'waiting'
    );

    if (existingEntry) {
      console.log('WaitlistProvider: User already on waitlist for shop:', shopId);
      return existingEntry;
    }

    try {
      console.log('WaitlistProvider: Joining waitlist for shop:', shopId, 'party size:', partySize);
      
      const shopEntries = waitlistState.entries.filter(entry => entry.shopId === shopId);
      const estimatedWait = calculateEstimatedWait(shopEntries, partySize);
      
      const newEntry: WaitlistEntry = {
        id: Date.now().toString(),
        shopId,
        clientId: user.id,
        clientName: user.name || 'Unknown User',
        partySize,
        status: 'waiting',
        joinTime: new Date().toISOString(),
        estimatedWait,
      };
      
      const updatedEntries = [...waitlistState.entries, newEntry];
      
      setWaitlistState(prev => ({
        ...prev,
        entries: updatedEntries,
      }));
      
      await saveWaitlistData(updatedEntries);
      console.log('WaitlistProvider: Successfully joined waitlist');
      return newEntry;
    } catch (error) {
      console.error('WaitlistProvider: Error joining waitlist:', error);
      return null;
    }
  }, [user, waitlistState.entries, saveWaitlistData]);

  // Leave waitlist
  const leaveWaitlist = useCallback(async (entryId: string) => {
    try {
      console.log('WaitlistProvider: Leaving waitlist:', entryId);
      const updatedEntries = waitlistState.entries.filter(entry => entry.id !== entryId);
      
      setWaitlistState(prev => ({
        ...prev,
        entries: updatedEntries,
      }));
      
      await saveWaitlistData(updatedEntries);
      console.log('WaitlistProvider: Successfully left waitlist');
    } catch (error) {
      console.error('WaitlistProvider: Error leaving waitlist:', error);
    }
  }, [waitlistState.entries, saveWaitlistData]);

  // Mark entry as ready (for shop owners)
  const markReady = useCallback(async (entryId: string) => {
    try {
      console.log('WaitlistProvider: Marking entry as ready:', entryId);
      const updatedEntries = waitlistState.entries.map(entry => 
        entry.id === entryId 
          ? { ...entry, status: 'ready' as const, notifiedAt: new Date().toISOString() }
          : entry
      );
      
      setWaitlistState(prev => ({
        ...prev,
        entries: updatedEntries,
      }));
      
      await saveWaitlistData(updatedEntries);
      console.log('WaitlistProvider: Successfully marked entry as ready');
    } catch (error) {
      console.error('WaitlistProvider: Error marking entry as ready:', error);
    }
  }, [waitlistState.entries, saveWaitlistData]);

  // Mark entry as cancelled
  const markCancelled = useCallback(async (entryId: string) => {
    try {
      console.log('WaitlistProvider: Marking entry as cancelled:', entryId);
      const updatedEntries = waitlistState.entries.map(entry => 
        entry.id === entryId 
          ? { ...entry, status: 'cancelled' as const }
          : entry
      );
      
      setWaitlistState(prev => ({
        ...prev,
        entries: updatedEntries,
      }));
      
      await saveWaitlistData(updatedEntries);
      console.log('WaitlistProvider: Successfully marked entry as cancelled');
    } catch (error) {
      console.error('WaitlistProvider: Error marking entry as cancelled:', error);
    }
  }, [waitlistState.entries, saveWaitlistData]);

  // Get waitlist for a specific shop
  const getShopWaitlist = useCallback((shopId: string) => {
    return waitlistState.entries
      .filter(entry => entry.shopId === shopId)
      .sort((a, b) => new Date(a.joinTime).getTime() - new Date(b.joinTime).getTime());
  }, [waitlistState.entries]);

  // Get user's waitlist entry for a specific shop
  const getUserWaitlistEntry = useCallback((shopId: string) => {
    if (!user?.id) return null;
    
    return waitlistState.entries.find(
      entry => entry.shopId === shopId && entry.clientId === user.id && entry.status !== 'cancelled'
    ) || null;
  }, [waitlistState.entries, user?.id]);

  // Get estimated wait time for joining a shop's waitlist
  const getEstimatedWaitTime = useCallback((shopId: string, partySize: number) => {
    const shopEntries = waitlistState.entries.filter(entry => entry.shopId === shopId);
    return calculateEstimatedWait(shopEntries, partySize);
  }, [waitlistState.entries]);

  // Update estimated wait time for an entry
  const updateEstimatedWait = useCallback(async (entryId: string, estimatedWait: number) => {
    try {
      console.log('WaitlistProvider: Updating estimated wait for entry:', entryId, 'to:', estimatedWait);
      const updatedEntries = waitlistState.entries.map(entry => 
        entry.id === entryId 
          ? { ...entry, estimatedWait }
          : entry
      );
      
      setWaitlistState(prev => ({
        ...prev,
        entries: updatedEntries,
      }));
      
      await saveWaitlistData(updatedEntries);
      console.log('WaitlistProvider: Successfully updated estimated wait');
    } catch (error) {
      console.error('WaitlistProvider: Error updating estimated wait:', error);
    }
  }, [waitlistState.entries, saveWaitlistData]);

  const contextValue = useMemo((): WaitlistContextValue => ({
    entries: waitlistState.entries,
    isLoading: waitlistState.isLoading,
    joinWaitlist,
    leaveWaitlist,
    markReady,
    markCancelled,
    getShopWaitlist,
    getUserWaitlistEntry,
    getEstimatedWaitTime,
    updateEstimatedWait,
  }), [waitlistState, joinWaitlist, leaveWaitlist, markReady, markCancelled, getShopWaitlist, getUserWaitlistEntry, getEstimatedWaitTime, updateEstimatedWait]);

  return contextValue;
});