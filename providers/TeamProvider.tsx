import { useState, useCallback, useMemo, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "./AuthProvider";

export interface TeamMember {
  id: string;
  name: string;
  role: "stylist" | "manager" | "receptionist";
  shopId: string;
  shopName: string;
  image?: string;
  email: string;
  phone?: string;
  specialties?: string[];
  rating?: number;
  appointmentsToday?: number;
  monthlyRevenue?: number;
  boothRentAmount?: number;
  boothRentDueDate?: string;
  boothRentStatus?: "pending" | "paid" | "overdue";
  boothRentNotes?: string;
  paymentSchedule?: "weekly" | "biweekly" | "monthly";
  autoDeduct?: boolean;
  lateFee?: number;
  gracePeriod?: number;
  lastPaymentDate?: string;
  hourlyRate?: number;
  commissionRate?: number;
  permissions?: string[];
  permissionsUpdatedAt?: string;
  isAvailable?: boolean;
  joinedAt: string;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  stylists?: number;
  monthlyRevenue?: number;
}

export const [TeamProvider, useTeam] = createContextHook(() => {
  const { user, isDeveloperMode } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load team and shop data from storage or mock data
  useEffect(() => {
    const loadTeamData = async () => {
      setIsLoading(true);
      try {
        if (!user) return;
        if (user.role !== "owner") return;

        if (isDeveloperMode) {
          // In developer mode, use mock data
          const ownerShops = user.mockData?.shops || [];
          const ownerTeam = user.mockData?.team || [];
          
          // Format shops
          const formattedShops: Shop[] = ownerShops.map((shop: any) => ({
            id: shop.id,
            name: shop.name,
            address: shop.address,
            phone: shop.phone,
            image: shop.image,
            rating: shop.rating,
            reviewCount: shop.reviewCount,
            stylists: shop.stylists,
            monthlyRevenue: shop.monthlyRevenue,
          }));
          
          setShops(formattedShops);
          
          // Format team members
          const formattedTeam: TeamMember[] = ownerTeam.map((member: any) => {
            const shop = ownerShops.find((s: any) => s.id === member.shopId);
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14) - 7);
            
            return {
              id: member.id,
              name: member.name,
              role: member.role || "stylist",
              shopId: member.shopId,
              shopName: shop?.name || "Unknown Shop",
              image: member.image,
              email: `${member.name.toLowerCase().replace(/\s/g, ".")}@example.com`,
              phone: `212555${Math.floor(1000 + Math.random() * 9000)}`,
              specialties: ["Haircut", "Color", "Styling"].slice(0, Math.floor(Math.random() * 3) + 1),
              rating: member.rating,
              appointmentsToday: member.appointmentsToday,
              monthlyRevenue: member.monthlyRevenue,
              boothRentAmount: Math.floor(Math.random() * 500) + 500,
              boothRentDueDate: dueDate.toISOString(),
              boothRentStatus: dueDate < new Date() ? "overdue" : "pending",
              paymentSchedule: "monthly",
              autoDeduct: false,
              lateFee: 50,
              gracePeriod: 3,
              hourlyRate: Math.floor(Math.random() * 30) + 20,
              commissionRate: Math.floor(Math.random() * 20) + 40,
              permissions: member.role === "manager" 
                ? ["view_calendar", "manage_appointments", "view_clients", "manage_clients", "view_team"]
                : ["view_calendar", "manage_availability", "view_clients", "view_earnings"],
              isAvailable: Math.random() > 0.3, // 70% chance of being available
              joinedAt: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString(), // Random date within the last year
            };
          });
          
          setTeamMembers(formattedTeam);
        } else {
          // In live mode, load from AsyncStorage
          const storedShops = await AsyncStorage.getItem(`shops_${user.id}`);
          if (storedShops) {
            setShops(JSON.parse(storedShops));
          }
          
          const storedTeam = await AsyncStorage.getItem(`team_${user.id}`);
          if (storedTeam) {
            setTeamMembers(JSON.parse(storedTeam));
          }
        }
      } catch (error) {
        console.error("Error loading team data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, [user, isDeveloperMode]);

  // Add a new team member
  const addTeamMember = useCallback(async (memberData: Omit<TeamMember, 'id' | 'joinedAt'>) => {
    setIsLoading(true);
    
    try {
      if (!user) throw new Error("User not authenticated");
      if (user.role !== "owner") throw new Error("Unauthorized");
      
      const newMember: TeamMember = {
        ...memberData,
        id: `member-${Date.now()}`,
        joinedAt: new Date().toISOString(),
      };
      
      const updatedTeam = [...teamMembers, newMember];
      setTeamMembers(updatedTeam);
      
      // In live mode, save to AsyncStorage
      if (!isDeveloperMode) {
        await AsyncStorage.setItem(`team_${user.id}`, JSON.stringify(updatedTeam));
      }
      
      return newMember;
    } catch (error) {
      console.error("Error adding team member:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [teamMembers, user, isDeveloperMode]);

  // Update a team member
  const updateTeamMember = useCallback(async (memberId: string, updates: Partial<Omit<TeamMember, 'id' | 'joinedAt'>>) => {
    setIsLoading(true);
    
    try {
      if (!user) throw new Error("User not authenticated");
      if (user.role !== "owner") throw new Error("Unauthorized");
      
      const updatedTeam = teamMembers.map(member => 
        member.id === memberId 
          ? { ...member, ...updates } 
          : member
      );
      
      setTeamMembers(updatedTeam);
      
      // In live mode, save to AsyncStorage
      if (!isDeveloperMode) {
        await AsyncStorage.setItem(`team_${user.id}`, JSON.stringify(updatedTeam));
      }
      
      return updatedTeam.find(member => member.id === memberId);
    } catch (error) {
      console.error("Error updating team member:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [teamMembers, user, isDeveloperMode]);

  // Remove a team member
  const removeTeamMember = useCallback(async (memberId: string) => {
    setIsLoading(true);
    
    try {
      if (!user) throw new Error("User not authenticated");
      if (user.role !== "owner") throw new Error("Unauthorized");
      
      const updatedTeam = teamMembers.filter(member => member.id !== memberId);
      setTeamMembers(updatedTeam);
      
      // In live mode, save to AsyncStorage
      if (!isDeveloperMode) {
        await AsyncStorage.setItem(`team_${user.id}`, JSON.stringify(updatedTeam));
      }
      
      return true;
    } catch (error) {
      console.error("Error removing team member:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [teamMembers, user, isDeveloperMode]);

  // Add a new shop
  const addShop = useCallback(async (shopData: Omit<Shop, 'id'>) => {
    setIsLoading(true);
    
    try {
      if (!user) throw new Error("User not authenticated");
      if (user.role !== "owner") throw new Error("Unauthorized");
      
      const newShop: Shop = {
        ...shopData,
        id: `shop-${Date.now()}`,
      };
      
      const updatedShops = [...shops, newShop];
      setShops(updatedShops);
      
      // In live mode, save to AsyncStorage
      if (!isDeveloperMode) {
        await AsyncStorage.setItem(`shops_${user.id}`, JSON.stringify(updatedShops));
      }
      
      return newShop;
    } catch (error) {
      console.error("Error adding shop:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [shops, user, isDeveloperMode]);

  // Update a shop
  const updateShop = useCallback(async (shopId: string, updates: Partial<Omit<Shop, 'id'>>) => {
    setIsLoading(true);
    
    try {
      if (!user) throw new Error("User not authenticated");
      if (user.role !== "owner") throw new Error("Unauthorized");
      
      const updatedShops = shops.map(shop => 
        shop.id === shopId 
          ? { ...shop, ...updates } 
          : shop
      );
      
      setShops(updatedShops);
      
      // In live mode, save to AsyncStorage
      if (!isDeveloperMode) {
        await AsyncStorage.setItem(`shops_${user.id}`, JSON.stringify(updatedShops));
      }
      
      return updatedShops.find(shop => shop.id === shopId);
    } catch (error) {
      console.error("Error updating shop:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [shops, user, isDeveloperMode]);

  // Remove a shop
  const removeShop = useCallback(async (shopId: string) => {
    setIsLoading(true);
    
    try {
      if (!user) throw new Error("User not authenticated");
      if (user.role !== "owner") throw new Error("Unauthorized");
      
      // Check if there are team members assigned to this shop
      const hasTeamMembers = teamMembers.some(member => member.shopId === shopId);
      if (hasTeamMembers) {
        throw new Error("Cannot remove shop with assigned team members");
      }
      
      const updatedShops = shops.filter(shop => shop.id !== shopId);
      setShops(updatedShops);
      
      // In live mode, save to AsyncStorage
      if (!isDeveloperMode) {
        await AsyncStorage.setItem(`shops_${user.id}`, JSON.stringify(updatedShops));
      }
      
      return true;
    } catch (error) {
      console.error("Error removing shop:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [shops, teamMembers, user, isDeveloperMode]);

  // Get team members for a specific shop
  const getTeamByShop = useCallback((shopId: string) => {
    return teamMembers.filter(member => member.shopId === shopId);
  }, [teamMembers]);

  return useMemo(() => ({
    teamMembers,
    shops,
    isLoading,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    addShop,
    updateShop,
    removeShop,
    getTeamByShop,
  }), [
    teamMembers,
    shops,
    isLoading,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    addShop,
    updateShop,
    removeShop,
    getTeamByShop,
  ]);
});