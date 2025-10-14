// Deep Link Configuration for Shop Website Builder
// This handles the mobile app deep linking from shop websites

export interface DeepLinkConfig {
  // App URL Scheme Configuration
  scheme: string; // "bookerpro"
  host: string; // "shop"
  
  // Web Fallback Configuration
  webFallbackDomain: string; // "bookerpro.com"
  webFallbackProtocol: string; // "https"
  
  // App Store Fallbacks
  iosAppStoreUrl: string; // App Store URL if app not installed
  androidPlayStoreUrl: string; // Play Store URL if app not installed
  
  // Universal Links (iOS)
  universalLinkDomain: string; // "bookerpro.com"
  universalLinkPath: string; // "/app"
  
  // App Links (Android)
  androidAppLinkDomain: string; // "bookerpro.com"
  androidAppLinkPath: string; // "/app"
}

export const DEFAULT_DEEP_LINK_CONFIG: DeepLinkConfig = {
  scheme: "bookerpro",
  host: "shop",
  webFallbackDomain: "bookerpro.com",
  webFallbackProtocol: "https",
  iosAppStoreUrl: "https://apps.apple.com/app/bookerpro/id123456789",
  androidPlayStoreUrl: "https://play.google.com/store/apps/details?id=com.bookerpro.app",
  universalLinkDomain: "bookerpro.com",
  universalLinkPath: "/app",
  androidAppLinkDomain: "bookerpro.com",
  androidAppLinkPath: "/app"
};

// ============================================================================
// DEEP LINK URL PATTERNS
// ============================================================================

export type DeepLinkAction = 'view' | 'book' | 'contact' | 'services' | 'portfolio' | 'reviews';

export interface DeepLinkParams {
  shopSlug: string;
  action?: DeepLinkAction;
  providerId?: string;
  serviceId?: string;
  date?: string; // Format: "YYYY-MM-DD"
  time?: string; // Format: "HH:MM"
  utm_source?: string; // Analytics tracking
  utm_medium?: string;
  utm_campaign?: string;
}

/**
 * Deep Link URL Patterns:
 * 
 * Basic shop view:
 * bookerpro://shop/demoshop
 * 
 * Specific actions:
 * bookerpro://shop/demoshop?action=book
 * bookerpro://shop/demoshop?action=contact
 * bookerpro://shop/demoshop?action=services
 * bookerpro://shop/demoshop?action=portfolio
 * bookerpro://shop/demoshop?action=reviews
 * 
 * Provider-specific:
 * bookerpro://shop/demoshop?action=book&providerId=123
 * bookerpro://shop/demoshop?action=view&providerId=123
 * 
 * Service-specific booking:
 * bookerpro://shop/demoshop?action=book&serviceId=456
 * bookerpro://shop/demoshop?action=book&providerId=123&serviceId=456
 * 
 * Pre-filled booking:
 * bookerpro://shop/demoshop?action=book&providerId=123&serviceId=456&date=2024-03-15&time=14:00
 * 
 * With analytics tracking:
 * bookerpro://shop/demoshop?action=book&utm_source=website&utm_medium=button&utm_campaign=hero_cta
 */

// ============================================================================
// DEEP LINK GENERATOR
// ============================================================================

export class DeepLinkGenerator {
  private config: DeepLinkConfig;

  constructor(config: DeepLinkConfig = DEFAULT_DEEP_LINK_CONFIG) {
    this.config = config;
  }

