import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { DeepLinkParser, DeepLinkParams, DEFAULT_DEEP_LINK_CONFIG } from '@/models/deepLinking';

export class DeepLinkHandler {
  private parser: DeepLinkParser;

  constructor() {
    this.parser = new DeepLinkParser(DEFAULT_DEEP_LINK_CONFIG);
  }

  /**
   * Initialize deep link handling
   */
  initialize() {
    console.log('DeepLinkHandler: Initializing deep link handling');
    
    // Handle incoming URLs when app is already running
    Linking.addEventListener('url', this.handleIncomingURL);
    
    // Handle initial URL when app is opened from a deep link
    this.handleInitialURL();
  }

  /**
   * Clean up event listeners
   */
  cleanup() {
    console.log('DeepLinkHandler: Cleaning up deep link handling');
    // Note: Linking.removeAllListeners is not available in newer versions
    // Event listeners are automatically cleaned up when component unmounts
  }

  /**
   * Handle initial URL when app is opened from deep link
   */
  private handleInitialURL = async () => {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('DeepLinkHandler: Handling initial URL:', initialUrl);
        this.processDeepLink(initialUrl);
      }
    } catch (error) {
      console.error('DeepLinkHandler: Error getting initial URL:', error);
    }
  };

  /**
   * Handle incoming URLs when app is running
   */
  private handleIncomingURL = (event: { url: string }) => {
    console.log('DeepLinkHandler: Handling incoming URL:', event.url);
    this.processDeepLink(event.url);
  };

  /**
   * Process deep link and navigate to appropriate screen
   */
  private processDeepLink = (url: string) => {
    try {
      // Validate URL input
      if (!url || typeof url !== 'string' || url.trim().length === 0) {
        console.warn('DeepLinkHandler: Invalid URL provided');
        return;
      }
      
      if (url.length > 2000) {
        console.warn('DeepLinkHandler: URL too long');
        return;
      }
      
      const sanitizedUrl = url.trim();
      console.log('DeepLinkHandler: Processing deep link:', sanitizedUrl);
      
      // Parse the deep link
      const params = this.parser.parseDeepLink(sanitizedUrl);
      
      if (!params) {
        console.warn('DeepLinkHandler: Invalid deep link format:', url);
        return;
      }

      console.log('DeepLinkHandler: Parsed params:', params);
      
      // Navigate based on the parsed parameters
      this.navigateToShop(params);
      
    } catch (error) {
      console.error('DeepLinkHandler: Error processing deep link:', error);
    }
  };

  /**
   * Navigate to shop based on deep link parameters
   */
  private navigateToShop = (params: DeepLinkParams) => {
    // Validate params
    if (!params || !params.shopSlug || typeof params.shopSlug !== 'string') {
      console.warn('DeepLinkHandler: Invalid navigation parameters');
      return;
    }
    
    const { shopSlug, action, providerId, serviceId, date, time } = params;
    
    console.log('DeepLinkHandler: Navigating to shop:', { shopSlug, action, providerId, serviceId });

    try {
      // Base navigation path
      let navigationPath = '';
      
      switch (action) {
        case 'book':
          if (providerId) {
            // Navigate to specific provider booking
            navigationPath = `/(app)/(client)/provider/${providerId}`;
            
            // Add query parameters for pre-filled booking
            const queryParams = new URLSearchParams();
            if (serviceId) queryParams.append('serviceId', serviceId);
            if (date) queryParams.append('date', date);
            if (time) queryParams.append('time', time);
            queryParams.append('shopSlug', shopSlug);
            
            if (queryParams.toString()) {
              navigationPath += `?${queryParams.toString()}`;
            }
          } else if (serviceId) {
            // Navigate to service booking (find provider offering this service)
            navigationPath = `/(app)/(client)/booking/select-service?serviceId=${serviceId}&shopSlug=${shopSlug}`;
          } else {
            // Navigate to shop's general booking flow
            navigationPath = `/(app)/(client)/shops/${shopSlug}?action=book`;
          }
          break;
          
        case 'view':
          if (providerId) {
            // Navigate to specific provider profile
            navigationPath = `/(app)/(client)/provider/${providerId}?shopSlug=${shopSlug}`;
          } else {
            // Navigate to shop view
            navigationPath = `/(app)/(client)/shops/${shopSlug}`;
          }
          break;
          
        case 'contact':
          // Navigate to shop contact/info page
          navigationPath = `/(app)/(client)/shops/${shopSlug}?action=contact`;
          break;
          
        case 'services':
          // Navigate to shop services page
          navigationPath = `/(app)/(client)/shops/${shopSlug}?action=services`;
          break;
          
        case 'portfolio':
          // Navigate to shop portfolio page
          navigationPath = `/(app)/(client)/shops/${shopSlug}?action=portfolio`;
          break;
          
        case 'reviews':
          // Navigate to shop reviews page
          navigationPath = `/(app)/(client)/shops/${shopSlug}?action=reviews`;
          break;
          
        default:
          // Default to shop view
          navigationPath = `/(app)/(client)/shops/${shopSlug}`;
          break;
      }
      
      console.log('DeepLinkHandler: Navigating to:', navigationPath);
      
      // Use router.push to navigate
      router.push(navigationPath as any);
      
      // Track analytics if UTM parameters are present
      this.trackDeepLinkOpen(params);
      
    } catch (error) {
      console.error('DeepLinkHandler: Error navigating to shop:', error);
      
      // Fallback to home screen
      router.push('/(app)/(client)/(tabs)/home');
    }
  };

  /**
   * Track deep link analytics
   */
  private trackDeepLinkOpen = (params: DeepLinkParams) => {
    try {
      // Validate params
      if (!params || !params.shopSlug) {
        console.warn('DeepLinkHandler: Invalid params for tracking');
        return;
      }
      
      const { shopSlug, action, utm_source, utm_medium, utm_campaign } = params;
      
      console.log('DeepLinkHandler: Tracking deep link open:', {
        shopSlug,
        action,
        utm_source,
        utm_medium,
        utm_campaign
      });
      
      // TODO: Integrate with analytics service
      // Analytics.track('deep_link_opened', {
      //   shop_slug: shopSlug,
      //   action: action || 'view',
      //   utm_source,
      //   utm_medium,
      //   utm_campaign,
      //   timestamp: new Date().toISOString()
      // });
      
    } catch (error) {
      console.error('DeepLinkHandler: Error tracking deep link:', error);
    }
  };

  /**
   * Test deep link handling (for development)
   */
  testDeepLink = (url: string) => {
    // Validate URL input
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      console.warn('DeepLinkHandler: Invalid test URL provided');
      return;
    }
    
    const sanitizedUrl = url.trim();
    console.log('DeepLinkHandler: Testing deep link:', sanitizedUrl);
    this.processDeepLink(sanitizedUrl);
  };
}

