// Shop Website Builder Database Schema
// This extends the existing database models for the website builder functionality

export type WebsiteTemplateId = 'modern' | 'classic' | 'minimal' | 'luxury' | 'creative';

export type WebsiteStatus = 'draft' | 'published' | 'unpublished' | 'archived';

export interface ShopWebsite {
  id: string;
  shopId: string; // Foreign key to Shop table
  
  // Domain & Routing
  subdomainSlug: string; // Unique slug for bookerpro.com/:slug
  customDomain?: string; // Optional custom domain (future feature)
  
  // Template & Design
  templateId: WebsiteTemplateId;
  primaryColor: string; // Hex color code
  secondaryColor?: string; // Optional secondary color
  fontFamily?: 'inter' | 'poppins' | 'playfair' | 'roboto'; // Typography choice
  
  // Content
  siteTitle: string; // Custom site title (defaults to shop name)
  heroImageUrl?: string; // Main hero image
  logoUrl?: string; // Shop logo
  businessBio: string; // About section content
  tagline?: string; // Short catchphrase
  
  // SEO & Meta
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Features & Settings
  showTeamSection: boolean; // Display team members
  showPortfolioSection: boolean; // Display portfolio gallery
  showReviewsSection: boolean; // Display customer reviews
  showServicesSection: boolean; // Display services list
  showContactSection: boolean; // Display contact info
  enableOnlineBooking: boolean; // Show "Book Now" button
  
  // Social Media Links
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    twitter?: string;
  };
  
  // Analytics & Tracking
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  
  // Status & Publishing
  status: WebsiteStatus;
  isPublished: boolean;
  publishedAt?: string;
  lastPublishedAt?: string;
  
  // Performance & SEO
  pageViews: number; // Total page views
  uniqueVisitors: number; // Unique visitors count
  bookingClicks: number; // "Book Now" button clicks
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID who created the website
}

// Website Template Definition
export interface WebsiteTemplate {
  id: WebsiteTemplateId;
  name: string;
  description: string;
  previewImageUrl: string;
  category: 'modern' | 'classic' | 'creative';
  
  // Template Configuration
  defaultColors: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  
  // Layout Features
  features: {
    hasHeroSection: boolean;
    hasAboutSection: boolean;
    hasServicesGrid: boolean;
    hasTeamSection: boolean;
    hasPortfolioGallery: boolean;
    hasReviewsCarousel: boolean;
    hasContactSection: boolean;
    hasBookingCTA: boolean;
  };
  
  // Responsive Design
  mobileOptimized: boolean;
  tabletOptimized: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// Website Analytics Tracking
export interface WebsiteAnalytics {
  id: string;
  websiteId: string; // Foreign key to ShopWebsite
  
  // Traffic Metrics
  date: string; // Format: "YYYY-MM-DD"
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number; // Percentage
  averageSessionDuration: number; // Seconds
  
  // Conversion Metrics
  bookingClicks: number;
  bookingConversions: number; // Actual bookings made
  conversionRate: number; // Percentage
  
  // Traffic Sources
  trafficSources: {
    direct: number;
    organic: number;
    social: number;
    referral: number;
    paid: number;
  };
  
  // Device Breakdown
  deviceTypes: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  
  // Geographic Data
  topCountries: {
    country: string;
    visitors: number;
  }[];
  
  createdAt: string;
}

// Custom Domain Configuration (Future Feature)
export interface CustomDomain {
  id: string;
  websiteId: string;
  domain: string; // e.g., "mybarbershop.com"
  
  // DNS Configuration
  isVerified: boolean;
  verificationToken: string;
  sslEnabled: boolean;
  sslCertificateStatus: 'pending' | 'active' | 'expired' | 'failed';
  
  // Status
  status: 'pending' | 'active' | 'failed' | 'suspended';
  
