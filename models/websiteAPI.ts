// API Endpoint Structure for Shop Website Builder
// This outlines the backend API endpoints needed for the website builder

import { ShopWebsite, WebsiteTemplateId, WebsiteTemplate, WebsiteAnalytics, WebsiteStatus } from './shopWebsite';
import { Shop, Provider, Service, Review } from './database';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// WEBSITE MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/shops/:shopId/website
 * Get shop's website configuration
 */
export interface GetShopWebsiteResponse extends APIResponse {
  data: ShopWebsite | null;
}

/**
 * POST /api/shops/:shopId/website
 * Create a new website for a shop
 */
export interface CreateWebsiteRequest {
  templateId: WebsiteTemplateId;
  subdomainSlug: string; // Must be unique across all websites
  siteTitle?: string; // Defaults to shop name
  businessBio?: string; // Defaults to shop description
  primaryColor?: string; // Defaults to template default
}

export interface CreateWebsiteResponse extends APIResponse {
  data: ShopWebsite;
}

/**
 * PUT /api/shops/:shopId/website
 * Update website configuration
 */
export interface UpdateWebsiteRequest {
  templateId?: WebsiteTemplateId;
  subdomainSlug?: string;
  siteTitle?: string;
  heroImageUrl?: string;
  logoUrl?: string;
  businessBio?: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: 'inter' | 'poppins' | 'playfair' | 'roboto';
  showTeamSection?: boolean;
  showPortfolioSection?: boolean;
  showReviewsSection?: boolean;
  showServicesSection?: boolean;
  showContactSection?: boolean;
  enableOnlineBooking?: boolean;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    twitter?: string;
  };
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface UpdateWebsiteResponse extends APIResponse {
  data: ShopWebsite;
}

/**
 * POST /api/shops/:shopId/website/publish
 * Publish website (make it live)
 */
export interface PublishWebsiteResponse extends APIResponse {
  data: {
    website: ShopWebsite;
    liveUrl: string; // e.g., "https://bookerpro.com/demoshop"
  };
}

/**
 * POST /api/shops/:shopId/website/unpublish
 * Unpublish website (take it offline)
 */
export interface UnpublishWebsiteResponse extends APIResponse {
  data: ShopWebsite;
}

/**
 * DELETE /api/shops/:shopId/website
 * Delete website completely
 */
export interface DeleteWebsiteResponse extends APIResponse {
  data: { deleted: boolean };
}

// ============================================================================
// SUBDOMAIN & ROUTING ENDPOINTS
// ============================================================================

/**
 * GET /api/website/check-slug/:slug
 * Check if subdomain slug is available
 */
export interface CheckSlugAvailabilityResponse extends APIResponse {
  data: {
    available: boolean;
    suggestions?: string[]; // Alternative suggestions if not available
  };
}

/**
 * GET /api/website/resolve/:slug
 * Resolve subdomain slug to shop website data
 * This is used by the public website renderer
 */
export interface ResolveWebsiteRequest {
  slug: string;
}

export interface ResolveWebsiteResponse extends APIResponse {
  data: {
    website: ShopWebsite;
    shop: Shop;
    providers: Provider[];
    services: Service[];
    reviews: Review[];
    analytics?: {
      pageViews: number;
      rating: number;
      reviewCount: number;
    };
  } | null;
}

// ============================================================================
// TEMPLATE MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/website/templates
 * Get all available website templates
 */
export interface GetTemplatesResponse extends APIResponse {
  data: WebsiteTemplate[];
}

/**
 * GET /api/website/templates/:templateId
 * Get specific template details
 */
export interface GetTemplateResponse extends APIResponse {
  data: WebsiteTemplate;
}

/**
 * GET /api/website/templates/:templateId/preview
 * Get template preview with sample data
 */
export interface GetTemplatePreviewResponse extends APIResponse {
  data: {
    template: WebsiteTemplate;
    previewHtml: string; // Rendered HTML with sample data
    previewUrl: string; // URL to live preview
  };
}

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/shops/:shopId/website/analytics
 * Get website analytics data
 */
export interface GetWebsiteAnalyticsRequest {
  startDate?: string; // Format: "YYYY-MM-DD"
  endDate?: string; // Format: "YYYY-MM-DD"
  period?: 'daily' | 'weekly' | 'monthly';
}

