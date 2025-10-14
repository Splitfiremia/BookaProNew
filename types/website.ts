// Comprehensive TypeScript interfaces for Website Builder

// ============================================================================
// CORE WEBSITE TYPES
// ============================================================================

export interface WebsiteConfig {
  templateId: string;
  subdomainSlug: string;
  siteTitle: string;
  heroImageUrl?: string;
  logoUrl?: string;
  businessBio: string;
  tagline?: string;
  primaryColor: string;
  secondaryColor?: string;
  fontFamily: 'inter' | 'poppins' | 'playfair' | 'roboto';
  showTeamSection: boolean;
  showPortfolioSection: boolean;
  showReviewsSection: boolean;
  showServicesSection: boolean;
  showContactSection: boolean;
  enableOnlineBooking: boolean;
  socialLinks: SocialLinks;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

export interface WebsiteStatus {
  isPublished: boolean;
  publishedAt?: string;
  lastModified: string;
  status: 'draft' | 'published' | 'unpublished';
  version: number;
}

export interface WebsiteMetrics {
  pageViews: number;
  uniqueVisitors: number;
  bookingClicks: number;
  bookingConversions: number;
  lastUpdated: string;
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export interface TemplateAsset {
  id: string;
  type: 'image' | 'css' | 'js' | 'font';
  url: string;
  size?: number;
  mimeType?: string;
  cached?: boolean;
  lastModified?: string;
}

export interface TemplateSection {
  id: string;
  name: string;
  type: 'hero' | 'services' | 'team' | 'portfolio' | 'reviews' | 'contact' | 'footer';
  required: boolean;
  configurable: boolean;
  defaultVisible: boolean;
  customizable: {
    colors: boolean;
    layout: boolean;
    content: boolean;
  };
}

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent?: string;
  background: string;
  text: string;
  muted: string;
}

export interface TemplateFeatures {
  responsive: boolean;
  seoOptimized: boolean;
  fastLoading: boolean;
  accessibilityCompliant: boolean;
  socialMediaIntegration: boolean;
  onlineBookingIntegration: boolean;
  contactFormIntegration: boolean;
  googleMapsIntegration: boolean;
  analyticsIntegration: boolean;
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'minimal' | 'creative' | 'professional';
  previewImage: string;
  thumbnailImage: string;
  htmlContent: string;
  cssContent: string;
  jsContent?: string;
  sections: TemplateSection[];
  defaultColors: TemplateColors;
  colorSchemes: TemplateColors[];
  fonts: string[];
  assets: TemplateAsset[];
  features: TemplateFeatures;
  isPremium: boolean;
  price?: number;
  rating: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  version: string;
  compatibility: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  seoFeatures: {
    structuredData: boolean;
    openGraph: boolean;
    twitterCards: boolean;
    sitemap: boolean;
  };
}

// ============================================================================
// CACHE TYPES
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version?: string;
  tags?: string[];
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  version?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface CacheStats {
  totalEntries: number;
  memoryUsage: number;
  storageUsage: number;
  hitRate: number;
  missRate: number;
  expiredEntries: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface WebsiteAnalyticsEvent {
  id: string;
  websiteId: string;
  eventType: 'page_view' | 'booking_click' | 'booking_conversion' | 'contact_click' | 'social_click';
  timestamp: string;
  sessionId: string;
  userId?: string;
  metadata: {
    page?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    country?: string;
    device?: 'mobile' | 'tablet' | 'desktop';
    browser?: string;
    os?: string;
  };
}

export interface WebsiteAnalyticsSummary {
  totalPageViews: number;
  totalUniqueVisitors: number;
  totalBookingClicks: number;
  totalBookingConversions: number;
  conversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: PageAnalytics[];
  trafficSources: TrafficSourceAnalytics;
  deviceBreakdown: DeviceAnalytics;
  geographicData: GeographicAnalytics[];
}

export interface PageAnalytics {
  path: string;
  title?: string;
  pageViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
}

export interface TrafficSourceAnalytics {
  direct: number;
  organic: number;
  social: number;
  referral: number;
  paid: number;
  email: number;
}

export interface DeviceAnalytics {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface GeographicAnalytics {
  country: string;
  countryCode: string;
  visitors: number;
  pageViews: number;
  conversionRate: number;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface WebsiteFormData {
  config: Partial<WebsiteConfig>;
  template: {
    id: string;
    customizations?: Record<string, any>;
  };
  content: {
    sections: Record<string, any>;
    customSections?: any[];
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    structuredData?: Record<string, any>;
  };
}

export interface FormField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'color' | 'file' | 'url';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule;
  options?: { label: string; value: any }[];
  defaultValue?: any;
  helpText?: string;
  disabled?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

export interface OptimizationSuggestion {
  type: 'image' | 'css' | 'js' | 'html' | 'cache' | 'cdn';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  resources?: string[];
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportOptions {
  format: 'html' | 'zip' | 'pdf';
  includeAssets: boolean;
  minify: boolean;
  includeAnalytics: boolean;
  customDomain?: string;
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  fileSize?: number;
  expiresAt?: string;
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Timestamp = string; // ISO 8601 format

export type UUID = string;

export type HexColor = string; // #RRGGBB format

export type URL = string;

export type EmailAddress = string;

export type PhoneNumber = string;

// ============================================================================
// CONSTANTS
// ============================================================================

export const WEBSITE_LIMITS = {
  MAX_SLUG_LENGTH: 50,
  MIN_SLUG_LENGTH: 3,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TAGLINE_LENGTH: 150,
  MAX_META_DESCRIPTION_LENGTH: 160,
  MAX_KEYWORDS: 10,
  MAX_SOCIAL_LINKS: 6,
  MAX_CUSTOM_SECTIONS: 5,
  MAX_ASSETS_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
] as const;

export const SUPPORTED_FONT_FAMILIES = [
  'inter',
  'poppins',
  'playfair',
  'roboto',
  'montserrat',
  'lato',
  'open-sans',
] as const;

export const TEMPLATE_CATEGORIES = [
  'modern',
  'classic',
  'minimal',
  'creative',
  'professional',
] as const;

export const ANALYTICS_EVENTS = [
  'page_view',
  'booking_click',
  'booking_conversion',
  'contact_click',
  'social_click',
  'phone_click',
  'email_click',
  'direction_click',
] as const;

export const CACHE_TAGS = {
  TEMPLATES: 'templates',
  ASSETS: 'assets',
  ANALYTICS: 'analytics',
  WEBSITES: 'websites',
  USER_DATA: 'user_data',
} as const;