  createdAt: string;
  updatedAt: string;
}

// Relationship Extensions to Existing Models
// Note: This would extend the existing Shop interface from database.ts
// export interface ShopExtended extends Shop {
//   website?: ShopWebsite; // Optional website configuration
// }

// Deep Link Configuration
export interface DeepLinkConfig {
  scheme: string; // "bookerpro"
  host: string; // "shop"
  pathPattern: string; // "/:shopSlug"
  webFallbackUrl: string; // Web URL if app not installed
}

// Website Builder Settings
export interface WebsiteBuilderSettings {
  id: string;
  
  // Global Settings
  allowCustomDomains: boolean;
  maxWebsitesPerShop: number;
  defaultTemplate: WebsiteTemplateId;
  
  // Feature Flags
  enableAnalytics: boolean;
  enableSEOTools: boolean;
  enableCustomCSS: boolean; // Future feature
  
  // Limits & Quotas
  maxImagesPerWebsite: number;
  maxPageViews: number; // Per month
  storageLimit: number; // In MB
  
  updatedAt: string;
}

// Pre-defined Templates
export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, contemporary design with bold typography and minimalist layout',
    previewImageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800',
    category: 'modern',
    defaultColors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#f59e0b'
    },
    features: {
      hasHeroSection: true,
      hasAboutSection: true,
      hasServicesGrid: true,
      hasTeamSection: true,
      hasPortfolioGallery: true,
      hasReviewsCarousel: true,
      hasContactSection: true,
      hasBookingCTA: true
    },
    mobileOptimized: true,
    tabletOptimized: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless design with elegant typography and traditional layout',
    previewImageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
    category: 'classic',
    defaultColors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#d97706'
    },
    features: {
      hasHeroSection: true,
      hasAboutSection: true,
      hasServicesGrid: true,
      hasTeamSection: false,
      hasPortfolioGallery: true,
      hasReviewsCarousel: true,
      hasContactSection: true,
      hasBookingCTA: true
    },
    mobileOptimized: true,
    tabletOptimized: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean design focusing on content with maximum white space',
    previewImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    category: 'modern',
    defaultColors: {
      primary: '#000000',
      secondary: '#737373',
      accent: '#ef4444'
    },
    features: {
      hasHeroSection: true,
      hasAboutSection: true,
      hasServicesGrid: true,
      hasTeamSection: false,
      hasPortfolioGallery: false,
      hasReviewsCarousel: false,
      hasContactSection: true,
      hasBookingCTA: true
    },
    mobileOptimized: true,
    tabletOptimized: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Premium design with sophisticated colors and elegant animations',
    previewImageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    category: 'creative',
    defaultColors: {
      primary: '#7c3aed',
      secondary: '#a855f7',
      accent: '#fbbf24'
    },
    features: {
      hasHeroSection: true,
      hasAboutSection: true,
      hasServicesGrid: true,
      hasTeamSection: true,
      hasPortfolioGallery: true,
      hasReviewsCarousel: true,
      hasContactSection: true,
      hasBookingCTA: true
    },
    mobileOptimized: true,
    tabletOptimized: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold, artistic design with unique layouts and creative elements',
    previewImageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    category: 'creative',
    defaultColors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#06b6d4'
    },
    features: {
      hasHeroSection: true,
      hasAboutSection: true,
      hasServicesGrid: true,
      hasTeamSection: true,
      hasPortfolioGallery: true,
      hasReviewsCarousel: false,
      hasContactSection: true,
      hasBookingCTA: true
    },
    mobileOptimized: true,
    tabletOptimized: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Default website configuration
export const DEFAULT_WEBSITE_CONFIG: Partial<ShopWebsite> = {
  templateId: 'modern',
  primaryColor: '#2563eb',
  showTeamSection: true,
  showPortfolioSection: true,
  showReviewsSection: true,
  showServicesSection: true,
  showContactSection: true,
  enableOnlineBooking: true,
  status: 'draft',
  isPublished: false,
  pageViews: 0,
  uniqueVisitors: 0,
  bookingClicks: 0,
  socialLinks: {}
};