export interface GetWebsiteAnalyticsResponse extends APIResponse {
  data: {
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
  };
}

/**
 * POST /api/website/:slug/track
 * Track website events (page views, booking clicks, etc.)
 */
export interface TrackWebsiteEventRequest {
  event: 'page_view' | 'booking_click' | 'booking_conversion' | 'contact_click';
  metadata?: {
    page?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
  };
}

export interface TrackWebsiteEventResponse extends APIResponse {
  data: { tracked: boolean };
}

// ============================================================================
// DEEP LINKING ENDPOINTS
// ============================================================================

/**
 * GET /api/website/:slug/deep-link
 * Generate deep link for mobile app
 */
export interface GenerateDeepLinkRequest {
  slug: string;
  action?: 'book' | 'view' | 'contact';
  providerId?: string; // Optional specific provider
  serviceId?: string; // Optional specific service
}

export interface GenerateDeepLinkResponse extends APIResponse {
  data: {
    deepLink: string; // e.g., "bookerpro://shop/demoshop"
    webFallback: string; // e.g., "https://bookerpro.com/shop/demoshop"
    qrCode?: string; // Base64 encoded QR code image
  };
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * GET /api/admin/websites
 * Admin endpoint to get all websites (with pagination)
 */
export interface GetAllWebsitesRequest {
  page?: number;
  limit?: number;
  status?: WebsiteStatus;
  templateId?: WebsiteTemplateId;
  search?: string; // Search by shop name or slug
}

export interface GetAllWebsitesResponse extends APIResponse {
  data: {
    websites: (ShopWebsite & { shopName: string })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * POST /api/admin/websites/bulk-update
 * Admin endpoint for bulk operations
 */
export interface BulkUpdateWebsitesRequest {
  websiteIds: string[];
  updates: Partial<UpdateWebsiteRequest>;
}

export interface BulkUpdateWebsitesResponse extends APIResponse {
  data: {
    updated: number;
    failed: number;
    errors?: { websiteId: string; error: string }[];
  };
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export const API_ERROR_CODES = {
  // Website Management
  WEBSITE_NOT_FOUND: 'WEBSITE_NOT_FOUND',
  WEBSITE_ALREADY_EXISTS: 'WEBSITE_ALREADY_EXISTS',
  SLUG_NOT_AVAILABLE: 'SLUG_NOT_AVAILABLE',
  INVALID_TEMPLATE: 'INVALID_TEMPLATE',
  
  // Publishing
  WEBSITE_NOT_READY: 'WEBSITE_NOT_READY', // Missing required fields
  ALREADY_PUBLISHED: 'ALREADY_PUBLISHED',
  NOT_PUBLISHED: 'NOT_PUBLISHED',
  
  // Permissions
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SHOP_NOT_FOUND: 'SHOP_NOT_FOUND',
  
  // Validation
  INVALID_SLUG_FORMAT: 'INVALID_SLUG_FORMAT',
  INVALID_COLOR_FORMAT: 'INVALID_COLOR_FORMAT',
  INVALID_URL_FORMAT: 'INVALID_URL_FORMAT',
  
  // Limits
  MAX_WEBSITES_EXCEEDED: 'MAX_WEBSITES_EXCEEDED',
  STORAGE_LIMIT_EXCEEDED: 'STORAGE_LIMIT_EXCEEDED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // System
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const;

// ============================================================================
// MIDDLEWARE & VALIDATION
// ============================================================================

export interface RequestValidation {
  // Slug validation
  isValidSlug: (slug: string) => boolean;
  
  // Color validation
  isValidHexColor: (color: string) => boolean;
  
  // URL validation
  isValidUrl: (url: string) => boolean;
  
  // Template validation
  isValidTemplate: (templateId: string) => boolean;
}

export const VALIDATION_RULES = {
  slug: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-z0-9-]+$/, // Only lowercase letters, numbers, and hyphens
    reservedSlugs: ['api', 'admin', 'www', 'app', 'mobile', 'web', 'help', 'support']
  },
  siteTitle: {
    minLength: 1,
    maxLength: 100
  },
  businessBio: {
    minLength: 10,
    maxLength: 1000
  },
  tagline: {
    maxLength: 150
  },
  metaDescription: {
    maxLength: 160
  }
} as const;

// Export WebsiteAnalytics for use in other services
export type { WebsiteAnalytics };