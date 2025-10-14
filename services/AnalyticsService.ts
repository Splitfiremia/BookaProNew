import { cacheService } from './CacheService';
import {
  WebsiteAnalytics,
  GetWebsiteAnalyticsRequest,
  GetWebsiteAnalyticsResponse,
  TrackWebsiteEventRequest,
  TrackWebsiteEventResponse,
} from '@/models/websiteAPI';

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

export interface WebsiteAnalyticsData {
  summary: {
    totalPageViews: number;
    totalUniqueVisitors: number;
    totalBookingClicks: number;
    totalBookingConversions: number;
    conversionRate: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
  timeSeries: WebsiteAnalytics[];
  topPages: {
    path: string;
    pageViews: number;
    uniqueVisitors: number;
  }[];
  trafficSources: {
    direct: number;
    organic: number;
    social: number;
    referral: number;
    paid: number;
  };
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topCountries: {
    country: string;
    visitors: number;
  }[];
}

class AnalyticsService {
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes
  private readonly websiteCacheTTL = 15 * 60 * 1000; // 15 minutes

  /**
   * Generate mock analytics data for development
   */
  generateMockAnalytics(userRole: string, userData: any): AnalyticsData {
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
      weekOverWeekGrowth: (Math.random() * 20) - 5,
      monthOverMonthGrowth: (Math.random() * 25) - 10,
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
      chairUtilizationRate: Math.floor(Math.random() * 30) + 65,
      hoursWorked: Math.floor(Math.random() * 20) + 35,
      averageTicketSize: Math.floor(Math.random() * 50) + 75,
      averageTipPercentage: Math.floor(Math.random() * 10) + 18,
      clientRetentionRate: Math.floor(Math.random() * 20) + 70,
      repeatBookings: Math.floor(Math.random() * 20) + 25,
      newClients: Math.floor(Math.random() * 15) + 8,
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
  }

  /**
   * Get shop analytics with caching
   */
  async getShopAnalytics(shopId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ShopAnalytics | null> {
    const cacheKey = `shop_analytics_${shopId}_${period}`;
    
    try {
      // Try to get from cache first
      const cached = await cacheService.get<ShopAnalytics>(cacheKey);
      if (cached) {
        return cached;
      }

      // Generate mock data (in real app, this would be an API call)
      const mockData = this.generateMockAnalytics('owner', {});
      const shopAnalytics: ShopAnalytics = {
        id: shopId,
        name: 'Demo Shop',
        stylists: 4,
        ...mockData,
        totalRevenue: mockData.earnings.totalRevenue,
        totalAppointments: mockData.metrics.totalAppointments,
        revenueByPeriod: mockData.earnings.revenueByPeriod.slice(-7).map(item => ({
          period: new Date(item.period).toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: item.totalRevenue,
        })),
      };

      // Cache the result
      await cacheService.set(cacheKey, shopAnalytics, { ttl: this.cacheTTL });
      
      return shopAnalytics;
    } catch (error) {
      console.error('Error getting shop analytics:', error);
      return null;
    }
  }

  /**
   * Get stylist analytics with caching
   */
  async getStylistAnalytics(stylistId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<StylistAnalytics | null> {
    const cacheKey = `stylist_analytics_${stylistId}_${period}`;
    
    try {
      // Try to get from cache first
      const cached = await cacheService.get<StylistAnalytics>(cacheKey);
      if (cached) {
        return cached;
      }

      // Generate mock data (in real app, this would be an API call)
      const mockData = this.generateMockAnalytics('provider', {});
      const stylistAnalytics: StylistAnalytics = {
        id: stylistId,
        name: 'Demo Stylist',
        shopId: 'shop-1',
        shopName: 'Demo Shop',
        appointmentsToday: Math.floor(Math.random() * 8) + 1,
        ...mockData,
        totalRevenue: mockData.earnings.totalRevenue,
        totalAppointments: mockData.metrics.totalAppointments,
        revenueByPeriod: mockData.earnings.revenueByPeriod.slice(-7).map(item => ({
          period: new Date(item.period).toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: item.totalRevenue,
        })),
      };

      // Cache the result
      await cacheService.set(cacheKey, stylistAnalytics, { ttl: this.cacheTTL });
      
      return stylistAnalytics;
    } catch (error) {
      console.error('Error getting stylist analytics:', error);
      return null;
    }
  }

  /**
   * Get website analytics
   */
  async getWebsiteAnalytics(shopId: string, request: GetWebsiteAnalyticsRequest): Promise<WebsiteAnalyticsData | null> {
    const cacheKey = `website_analytics_${shopId}_${request.period || 'daily'}_${request.startDate || 'default'}`;
    
    try {
      // Try to get from cache first
      const cached = await cacheService.get<WebsiteAnalyticsData>(cacheKey);
      if (cached) {
        return cached;
      }

      // Generate mock website analytics data
      const websiteAnalytics: WebsiteAnalyticsData = {
        summary: {
          totalPageViews: Math.floor(Math.random() * 5000) + 1000,
          totalUniqueVisitors: Math.floor(Math.random() * 2000) + 500,
          totalBookingClicks: Math.floor(Math.random() * 200) + 50,
          totalBookingConversions: Math.floor(Math.random() * 50) + 10,
          conversionRate: parseFloat((Math.random() * 10 + 5).toFixed(2)),
          averageSessionDuration: Math.floor(Math.random() * 300) + 120,
          bounceRate: parseFloat((Math.random() * 30 + 20).toFixed(2)),
        },
        timeSeries: Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return {
            id: `analytics_${i}`,
            websiteId: shopId,
            date: date.toISOString().split('T')[0],
            pageViews: Math.floor(Math.random() * 200) + 50,
            uniqueVisitors: Math.floor(Math.random() * 100) + 20,
            bounceRate: parseFloat((Math.random() * 30 + 20).toFixed(2)),
            averageSessionDuration: Math.floor(Math.random() * 300) + 120,
            bookingClicks: Math.floor(Math.random() * 10) + 1,
            bookingConversions: Math.floor(Math.random() * 3),
            conversionRate: parseFloat((Math.random() * 10 + 5).toFixed(2)),
            trafficSources: {
              direct: Math.floor(Math.random() * 40) + 30,
              organic: Math.floor(Math.random() * 30) + 25,
              social: Math.floor(Math.random() * 20) + 15,
              referral: Math.floor(Math.random() * 15) + 10,
              paid: Math.floor(Math.random() * 10) + 5,
            },
            deviceTypes: {
              mobile: Math.floor(Math.random() * 30) + 50,
              desktop: Math.floor(Math.random() * 30) + 25,
              tablet: Math.floor(Math.random() * 15) + 10,
            },
            topCountries: [
              { country: 'United States', visitors: Math.floor(Math.random() * 500) + 200 },
              { country: 'Canada', visitors: Math.floor(Math.random() * 200) + 50 },
            ],
            createdAt: date.toISOString(),
          };
        }),
        topPages: [
          { path: '/', pageViews: Math.floor(Math.random() * 1000) + 500, uniqueVisitors: Math.floor(Math.random() * 500) + 200 },
          { path: '/services', pageViews: Math.floor(Math.random() * 800) + 300, uniqueVisitors: Math.floor(Math.random() * 400) + 150 },
          { path: '/team', pageViews: Math.floor(Math.random() * 600) + 200, uniqueVisitors: Math.floor(Math.random() * 300) + 100 },
          { path: '/contact', pageViews: Math.floor(Math.random() * 400) + 100, uniqueVisitors: Math.floor(Math.random() * 200) + 50 },
        ],
        trafficSources: {
          direct: Math.floor(Math.random() * 40) + 30,
          organic: Math.floor(Math.random() * 30) + 25,
          social: Math.floor(Math.random() * 20) + 15,
          referral: Math.floor(Math.random() * 15) + 10,
          paid: Math.floor(Math.random() * 10) + 5,
        },
        deviceBreakdown: {
          mobile: Math.floor(Math.random() * 30) + 50,
          desktop: Math.floor(Math.random() * 30) + 25,
          tablet: Math.floor(Math.random() * 15) + 10,
        },
        topCountries: [
          { country: 'United States', visitors: Math.floor(Math.random() * 500) + 200 },
          { country: 'Canada', visitors: Math.floor(Math.random() * 200) + 50 },
          { country: 'United Kingdom', visitors: Math.floor(Math.random() * 150) + 30 },
          { country: 'Australia', visitors: Math.floor(Math.random() * 100) + 20 },
        ],
      };

      // Cache the result
      await cacheService.set(cacheKey, websiteAnalytics, { ttl: this.websiteCacheTTL });
      
      return websiteAnalytics;
    } catch (error) {
      console.error('Error getting website analytics:', error);
      return null;
    }
  }