  /**
   * Generate deep link URL for mobile app
   */
  generateDeepLink(params: DeepLinkParams): string {
    const { shopSlug, ...queryParams } = params;
    
    // Build base URL
    let url = `${this.config.scheme}://${this.config.host}/${shopSlug}`;
    
    // Add query parameters
    const searchParams = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Generate web fallback URL
   */
  generateWebFallback(params: DeepLinkParams): string {
    const { shopSlug, ...queryParams } = params;
    
    // Build base URL
    let url = `${this.config.webFallbackProtocol}://${this.config.webFallbackDomain}/${shopSlug}`;
    
    // Add query parameters
    const searchParams = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Generate Universal Link (iOS) / App Link (Android)
   */
  generateUniversalLink(params: DeepLinkParams): string {
    const { shopSlug, ...queryParams } = params;
    
    // Build universal link URL
    let url = `${this.config.webFallbackProtocol}://${this.config.universalLinkDomain}${this.config.universalLinkPath}/${shopSlug}`;
    
    // Add query parameters
    const searchParams = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Generate complete link bundle with all variants
   */
  generateLinkBundle(params: DeepLinkParams): DeepLinkBundle {
    return {
      deepLink: this.generateDeepLink(params),
      webFallback: this.generateWebFallback(params),
      universalLink: this.generateUniversalLink(params),
      iosAppStore: this.config.iosAppStoreUrl,
      androidPlayStore: this.config.androidPlayStoreUrl
    };
  }

  /**
   * Generate smart link that detects platform and returns appropriate URL
   */
  generateSmartLink(params: DeepLinkParams, userAgent?: string): string {
    if (!userAgent) {
      return this.generateWebFallback(params);
    }

    // Detect iOS
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return this.generateUniversalLink(params);
    }

    // Detect Android
    if (/Android/i.test(userAgent)) {
      return this.generateUniversalLink(params);
    }

    // Default to web fallback for desktop/unknown
    return this.generateWebFallback(params);
  }
}

export interface DeepLinkBundle {
  deepLink: string; // Custom URL scheme
  webFallback: string; // Web URL
  universalLink: string; // Universal/App Link
  iosAppStore: string; // iOS App Store URL
  androidPlayStore: string; // Android Play Store URL
}

// ============================================================================
// DEEP LINK PARSER
// ============================================================================

export class DeepLinkParser {
  private config: DeepLinkConfig;

  constructor(config: DeepLinkConfig = DEFAULT_DEEP_LINK_CONFIG) {
    this.config = config;
  }

  /**
   * Parse deep link URL and extract parameters
   */
  parseDeepLink(url: string): DeepLinkParams | null {
    try {
      const parsedUrl = new URL(url);
      
      // Validate scheme and host
      if (parsedUrl.protocol !== `${this.config.scheme}:` || 
          parsedUrl.hostname !== this.config.host) {
        return null;
      }

      // Extract shop slug from pathname
      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      if (pathSegments.length === 0) {
        return null;
      }

      const shopSlug = pathSegments[0];
      
      // Extract query parameters
      const searchParams = parsedUrl.searchParams;
      
      const params: DeepLinkParams = {
        shopSlug
      };

      // Parse optional parameters
      const action = searchParams.get('action');
      if (action && this.isValidAction(action)) {
        params.action = action as DeepLinkAction;
      }

      const providerId = searchParams.get('providerId');
      if (providerId) {
        params.providerId = providerId;
      }

      const serviceId = searchParams.get('serviceId');
      if (serviceId) {
        params.serviceId = serviceId;
      }

      const date = searchParams.get('date');
      if (date && this.isValidDate(date)) {
        params.date = date;
      }

      const time = searchParams.get('time');
      if (time && this.isValidTime(time)) {
        params.time = time;
      }

      // Parse UTM parameters
      const utmSource = searchParams.get('utm_source');
      if (utmSource) {
        params.utm_source = utmSource;
      }

      const utmMedium = searchParams.get('utm_medium');
      if (utmMedium) {
        params.utm_medium = utmMedium;
      }

      const utmCampaign = searchParams.get('utm_campaign');
      if (utmCampaign) {
        params.utm_campaign = utmCampaign;
      }

      return params;

    } catch (error) {
      console.error('Error parsing deep link:', error);
      return null;
    }
  }

  /**
   * Validate action parameter
   */
  private isValidAction(action: string): boolean {
    const validActions: DeepLinkAction[] = ['view', 'book', 'contact', 'services', 'portfolio', 'reviews'];
    return validActions.includes(action as DeepLinkAction);
  }

  /**
   * Validate date parameter (YYYY-MM-DD format)
   */
  private isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return false;
    }

    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }

  /**
   * Validate time parameter (HH:MM format)
   */
  private isValidTime(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}

// ============================================================================
// MOBILE APP INTEGRATION
// ============================================================================

/**
 * React Native app configuration for handling deep links
 */
export interface AppDeepLinkConfig {
  // Linking configuration for React Navigation
  linking: {
    prefixes: string[]; // ["bookerpro://", "https://bookerpro.com/app"]
    config: {
      screens: {
        ShopView: string; // "shop/:shopSlug"
        BookingFlow: string; // "shop/:shopSlug/book"
        ProviderProfile: string; // "shop/:shopSlug/provider/:providerId"
      };
    };
  };
  