// Export singleton instance
export const deepLinkHandler = new DeepLinkHandler();

// Export utility functions
export const initializeDeepLinking = () => {
  deepLinkHandler.initialize();
};

export const cleanupDeepLinking = () => {
  deepLinkHandler.cleanup();
};

export const testDeepLink = (url: string) => {
  // Validate URL input
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    console.warn('testDeepLink: Invalid URL provided');
    return;
  }
  
  if (url.length > 2000) {
    console.warn('testDeepLink: URL too long');
    return;
  }
  
  const sanitizedUrl = url.trim();
  deepLinkHandler.testDeepLink(sanitizedUrl);
};

// Example deep link URLs for testing:
export const EXAMPLE_DEEP_LINKS = {
  // Basic shop view
  shopView: 'bookerpro://shop/demoshop',
  
  // Book appointment
  bookAppointment: 'bookerpro://shop/demoshop?action=book',
  
  // Book with specific provider
  bookWithProvider: 'bookerpro://shop/demoshop?action=book&providerId=123',
  
  // Book with service
  bookWithService: 'bookerpro://shop/demoshop?action=book&serviceId=456',
  
  // Pre-filled booking
  preFilledBooking: 'bookerpro://shop/demoshop?action=book&providerId=123&serviceId=456&date=2024-03-15&time=14:00',
  
  // With analytics
  withAnalytics: 'bookerpro://shop/demoshop?action=book&utm_source=website&utm_medium=button&utm_campaign=hero_cta',
  
  // Provider profile
  providerProfile: 'bookerpro://shop/demoshop?action=view&providerId=123',
  
  // Shop contact
  shopContact: 'bookerpro://shop/demoshop?action=contact',
  
  // Shop services
  shopServices: 'bookerpro://shop/demoshop?action=services'
};