import { useState, useCallback, useMemo, useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "./AuthProvider";

export interface BusinessMetrics {
  totalAppointments: number;
  completedAppointments: number;
  chairUtilizationRate: number;
  hoursWorked: number;
  averageTicketSize: number;
  averageTipPercentage: number;
  clientRetentionRate: number;
  repeatBookings: number;
  newClients: number;
  peakHours: {
    hour: string;
    appointmentCount: number;
  }[];
  busyDays: {
    day: string;
    appointmentCount: number;
  }[];
}

export interface EarningsData {
  totalRevenue: number;
  serviceRevenue: number;
  tipRevenue: number;
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  projectedRevenue: number;
  weekOverWeekGrowth: number;
  monthOverMonthGrowth: number;
  revenueByPeriod: {
    period: string;
    serviceRevenue: number;
    tipRevenue: number;
    totalRevenue: number;
  }[];
}

export interface ServiceAnalytics {
  name: string;
  count: number;
  revenue: number;
  averagePrice: number;
  popularityRank: number;
  growthRate: number;
}

export interface AnalyticsData {
  earnings: EarningsData;
  metrics: BusinessMetrics;
  topServices: ServiceAnalytics[];
  averageRating: number;
  appointmentsByStatus: {
    status: string;
    count: number;
  }[];
}

export interface ShopAnalytics extends AnalyticsData {
  id: string;
  name: string;
  stylists: number;
  totalRevenue: number;
  totalAppointments: number;
  revenueByPeriod: {
    period: string;
    revenue: number;
  }[];
}

export interface StylistAnalytics extends AnalyticsData {
  id: string;
  name: string;
  shopId: string;
  shopName: string;
  appointmentsToday: number;
  totalRevenue: number;
  totalAppointments: number;
  revenueByPeriod: {
    period: string;
    revenue: number;
  }[];
}

export interface BoothRentStatus {
  id: string;
  stylistId: string;
  stylistName: string;
  shopId: string;
  shopName: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  paymentDate?: string;
  rentType: "fixed" | "percentage";
  percentageRate?: number;
  autoDeduct: boolean;
  lastReminderSent?: string;
  reminderCount: number;
  lateFee?: number;
  gracePeriodDays: number;
}

export interface RentCalculationSettings {
  id: string;
  stylistId: string;
  rentType: "fixed" | "percentage";
  fixedAmount?: number;
  percentageRate?: number;
  autoDeduct: boolean;
  paymentSchedule: "weekly" | "biweekly" | "monthly";
  lateFeeAmount: number;
  gracePeriodDays: number;
  reminderSchedule: number[]; // Days before due date to send reminders
  isActive: boolean;
}

export interface RentReminder {
  id: string;
  rentId: string;
  stylistId: string;
  type: "upcoming" | "due" | "overdue";
  sentDate: string;
  method: "email" | "sms" | "push";
  status: "sent" | "delivered" | "failed";
}

export const [AnalyticsProvider, useAnalytics] = createContextHook(() => {
  const { user, isDeveloperMode } = useAuth();
  const [ownerAnalytics, setOwnerAnalytics] = useState<ShopAnalytics[]>([]);
  const [stylistAnalytics, setStylistAnalytics] = useState<StylistAnalytics[]>([]);
  const [boothRentStatus, setBoothRentStatus] = useState<BoothRentStatus[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Generate comprehensive mock analytics data
  const generateMockAnalytics = (userRole: string, userData: any) => {
    const baseRevenue = userRole === "owner" ? 15000 : 4500;
    const baseAppointments = userRole === "owner" ? 120 : 45;
    
    const earnings: EarningsData = {
      totalRevenue: baseRevenue + Math.floor(Math.random() * 5000),
      serviceRevenue: (baseRevenue * 0.75) + Math.floor(Math.random() * 2000),
      tipRevenue: (baseRevenue * 0.25) + Math.floor(Math.random() * 1000),
      dailyEarnings: Math.floor(Math.random() * 300) + 150,
      weeklyEarnings: Math.floor(Math.random() * 2000) + 1000,
      monthlyEarnings: baseRevenue + Math.floor(Math.random() * 3000),
      projectedRevenue: (baseRevenue * 1.15) + Math.floor(Math.random() * 2000),
      weekOverWeekGrowth: (Math.random() * 20) - 5, // -5% to +15%
      monthOverMonthGrowth: (Math.random() * 25) - 10, // -10% to +15%
      revenueByPeriod: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          period: date.toISOString().split('T')[0],
          serviceRevenue: Math.floor(Math.random() * 200) + 100,
          tipRevenue: Math.floor(Math.random() * 80) + 20,
          totalRevenue: Math.floor(Math.random() * 280) + 120,
        };
      }),
    };

    const metrics: BusinessMetrics = {
      totalAppointments: baseAppointments + Math.floor(Math.random() * 30),
      completedAppointments: Math.floor((baseAppointments + Math.floor(Math.random() * 30)) * 0.85),
      chairUtilizationRate: Math.floor(Math.random() * 30) + 65, // 65-95%
      hoursWorked: Math.floor(Math.random() * 20) + 35, // 35-55 hours
      averageTicketSize: Math.floor(Math.random() * 50) + 75, // $75-125
      averageTipPercentage: Math.floor(Math.random() * 10) + 18, // 18-28%
      clientRetentionRate: Math.floor(Math.random() * 20) + 70, // 70-90%
      repeatBookings: Math.floor(Math.random() * 20) + 25, // 25-45
      newClients: Math.floor(Math.random() * 15) + 8, // 8-23
      peakHours: [
        { hour: "10:00 AM", appointmentCount: Math.floor(Math.random() * 5) + 3 },
        { hour: "11:00 AM", appointmentCount: Math.floor(Math.random() * 8) + 5 },
        { hour: "12:00 PM", appointmentCount: Math.floor(Math.random() * 10) + 8 },
        { hour: "1:00 PM", appointmentCount: Math.floor(Math.random() * 12) + 10 },
        { hour: "2:00 PM", appointmentCount: Math.floor(Math.random() * 15) + 12 },
        { hour: "3:00 PM", appointmentCount: Math.floor(Math.random() * 12) + 10 },
        { hour: "4:00 PM", appointmentCount: Math.floor(Math.random() * 10) + 8 },
        { hour: "5:00 PM", appointmentCount: Math.floor(Math.random() * 8) + 6 },
        { hour: "6:00 PM", appointmentCount: Math.floor(Math.random() * 6) + 4 },
      ],
      busyDays: [
        { day: "Monday", appointmentCount: Math.floor(Math.random() * 8) + 5 },
        { day: "Tuesday", appointmentCount: Math.floor(Math.random() * 10) + 8 },
        { day: "Wednesday", appointmentCount: Math.floor(Math.random() * 12) + 10 },
        { day: "Thursday", appointmentCount: Math.floor(Math.random() * 15) + 12 },
        { day: "Friday", appointmentCount: Math.floor(Math.random() * 18) + 15 },
        { day: "Saturday", appointmentCount: Math.floor(Math.random() * 20) + 18 },
        { day: "Sunday", appointmentCount: Math.floor(Math.random() * 6) + 3 },
      ],
    };

    const topServices: ServiceAnalytics[] = [
      {
        name: "Haircut",
        count: Math.floor(Math.random() * 30) + 20,
        revenue: Math.floor(Math.random() * 2000) + 1500,
        averagePrice: 65,
        popularityRank: 1,
        growthRate: Math.floor(Math.random() * 20) + 5,
      },
      {
        name: "Color & Highlights",
        count: Math.floor(Math.random() * 20) + 15,
        revenue: Math.floor(Math.random() * 3000) + 2000,
        averagePrice: 150,
        popularityRank: 2,
        growthRate: Math.floor(Math.random() * 15) + 8,
      },
      {
        name: "Blowout & Style",
        count: Math.floor(Math.random() * 25) + 10,
        revenue: Math.floor(Math.random() * 1500) + 800,
        averagePrice: 55,
        popularityRank: 3,
        growthRate: Math.floor(Math.random() * 12) + 3,
      },
      {
        name: "Beard Trim",
        count: Math.floor(Math.random() * 15) + 8,
        revenue: Math.floor(Math.random() * 800) + 400,
        averagePrice: 35,
        popularityRank: 4,
        growthRate: Math.floor(Math.random() * 10) + 2,
      },
      {
        name: "Hair Treatment",
        count: Math.floor(Math.random() * 12) + 5,
        revenue: Math.floor(Math.random() * 1200) + 600,
        averagePrice: 85,
        popularityRank: 5,
        growthRate: Math.floor(Math.random() * 18) + 10,
      },
    ];

    return {
      earnings,
      metrics,
      topServices,
      averageRating: parseFloat((4.2 + Math.random() * 0.7).toFixed(1)),
      appointmentsByStatus: [
        { status: "Completed", count: Math.floor(Math.random() * 40) + 30 },
        { status: "Confirmed", count: Math.floor(Math.random() * 15) + 8 },
        { status: "Pending", count: Math.floor(Math.random() * 10) + 3 },
        { status: "Cancelled", count: Math.floor(Math.random() * 5) + 1 },
      ],
    };
  };

  // Load analytics data from storage or mock data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Set loading to false immediately to prevent blocking UI
      setIsLoading(false);
      
      try {
        if (isDeveloperMode) {
          // In developer mode, use minimal mock data for fast loading
          if (user.role === "owner") {
            // For owners, load minimal shop analytics immediately
            const ownerShops = user.mockData?.shops || [{ id: 'shop-1', name: 'Default Shop' }];
            const ownerTeam = user.mockData?.team || [];
            
            // Create minimal analytics data for immediate display
            const quickShopAnalytics: ShopAnalytics[] = ownerShops.slice(0, 1).map((shop: any) => {
              const mockData = generateMockAnalytics("owner", user.mockData);
              
              return {
                id: shop.id,
                name: shop.name,
                stylists: 4,
                ...mockData,
                totalRevenue: mockData.earnings.totalRevenue,
                totalAppointments: mockData.metrics.totalAppointments,
                revenueByPeriod: [
                  { period: 'Mon', revenue: 800 },
                  { period: 'Tue', revenue: 950 },
                  { period: 'Wed', revenue: 1100 },
                  { period: 'Thu', revenue: 1250 },
                  { period: 'Fri', revenue: 1400 },
                  { period: 'Sat', revenue: 1600 },
                  { period: 'Sun', revenue: 900 },
                ],
              };
            });
            
            setOwnerAnalytics(quickShopAnalytics);
            
            // Set minimal booth rent status
            const quickRentStatus: BoothRentStatus[] = ownerTeam.slice(0, 3).map((member: any, index: number) => {
              const dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + (index * 3) - 3);
              
              return {
                id: `rent-${member.id || index}`,
                stylistId: member.id || `stylist-${index}`,
                stylistName: member.name || `Stylist ${index + 1}`,
                shopId: 'shop-1',
                shopName: 'Default Shop',
                amount: 500 + (index * 100),
                dueDate: dueDate.toISOString(),
                status: index === 0 ? "overdue" : "pending",
                rentType: "fixed",
                autoDeduct: index % 2 === 0,
                reminderCount: index,
                gracePeriodDays: 3,
              };
            });
            
            setBoothRentStatus(quickRentStatus);
            
            // Load full data asynchronously without blocking UI
            setTimeout(() => {
              const fullShopAnalytics: ShopAnalytics[] = ownerShops.map((shop: any) => {
                const shopStylists = ownerTeam.filter((member: any) => member.shopId === shop.id);
                const mockData = generateMockAnalytics("owner", user.mockData);
                
                return {
                  id: shop.id,
                  name: shop.name,
                  stylists: shopStylists.length,
                  ...mockData,
                  totalRevenue: mockData.earnings.totalRevenue,
                  totalAppointments: mockData.metrics.totalAppointments,
                  revenueByPeriod: mockData.earnings.revenueByPeriod.slice(-7).map(item => ({
                    period: new Date(item.period).toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: item.totalRevenue,
                  })),
                };
              });
              
              setOwnerAnalytics(fullShopAnalytics);
              
              // Generate full booth rent status for team members
              const fullRentStatus: BoothRentStatus[] = ownerTeam.map((member: any) => {
                const shop = ownerShops.find((s: any) => s.id === member.shopId);
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14) - 7);
                
                const rentType = Math.random() > 0.5 ? "fixed" : "percentage";
                const baseAmount = Math.floor(Math.random() * 500) + 500;
                
                return {
                  id: `rent-${member.id}`,
                  stylistId: member.id,
                  stylistName: member.name,
                  shopId: member.shopId,
                  shopName: shop?.name || "Unknown Shop",
                  amount: baseAmount,
                  dueDate: dueDate.toISOString(),
                  status: dueDate < new Date() ? "overdue" : "pending",
                  rentType,
                  percentageRate: rentType === "percentage" ? Math.floor(Math.random() * 10) + 15 : undefined,
                  autoDeduct: Math.random() > 0.6,
                  lastReminderSent: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
                  reminderCount: Math.floor(Math.random() * 3),
                  lateFee: Math.random() > 0.7 ? Math.floor(Math.random() * 100) + 25 : undefined,
                  gracePeriodDays: Math.floor(Math.random() * 5) + 1,
                };
              });
              
              setBoothRentStatus(fullRentStatus);
            }, 100);
          } else if (user.role === "provider") {
            // For stylists, load their analytics
            const stylistProfile = user.mockData?.profile || {};

            const mockData = generateMockAnalytics("stylist", user.mockData);
            
            const stylistData: StylistAnalytics = {
              id: user.id || "stylist-1",
              name: user.name,
              shopId: "shop-1",
              shopName: stylistProfile.shopName || "Style Studio",
              appointmentsToday: Math.floor(Math.random() * 8) + 1,
              ...mockData,
              totalRevenue: mockData.earnings.totalRevenue,
              totalAppointments: mockData.metrics.totalAppointments,
              revenueByPeriod: mockData.earnings.revenueByPeriod.slice(-7).map(item => ({
                period: new Date(item.period).toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: item.totalRevenue,
              })),
            };
            
            setStylistAnalytics([stylistData]);
            
            // Generate booth rent status for stylist
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14) - 7);
            
            const rentType = Math.random() > 0.5 ? "fixed" : "percentage";
            const baseAmount = Math.floor(Math.random() * 500) + 500;
            
            setBoothRentStatus([{
              id: `rent-${user.id}`,
              stylistId: user.id || "stylist-1",
              stylistName: user.name,
              shopId: "shop-1",
              shopName: stylistProfile.shopName || "Style Studio",
              amount: baseAmount,
              dueDate: dueDate.toISOString(),
              status: dueDate < new Date() ? "overdue" : "pending",
              rentType,
              percentageRate: rentType === "percentage" ? Math.floor(Math.random() * 10) + 15 : undefined,
              autoDeduct: Math.random() > 0.6,
              lastReminderSent: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
              reminderCount: Math.floor(Math.random() * 3),
              lateFee: Math.random() > 0.7 ? Math.floor(Math.random() * 100) + 25 : undefined,
              gracePeriodDays: Math.floor(Math.random() * 5) + 1,
            }]);
          }
        } else {
          // In live mode, load from storage (would use AsyncStorage in real app)
          console.log("Live mode analytics loading not implemented yet");
        }
      } catch (error) {
        console.error("Error loading analytics data:", error);
        setIsLoading(false);
      }
    };

    // Use setTimeout to prevent blocking the main thread
    const timeoutId = setTimeout(loadAnalyticsData, 0);
    return () => clearTimeout(timeoutId);
  }, [user, isDeveloperMode]);

  // Update booth rent status
  const updateBoothRentStatus = useCallback(async (rentId: string, status: "pending" | "paid" | "overdue", paymentDate?: string) => {
    setIsLoading(true);
    
    try {
      if (!user) throw new Error("User not authenticated");
      if (user.role !== "owner" && user.role !== "provider") throw new Error("Unauthorized");
      
      const updatedRentStatus = boothRentStatus.map(rent => {
        if (rent.id === rentId) {
          const updatedRent = { ...rent, status, paymentDate: paymentDate || rent.paymentDate };
          
          // If marking as paid, calculate next due date based on payment schedule
          if (status === "paid") {
            const nextDueDate = new Date(rent.dueDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1); // Default to monthly
            updatedRent.dueDate = nextDueDate.toISOString();
            updatedRent.reminderCount = 0;
            updatedRent.lastReminderSent = undefined;
          }
          
          return updatedRent;
        }
        return rent;
      });
      
      setBoothRentStatus(updatedRentStatus);
      
      // In live mode, save to storage (would use AsyncStorage in real app)
      if (!isDeveloperMode) {
        console.log("Live mode storage not implemented yet");
      }
      
      return updatedRentStatus.find(rent => rent.id === rentId);
    } catch (error) {
      console.error("Error updating booth rent status:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [boothRentStatus, user, isDeveloperMode]);
  
  // Send payment reminder
  const sendPaymentReminder = useCallback(async (rentId: string, reminderType: "upcoming" | "due" | "overdue") => {
    setIsLoading(true);
    
    try {
      if (!user) throw new Error("User not authenticated");
      if (user.role !== "owner") throw new Error("Unauthorized");
      
      const updatedRentStatus = boothRentStatus.map(rent => {
        if (rent.id === rentId) {
          return {
            ...rent,
            lastReminderSent: new Date().toISOString(),
            reminderCount: rent.reminderCount + 1,
          };
        }
        return rent;
      });
      
      setBoothRentStatus(updatedRentStatus);
      
      // In a real app, this would send actual notifications
      console.log(`${reminderType} reminder sent for rent ${rentId}`);
      
      return true;
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [boothRentStatus, user]);
  
  // Calculate automated rent based on revenue
  const calculateAutomatedRent = useCallback(async (stylistId: string, revenueAmount: number) => {
    try {
      const rent = boothRentStatus.find(r => r.stylistId === stylistId);
      if (!rent) throw new Error("Rent record not found");
      
      let calculatedAmount = rent.amount;
      
      if (rent.rentType === "percentage" && rent.percentageRate) {
        calculatedAmount = Math.round(revenueAmount * (rent.percentageRate / 100));
      }
      
      // Add late fee if overdue
      if (rent.status === "overdue" && rent.lateFee) {
        calculatedAmount += rent.lateFee;
      }
      
      return calculatedAmount;
    } catch (error) {
      console.error("Error calculating automated rent:", error);
      throw error;
    }
  }, [boothRentStatus]);
  
  // Process automated rent collection
  const processAutomatedCollection = useCallback(async () => {
    try {
      if (!user || user.role !== "owner") throw new Error("Unauthorized");
      
      const autoDeductRents = boothRentStatus.filter(rent => 
        rent.autoDeduct && rent.status === "pending"
      );
      
      let processedCount = 0;
      
      for (const rent of autoDeductRents) {
        // In a real app, this would integrate with payment processing
        const success = Math.random() > 0.2; // 80% success rate simulation
        
        if (success) {
          await updateBoothRentStatus(rent.id, "paid", new Date().toISOString());
          processedCount++;
        }
      }
      
      return {
        processed: processedCount,
        total: autoDeductRents.length,
      };
    } catch (error) {
      console.error("Error processing automated collection:", error);
      throw error;
    }
  }, [boothRentStatus, user, updateBoothRentStatus]);

  // Get analytics for a specific period
  const getAnalyticsForPeriod = useCallback((period: "daily" | "weekly" | "monthly" | "yearly") => {
    if (!period?.trim() || period.length > 20) {
      console.error("Invalid period parameter");
      return { ownerAnalytics: [], stylistAnalytics: [] };
    }
    
    setSelectedPeriod(period);
    
    // In a real app, this would fetch different data based on the period
    // For now, just return the current data
    return {
      ownerAnalytics,
      stylistAnalytics,
    };
  }, [ownerAnalytics, stylistAnalytics]);

  // Export analytics data to PDF
  const exportAnalyticsReport = useCallback(async (period: "daily" | "weekly" | "monthly" | "yearly") => {
    try {
      if (!period?.trim() || period.length > 20) {
        throw new Error("Invalid period parameter");
      }
      
      setIsLoading(true);
      
      // In a real app, this would generate and download a PDF report
      // For now, we'll simulate the process
      await new Promise((resolve) => {
        if (typeof resolve !== 'function') {
          throw new Error("Invalid resolve function");
        }
        setTimeout(resolve, 2000);
      });
      
      console.log(`Analytics report exported for ${period} period`);
      return true;
    } catch (error) {
      console.error("Error exporting analytics report:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current analytics data based on user role
  const getCurrentAnalytics = useCallback(() => {
    if (user?.role === "owner") {
      return ownerAnalytics[0] || null;
    } else if (user?.role === "provider") {
      return stylistAnalytics[0] || null;
    }
    return null;
  }, [user, ownerAnalytics, stylistAnalytics]);

  return useMemo(() => ({
    ownerAnalytics,
    stylistAnalytics,
    boothRentStatus,
    selectedPeriod,
    isLoading,
    updateBoothRentStatus,
    sendPaymentReminder,
    calculateAutomatedRent,
    processAutomatedCollection,
    getAnalyticsForPeriod,
    exportAnalyticsReport,
    getCurrentAnalytics,
  }), [
    ownerAnalytics,
    stylistAnalytics,
    boothRentStatus,
    selectedPeriod,
    isLoading,
    updateBoothRentStatus,
    sendPaymentReminder,
    calculateAutomatedRent,
    processAutomatedCollection,
    getAnalyticsForPeriod,
    exportAnalyticsReport,
    getCurrentAnalytics,
  ]);
});