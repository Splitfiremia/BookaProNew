import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebsiteTemplate } from '@/models/shopWebsite';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
}

class CacheService {
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxMemorySize = 100;

  /**
   * Get item from cache (memory first, then AsyncStorage)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const memoryItem = this.memoryCache.get(key);
      if (memoryItem && memoryItem.expiresAt > Date.now()) {
        return memoryItem.data as T;
      }

      // Check AsyncStorage
      const storedItem = await AsyncStorage.getItem(`cache_${key}`);
      if (storedItem) {
        const parsedItem: CacheItem<T> = JSON.parse(storedItem);
        if (parsedItem.expiresAt > Date.now()) {
          // Update memory cache
          this.memoryCache.set(key, parsedItem);
          this.cleanupMemoryCache();
          return parsedItem.data;
        } else {
          // Remove expired item
          await AsyncStorage.removeItem(`cache_${key}`);
        }
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set item in cache (both memory and AsyncStorage)
   */
  async set<T>(key: string, data: T, config?: CacheConfig): Promise<void> {
    try {
      const ttl = config?.ttl || this.defaultTTL;
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      // Set in memory cache
      this.memoryCache.set(key, cacheItem);
      this.cleanupMemoryCache();

      // Set in AsyncStorage
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Remove item from cache
   */
  async remove(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key);
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Check if item exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const item = await this.get(key);
    return item !== null;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    memorySize: number;
    storageKeys: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      return {
        memorySize: this.memoryCache.size,
        storageKeys: cacheKeys.length,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { memorySize: 0, storageKeys: 0 };
    }
  }

  /**
   * Clean up expired items from memory cache
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    const entries = Array.from(this.memoryCache.entries());
    
    // Remove expired items
    for (const [key, item] of entries) {
      if (item.expiresAt <= now) {
        this.memoryCache.delete(key);
      }
    }

    // Remove oldest items if cache is too large
    if (this.memoryCache.size > this.maxMemorySize) {
      const sortedEntries = entries
        .filter(([, item]) => item.expiresAt > now)
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const itemsToRemove = sortedEntries.slice(0, this.memoryCache.size - this.maxMemorySize);
      for (const [key] of itemsToRemove) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Clean up expired items from AsyncStorage
   */
  async cleanupStorage(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const key of cacheKeys) {
        try {
          const item = await AsyncStorage.getItem(key);
          if (item) {
            const parsedItem: CacheItem<any> = JSON.parse(item);
            if (parsedItem.expiresAt <= now) {
              expiredKeys.push(key);
            }
          }
        } catch (error) {
          // If we can't parse the item, consider it expired
          expiredKeys.push(key);
        }
      }

      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}

// Template-specific cache methods
class TemplateCacheService extends CacheService {
  private readonly templateTTL = 60 * 60 * 1000; // 1 hour
  private readonly assetTTL = 24 * 60 * 60 * 1000; // 24 hours

  async getTemplate(templateId: string): Promise<WebsiteTemplate | null> {
    return this.get<WebsiteTemplate>(`template_${templateId}`);
  }

  async setTemplate(templateId: string, template: WebsiteTemplate): Promise<void> {
    await this.set(`template_${templateId}`, template, { ttl: this.templateTTL });
  }

  async getAllTemplates(): Promise<WebsiteTemplate[] | null> {
    return this.get<WebsiteTemplate[]>('all_templates');
  }

  async setAllTemplates(templates: WebsiteTemplate[]): Promise<void> {
    await this.set('all_templates', templates, { ttl: this.templateTTL });
  }

  async getAsset(assetUrl: string): Promise<string | null> {
    const key = `asset_${this.hashUrl(assetUrl)}`;
    return this.get<string>(key);
  }

  async setAsset(assetUrl: string, assetData: string): Promise<void> {
    const key = `asset_${this.hashUrl(assetUrl)}`;
    await this.set(key, assetData, { ttl: this.assetTTL });
  }

  async preloadTemplateAssets(template: WebsiteTemplate): Promise<void> {
    const assetUrls = this.extractAssetUrls(template);
    
    const preloadPromises = assetUrls.map(async (url) => {
      const cached = await this.getAsset(url);
      if (!cached) {
        try {
          // In a real app, you would fetch the asset
          // For now, we'll just cache the URL
          await this.setAsset(url, url);
        } catch (error) {
          console.warn(`Failed to preload asset: ${url}`, error);
        }
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  private hashUrl(url: string): string {
    // Simple hash function for URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private extractAssetUrls(template: WebsiteTemplate): string[] {
    const urls: string[] = [];
    
    // Extract URLs from template preview
    if (template.previewImageUrl) {
      urls.push(template.previewImageUrl);
    }
    
    // For now, just return the preview image URL since WebsiteTemplate doesn't have htmlContent
    // In a real app, you would extract URLs from the template's HTML content
    
    return [...new Set(urls)]; // Remove duplicates
  }
}

// Export singleton instances
export const cacheService = new CacheService();
export const templateCacheService = new TemplateCacheService();

// Export types
export type { CacheItem, CacheConfig };