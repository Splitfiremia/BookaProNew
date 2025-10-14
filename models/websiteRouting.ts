// Subdomain Routing Logic for Shop Website Builder
// This outlines how the server handles requests to bookerpro.com/:shopSlug

import { ShopWebsite } from './shopWebsite';
import { Shop, Provider, Service, Review } from './database';

export interface RoutingConfig {
  domain: string; // "bookerpro.com"
  protocol: string; // "https"
  cdnUrl?: string; // Optional CDN for static assets
}

export interface RouteResolution {
  slug: string;
  shopId: string;
  websiteId: string;
  isValid: boolean;
  redirectUrl?: string; // If redirect is needed
  timestamp?: number; // For caching
}

// ============================================================================
// ROUTING MIDDLEWARE LOGIC
// ============================================================================

/**
 * Main routing middleware that handles all incoming requests
 * This runs on every request to bookerpro.com
 */
export class WebsiteRouter {
  private config: RoutingConfig;
  private cache: Map<string, RouteResolution> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  constructor(config: RoutingConfig) {
    this.config = config;
  }

  /**
   * Main routing handler
   * Determines if request is for a shop website or main app
   */
  async handleRequest(request: {
    hostname: string;
    pathname: string;
    userAgent?: string;
    headers: Record<string, string>;
  }): Promise<RouteHandlerResult> {
    
    // Extract slug from URL path
    const slug = this.extractSlugFromPath(request.pathname);
    
    if (!slug) {
      return {
        type: 'main_app',
        action: 'serve_main_app'
      };
    }

    // Check if it's a reserved path (API, admin, etc.)
    if (this.isReservedPath(slug)) {
      return {
        type: 'reserved',
        action: 'serve_main_app'
      };
    }

    // Resolve slug to website
    const resolution = await this.resolveSlug(slug);
    
    if (!resolution.isValid) {
      return {
        type: 'not_found',
        action: 'serve_404',
        slug
      };
    }

    // Check if website is published
    const website = await this.getWebsiteData(resolution.websiteId);
    
    if (!website || !website.website.isPublished) {
      return {
        type: 'unpublished',
        action: 'serve_404',
        slug
      };
    }

    // Determine if user is on mobile and should be redirected to app
    const shouldRedirectToApp = this.shouldRedirectToMobileApp(
      request.userAgent || '',
      request.headers
    );

    if (shouldRedirectToApp) {
      return {
        type: 'mobile_redirect',
        action: 'redirect_to_app',
        slug,
        deepLink: this.generateDeepLink(slug),
        fallbackUrl: `${this.config.protocol}://${this.config.domain}/${slug}`
      };
    }

    // Serve the website
    return {
      type: 'website',
      action: 'serve_website',
      slug,
      websiteId: resolution.websiteId,
      shopId: resolution.shopId,
      website
    };
  }

  /**
   * Extract slug from URL pathname
   * Examples:
   * - "/demoshop" -> "demoshop"
   * - "/demoshop/about" -> "demoshop"
   * - "/" -> null
   */
  private extractSlugFromPath(pathname: string): string | null {
    const segments = pathname.split('/').filter(Boolean);
    return segments.length > 0 ? segments[0] : null;
  }

  /**
   * Check if path is reserved for system use
   */
  private isReservedPath(slug: string): boolean {
    const reservedPaths = [
      'api', 'admin', 'www', 'app', 'mobile', 'web', 
      'help', 'support', 'login', 'signup', 'dashboard',
      'static', 'assets', 'cdn', 'images', 'js', 'css'
    ];
    
    return reservedPaths.includes(slug.toLowerCase());
  }

