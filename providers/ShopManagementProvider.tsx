import { useState, useCallback, useMemo, useEffect } from "react";

import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "./AuthProvider";

export interface ShopHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface ShopService {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  category: string;
  isActive: boolean;
}

export interface ShopPhoto {
  id: string;
  url: string;
  type: 'interior' | 'portfolio' | 'team';
  caption?: string;
}

export interface ShopSettings {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
  image?: string;
  hours: ShopHours[];
  services: ShopService[];
  photos: ShopPhoto[];
  holidaySchedule: {
    date: string;
    isClosed: boolean;
    customHours?: { openTime: string; closeTime: string };
    note?: string;
  }[];
  preferences: {
    bookingAdvanceTime: number; // hours
    cancellationPolicy: string;
    depositRequired: boolean;
    depositAmount?: number;
    autoConfirmBookings: boolean;
    allowOnlineBooking: boolean;
    requireClientNotes: boolean;
  };
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopMetrics {
  shopId: string;
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  totalAppointments: number;
  monthlyAppointments: number;
  weeklyAppointments: number;
  averageRating: number;
  totalReviews: number;
  stylistCount: number;
  chairUtilizationRate: number;
  averageTicketSize: number;
  topServices: {
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }[];
  revenueByPeriod: {
    period: string;
    revenue: number;
    appointments: number;
  }[];
}

export const [ShopManagementProvider, useShopManagement] = createContextHook(() => {
  const { user, isDeveloperMode } = useAuth();
  const [shops, setShops] = useState<ShopSettings[]>([]);
  const [shopMetrics, setShopMetrics] = useState<ShopMetrics[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Optimized shop data loading with immediate UI rendering
  useEffect(() => {
    console.log('ShopManagementProvider: Initializing data immediately');
    
    if (!user || user.role !== "owner") {
      setIsLoading(false);
      return;
    }

    // Set loading to false immediately and provide data synchronously
    setIsLoading(false);
    
    try {
      if (isDeveloperMode) {
        // Provide full data immediately - no delays
        const fullShop: ShopSettings = {
          id: "shop-1",
          name: "Downtown Hair Studio",
          address: "123 Main Street",
          city: "New York",
          state: "NY",
          zip: "10001",
          phone: "(212) 555-0123",
          email: "info@downtownhairstudio.com",
          website: "www.downtownhairstudio.com",
          description: "Premium hair salon in the heart of downtown",
          image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
          hours: [
            { day: "Monday", isOpen: false, openTime: "09:00", closeTime: "18:00" },
            { day: "Tuesday", isOpen: true, openTime: "09:00", closeTime: "19:00" },
            { day: "Wednesday", isOpen: true, openTime: "09:00", closeTime: "19:00" },
            { day: "Thursday", isOpen: true, openTime: "09:00", closeTime: "20:00" },
            { day: "Friday", isOpen: true, openTime: "09:00", closeTime: "20:00" },
            { day: "Saturday", isOpen: true, openTime: "08:00", closeTime: "18:00" },
            { day: "Sunday", isOpen: true, openTime: "10:00", closeTime: "17:00" },
          ],
          services: [
            { id: "s1", name: "Haircut & Style", description: "Professional cut and styling", duration: 60, price: 85, category: "Hair", isActive: true },
            { id: "s2", name: "Color & Highlights", description: "Full color service with highlights", duration: 120, price: 150, category: "Color", isActive: true },
            { id: "s3", name: "Blowout", description: "Professional blowout styling", duration: 45, price: 55, category: "Styling", isActive: true },
          ],
          photos: [
            { id: "p1", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400", type: "interior", caption: "Main salon floor" },
            { id: "p2", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400", type: "interior", caption: "Styling stations" },
          ],
          holidaySchedule: [],
          preferences: {
            bookingAdvanceTime: 24,
            cancellationPolicy: "24 hours notice required",
            depositRequired: false,
            autoConfirmBookings: false,
            allowOnlineBooking: true,
            requireClientNotes: false,
          },
          ownerId: user?.id || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const fullMetrics: ShopMetrics = {
          shopId: "shop-1",
          totalRevenue: 45000,
          monthlyRevenue: 12000,
          weeklyRevenue: 3000,
          totalAppointments: 180,
          monthlyAppointments: 48,
          weeklyAppointments: 12,
          averageRating: 4.6,
          totalReviews: 89,
          stylistCount: 4,
          chairUtilizationRate: 75,
          averageTicketSize: 95,
          topServices: fullShop.services.slice(0, 2).map((service, sIndex) => ({
            serviceId: service.id,
            serviceName: service.name,
            count: 25 - (sIndex * 5),
            revenue: service.price * (25 - (sIndex * 5)),
          })),
          revenueByPeriod: [
            { period: "Jan", revenue: 8000, appointments: 32 },
            { period: "Feb", revenue: 9500, appointments: 38 },
            { period: "Mar", revenue: 11000, appointments: 44 },
            { period: "Apr", revenue: 12500, appointments: 50 },
          ],
        };
        
        // Set all data immediately - no async operations
        setShops([fullShop]);
        setShopMetrics([fullMetrics]);
        setSelectedShopId("shop-1");
        
        console.log('ShopManagementProvider: Data loaded immediately');
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading shop data:", error);
      setIsLoading(false);
    }
  }, [user, isDeveloperMode]);

  // Add a new shop
  const addShop = useCallback(async (shopData: Omit<ShopSettings, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    
    try {
      if (!user || user.role !== "owner") {
        throw new Error("Unauthorized");
      }
      
      const newShop: ShopSettings = {
        ...shopData,
        id: `shop-${Date.now()}`,
        ownerId: user?.id || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedShops = [...shops, newShop];
      setShops(updatedShops);
      
      // Initialize metrics for new shop
      const newMetrics: ShopMetrics = {
        shopId: newShop.id,
        totalRevenue: 0,
        monthlyRevenue: 0,
        weeklyRevenue: 0,
        totalAppointments: 0,
        monthlyAppointments: 0,
        weeklyAppointments: 0,
        averageRating: 0,
        totalReviews: 0,
        stylistCount: 0,
        chairUtilizationRate: 0,
        averageTicketSize: 0,
        topServices: [],
        revenueByPeriod: [],
      };
      
      const updatedMetrics = [...shopMetrics, newMetrics];
      setShopMetrics(updatedMetrics);
      
      // Save to storage in live mode
      if (!isDeveloperMode) {
        // TODO: Implement storage through provider
        console.log("Live mode storage not implemented yet");
      }
      
      return newShop;
    } catch (error) {
      console.error("Error adding shop:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [shops, shopMetrics, user, isDeveloperMode]);

  // Update shop settings
  const updateShop = useCallback(async (shopId: string, updates: Partial<Omit<ShopSettings, 'id' | 'ownerId' | 'createdAt'>>) => {
    setIsLoading(true);
    
    try {
      if (!user || user.role !== "owner") {
        throw new Error("Unauthorized");
      }
      
      const updatedShops = shops.map(shop => 
        shop.id === shopId 
          ? { ...shop, ...updates, updatedAt: new Date().toISOString() } 
          : shop
      );
      
      setShops(updatedShops);
      
      // Save to storage in live mode
      if (!isDeveloperMode) {
        // TODO: Implement storage through provider
        console.log("Live mode storage not implemented yet");
      }
      
      return updatedShops.find(shop => shop.id === shopId);
    } catch (error) {
      console.error("Error updating shop:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [shops, user, isDeveloperMode]);

  // Delete shop
  const deleteShop = useCallback(async (shopId: string) => {
    setIsLoading(true);
    
    try {
      if (!user || user.role !== "owner") {
        throw new Error("Unauthorized");
      }
      
      const updatedShops = shops.filter(shop => shop.id !== shopId);
      const updatedMetrics = shopMetrics.filter(metrics => metrics.shopId !== shopId);
      
      setShops(updatedShops);
      setShopMetrics(updatedMetrics);
      
      // Update selected shop if deleted
      if (selectedShopId === shopId) {
        setSelectedShopId(updatedShops[0]?.id || null);
      }
      
      // Save to storage in live mode
      if (!isDeveloperMode) {
        // TODO: Implement storage through provider
        console.log("Live mode storage not implemented yet");
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting shop:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [shops, shopMetrics, selectedShopId, user, isDeveloperMode]);

  // Get shop by ID
  const getShopById = useCallback((shopId: string) => {
    return shops.find(shop => shop.id === shopId);
  }, [shops]);

  // Get metrics by shop ID
  const getMetricsByShopId = useCallback((shopId: string) => {
    return shopMetrics.find(metrics => metrics.shopId === shopId);
  }, [shopMetrics]);

  // Get selected shop
  const selectedShop = useMemo(() => {
    return selectedShopId ? getShopById(selectedShopId) : shops[0];
  }, [selectedShopId, getShopById, shops]);

  // Get selected shop metrics
  const selectedShopMetrics = useMemo(() => {
    return selectedShop ? getMetricsByShopId(selectedShop.id) : null;
  }, [selectedShop, getMetricsByShopId]);

  // Calculate consolidated metrics across all shops
  const consolidatedMetrics = useMemo(() => {
    return shopMetrics.reduce(
      (acc, metrics) => ({
        totalRevenue: acc.totalRevenue + metrics.totalRevenue,
        monthlyRevenue: acc.monthlyRevenue + metrics.monthlyRevenue,
        weeklyRevenue: acc.weeklyRevenue + metrics.weeklyRevenue,
        totalAppointments: acc.totalAppointments + metrics.totalAppointments,
        monthlyAppointments: acc.monthlyAppointments + metrics.monthlyAppointments,
        weeklyAppointments: acc.weeklyAppointments + metrics.weeklyAppointments,
        totalReviews: acc.totalReviews + metrics.totalReviews,
        stylistCount: acc.stylistCount + metrics.stylistCount,
        averageRating: shopMetrics.length > 0 
          ? shopMetrics.reduce((sum, m) => sum + m.averageRating, 0) / shopMetrics.length 
          : 0,
        averageTicketSize: shopMetrics.length > 0 
          ? shopMetrics.reduce((sum, m) => sum + m.averageTicketSize, 0) / shopMetrics.length 
          : 0,
      }),
      {
        totalRevenue: 0,
        monthlyRevenue: 0,
        weeklyRevenue: 0,
        totalAppointments: 0,
        monthlyAppointments: 0,
        weeklyAppointments: 0,
        totalReviews: 0,
        stylistCount: 0,
        averageRating: 0,
        averageTicketSize: 0,
      }
    );
  }, [shopMetrics]);

  return useMemo(() => ({
    shops,
    shopMetrics,
    selectedShopId,
    selectedShop,
    selectedShopMetrics,
    consolidatedMetrics,
    isLoading,
    setSelectedShopId,
    addShop,
    updateShop,
    deleteShop,
    getShopById,
    getMetricsByShopId,
  }), [
    shops,
    shopMetrics,
    selectedShopId,
    selectedShop,
    selectedShopMetrics,
    consolidatedMetrics,
    isLoading,
    setSelectedShopId,
    addShop,
    updateShop,
    deleteShop,
    getShopById,
    getMetricsByShopId,
  ]);
});