  // URL handling configuration
  urlHandling: {
    handleIncomingURL: (url: string) => void;
    getInitialURL: () => Promise<string | null>;
  };
}

/**
 * Example React Native Linking configuration
 */
export const REACT_NATIVE_LINKING_CONFIG = {
  prefixes: [
    'bookerpro://',
    'https://bookerpro.com/app',
    'https://bookerpro.com' // For universal links
  ],
  config: {
    screens: {
      // Main app screens
      Home: '',
      
      // Shop-specific screens
      ShopView: {
        path: 'shop/:shopSlug',
        parse: {
          shopSlug: (shopSlug: string) => shopSlug
        }
      },
      
      BookingFlow: {
        path: 'shop/:shopSlug/book',
        parse: {
          shopSlug: (shopSlug: string) => shopSlug
        }
      },
      
      ProviderProfile: {
        path: 'shop/:shopSlug/provider/:providerId',
        parse: {
          shopSlug: (shopSlug: string) => shopSlug,
          providerId: (providerId: string) => providerId
        }
      },
      
      ServiceBooking: {
        path: 'shop/:shopSlug/service/:serviceId',
        parse: {
          shopSlug: (shopSlug: string) => shopSlug,
          serviceId: (serviceId: string) => serviceId
        }
      }
    }
  }
};

// ============================================================================
// ANALYTICS & TRACKING
// ============================================================================

export interface DeepLinkAnalytics {
  // Track deep link clicks
  trackDeepLinkClick: (params: {
    shopSlug: string;
    action?: DeepLinkAction;
    source: 'website' | 'qr_code' | 'social' | 'email' | 'sms';
    platform: 'ios' | 'android' | 'web';
    userAgent?: string;
  }) => void;
  
  // Track app opens from deep links
  trackAppOpen: (params: {
    shopSlug: string;
    action?: DeepLinkAction;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  }) => void;
  
  // Track conversion from deep link to booking
  trackDeepLinkConversion: (params: {
    shopSlug: string;
    appointmentId: string;
    providerId?: string;
    serviceId?: string;
    utm_source?: string;
  }) => void;
}

// ============================================================================
// QR CODE GENERATION
// ============================================================================

export interface QRCodeConfig {
  size: number; // QR code size in pixels
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'; // Error correction level
  margin: number; // Margin around QR code
  color: {
    dark: string; // Dark color (hex)
    light: string; // Light color (hex)
  };
  logo?: {
    url: string; // Logo image URL
    size: number; // Logo size as percentage of QR code
  };
}

export const DEFAULT_QR_CONFIG: QRCodeConfig = {
  size: 256,
  errorCorrectionLevel: 'M',
  margin: 4,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
};

/**
 * Generate QR code for deep link
 */
export function generateQRCodeUrl(deepLink: string, config: QRCodeConfig = DEFAULT_QR_CONFIG): string {
  // This would integrate with a QR code generation service
  // Example: https://api.qrserver.com/v1/create-qr-code/
  
  const params = new URLSearchParams({
    data: deepLink,
    size: `${config.size}x${config.size}`,
    ecc: config.errorCorrectionLevel,
    margin: config.margin.toString(),
    color: config.color.dark.replace('#', ''),
    bgcolor: config.color.light.replace('#', '')
  });
  
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

// ============================================================================
// TESTING & VALIDATION
// ============================================================================

export interface DeepLinkTestSuite {
  // Test deep link generation
  testGeneration: () => boolean;
  
  // Test deep link parsing
  testParsing: () => boolean;
  
  // Test platform detection
  testPlatformDetection: () => boolean;
  
  // Test URL validation
  testValidation: () => boolean;
}

/**
 * Validate deep link configuration
 */
export function validateDeepLinkConfig(config: DeepLinkConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate scheme
  if (!config.scheme || !/^[a-z][a-z0-9+.-]*$/i.test(config.scheme)) {
    errors.push('Invalid URL scheme format');
  }
  
  // Validate host
  if (!config.host || config.host.includes('/')) {
    errors.push('Invalid host format');
  }
  
  // Validate web fallback domain
  if (!config.webFallbackDomain || !/^[a-z0-9.-]+$/i.test(config.webFallbackDomain)) {
    errors.push('Invalid web fallback domain');
  }
  
  // Validate protocol
  if (!['http', 'https'].includes(config.webFallbackProtocol)) {
    errors.push('Invalid web fallback protocol');
  }
  
  // Validate app store URLs
  try {
    new URL(config.iosAppStoreUrl);
  } catch {
    errors.push('Invalid iOS App Store URL');
  }
  
  try {
    new URL(config.androidPlayStoreUrl);
  } catch {
    errors.push('Invalid Android Play Store URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}