  /**
   * Resolve slug to shop website data
   * Uses caching to improve performance
   */
  private async resolveSlug(slug: string): Promise<RouteResolution> {
    // Check cache first
    const cached = this.cache.get(slug);
    if (cached && cached.timestamp && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    try {
      // Database query to find website by slug
      const website = await this.queryWebsiteBySlug(slug);
      
      if (!website) {
        const resolution: RouteResolution = {
          slug,
          shopId: '',
          websiteId: '',
          isValid: false,
          timestamp: Date.now()
        };
        
        this.cache.set(slug, resolution);
        return resolution;
      }

      const resolution: RouteResolution = {
        slug,
        shopId: website.shopId,
        websiteId: website.id,
        isValid: true,
        timestamp: Date.now()
      };

      this.cache.set(slug, resolution);
      return resolution;

    } catch (error) {
      console.error('Error resolving slug:', error);
      return {
        slug,
        shopId: '',
        websiteId: '',
        isValid: false,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Database query to find website by subdomain slug
   */
  private async queryWebsiteBySlug(slug: string): Promise<ShopWebsite | null> {
    // This would be implemented with your database ORM/query builder
    // Example SQL: SELECT * FROM shop_websites WHERE subdomain_slug = ? AND is_published = true
    
    // Pseudo-code for database query:
    /*
    const website = await db.shopWebsites.findFirst({
      where: {
        subdomainSlug: slug,
        isPublished: true,
        status: 'published'
      },
      include: {
        shop: true
      }
    });
    
    return website;
    */
    
    // For now, return null (would be replaced with actual DB query)
    return null;
  }

  /**
   * Get full website data including shop, providers, services
   */
  private async getWebsiteData(websiteId: string): Promise<WebsiteData | null> {
    // This would fetch all related data needed to render the website
    // Including shop info, providers, services, reviews, etc.
    
    // Pseudo-code:
    /*
    const websiteData = await db.shopWebsites.findUnique({
      where: { id: websiteId },
      include: {
        shop: {
          include: {
            providers: {
              include: {
                services: true,
                reviews: true,
                portfolioImages: true
              }
            },
            services: true,
            hours: true
          }
        }
      }
    });
    
    return websiteData;
    */
    
    return null;
  }

  /**
   * Determine if user should be redirected to mobile app
   */
  private shouldRedirectToMobileApp(userAgent: string, headers: Record<string, string>): boolean {
    // Check if user is on mobile device
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Check if user has the app installed (via custom headers or cookies)
    const hasAppInstalled = headers['x-app-installed'] === 'true' || 
                           headers.cookie?.includes('app_installed=true');
    
    // Check if user explicitly wants web version
    const forceWeb = headers['x-force-web'] === 'true' || 
                    headers.cookie?.includes('force_web=true');
    
    // Only redirect mobile users who have the app and haven't opted for web
    return isMobile && hasAppInstalled && !forceWeb;
  }

  /**
   * Generate deep link for mobile app
   */
  private generateDeepLink(slug: string, action: string = 'view'): string {
    return `bookerpro://shop/${slug}?action=${action}`;
  }

  /**
   * Clear cache (useful for when websites are updated)
   */
  public clearCache(slug?: string): void {
    if (slug) {
      this.cache.delete(slug);
    } else {
      this.cache.clear();
    }
  }
}

// ============================================================================
// ROUTE HANDLER RESULTS
// ============================================================================

export type RouteHandlerResult = 
  | MainAppRoute
  | WebsiteRoute
  | MobileRedirectRoute
  | NotFoundRoute
  | ReservedRoute
  | UnpublishedRoute;

interface BaseRoute {
  type: string;
  action: string;
  slug?: string;
}

interface MainAppRoute extends BaseRoute {
  type: 'main_app';
  action: 'serve_main_app';
}

interface WebsiteRoute extends BaseRoute {
  type: 'website';
  action: 'serve_website';
  slug: string;
  websiteId: string;
  shopId: string;
  website: WebsiteData;
}

interface MobileRedirectRoute extends BaseRoute {
  type: 'mobile_redirect';
  action: 'redirect_to_app';
  slug: string;
  deepLink: string;
  fallbackUrl: string;
}

interface NotFoundRoute extends BaseRoute {
  type: 'not_found';
  action: 'serve_404';
  slug: string;
}

interface ReservedRoute extends BaseRoute {
  type: 'reserved';
  action: 'serve_main_app';
}

interface UnpublishedRoute extends BaseRoute {
  type: 'unpublished';
  action: 'serve_404';
  slug: string;
}

// ============================================================================
// WEBSITE DATA STRUCTURE
// ============================================================================

export interface WebsiteData {
  website: ShopWebsite;
  shop: Shop;
  providers: Provider[];
  services: Service[];
  reviews: Review[];
  analytics: {
    pageViews: number;
    rating: number;
    reviewCount: number;
  };
}

// ============================================================================
// CACHING STRATEGY
// ============================================================================

export interface CacheStrategy {
  // In-memory cache for route resolutions
  routeCache: {
    ttl: number; // Time to live in milliseconds
    maxSize: number; // Maximum number of entries
  };
  
  // CDN cache for static website content
  cdnCache: {
    ttl: number; // Time to live for CDN cache
    purgeOnUpdate: boolean; // Purge cache when website is updated
  };
  
  // Database query cache
  dbCache: {
    ttl: number; // Time to live for database query results
    invalidateOnUpdate: boolean; // Invalidate when data changes
  };
}

export const DEFAULT_CACHE_STRATEGY: CacheStrategy = {
  routeCache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 10000 // 10k entries
  },
  cdnCache: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    purgeOnUpdate: true
  },
  dbCache: {
    ttl: 10 * 60 * 1000, // 10 minutes
    invalidateOnUpdate: true
  }
};

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export interface PerformanceMetrics {
  routeResolutionTime: number; // Time to resolve slug to website
  databaseQueryTime: number; // Time for database queries
  cacheHitRate: number; // Percentage of cache hits
  totalRequestTime: number; // Total time to handle request
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  
  startTimer(): PerformanceTimer {
    return new PerformanceTimer();
  }
  
  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }
  
  getAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        routeResolutionTime: 0,
        databaseQueryTime: 0,
        cacheHitRate: 0,
        totalRequestTime: 0
      };
    }
    
    const sum = this.metrics.reduce((acc, metric) => ({
      routeResolutionTime: acc.routeResolutionTime + metric.routeResolutionTime,
      databaseQueryTime: acc.databaseQueryTime + metric.databaseQueryTime,
      cacheHitRate: acc.cacheHitRate + metric.cacheHitRate,
      totalRequestTime: acc.totalRequestTime + metric.totalRequestTime
    }), {
      routeResolutionTime: 0,
      databaseQueryTime: 0,
      cacheHitRate: 0,
      totalRequestTime: 0
    });
    
    const count = this.metrics.length;
    return {
      routeResolutionTime: sum.routeResolutionTime / count,
      databaseQueryTime: sum.databaseQueryTime / count,
      cacheHitRate: sum.cacheHitRate / count,
      totalRequestTime: sum.totalRequestTime / count
    };
  }
}

class PerformanceTimer {
  private startTime: number = Date.now();
  
  elapsed(): number {
    return Date.now() - this.startTime;
  }
  
  reset(): void {
    this.startTime = Date.now();
  }
}