  /**
   * Track website event
   */
  async trackWebsiteEvent(slug: string, request: TrackWebsiteEventRequest): Promise<boolean> {
    try {
      // In a real app, this would send the event to an analytics service
      console.log(`Tracking ${request.event} for website ${slug}:`, request.metadata);
      
      // Invalidate relevant cache entries
      const cacheKeys = [
        `website_analytics_${slug}_daily_default`,
        `website_analytics_${slug}_weekly_default`,
        `website_analytics_${slug}_monthly_default`,
      ];
      
      for (const key of cacheKeys) {
        await cacheService.remove(key);
      }
      
      return true;
    } catch (error) {
      console.error('Error tracking website event:', error);
      return false;
    }
  }

  /**
   * Export analytics report
   */
  async exportAnalyticsReport(
    type: 'shop' | 'stylist' | 'website',
    id: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    format: 'pdf' | 'csv' | 'json' = 'pdf'
  ): Promise<string | null> {
    try {
      // In a real app, this would generate and return a download URL
      console.log(`Exporting ${type} analytics report for ${id} (${period}, ${format})`);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return `https://example.com/reports/${type}_${id}_${period}.${format}`;
    } catch (error) {
      console.error('Error exporting analytics report:', error);
      return null;
    }
  }

  /**
   * Clear analytics cache
   */
  async clearCache(): Promise<void> {
    try {
      // Clear all analytics-related cache entries
      const keys = [
        'shop_analytics_',
        'stylist_analytics_',
        'website_analytics_',
      ];
      
      for (const keyPrefix of keys) {
        // In a real implementation, you'd need to get all keys with this prefix
        // For now, we'll just clear the entire cache
        await cacheService.clear();
        break;
      }
    } catch (error) {
      console.error('Error clearing analytics cache:', error);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export types
export type {
  GetWebsiteAnalyticsRequest,
  TrackWebsiteEventRequest,
};