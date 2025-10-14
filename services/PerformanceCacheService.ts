import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, AppState, AppStateStatus } from 'react-native';

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  priority: 'high' | 'medium' | 'low';
  persist: boolean; // Whether to persist to AsyncStorage
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  priority: 'high' | 'medium' | 'low';
  accessCount: number;
  lastAccessed: number;
  size?: number; // Estimated size in bytes
}

// Default cache configurations for different data types
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  user: { ttl: 24 * 60 * 60 * 1000, maxSize: 1, priority: 'high', persist: true }, // 24 hours
  appointments: { ttl: 5 * 60 * 1000, maxSize: 100, priority: 'high', persist: true }, // 5 minutes
  services: { ttl: 30 * 60 * 1000, maxSize: 50, priority: 'medium', persist: true }, // 30 minutes
  providers: { ttl: 15 * 60 * 1000, maxSize: 200, priority: 'medium', persist: true }, // 15 minutes
  shops: { ttl: 60 * 60 * 1000, maxSize: 100, priority: 'low', persist: false }, // 1 hour
  analytics: { ttl: 10 * 60 * 1000, maxSize: 20, priority: 'low', persist: false }, // 10 minutes
  images: { ttl: 60 * 60 * 1000, maxSize: 50, priority: 'medium', persist: false }, // 1 hour
};

class PerformanceCacheService {
  private memoryCache = new Map<string, CacheItem<any>>();
  private cacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
    errors: 0,
  };
  private cleanupInterval: NodeJS.Timeout | null = null;
  private statsInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private maxMemorySize = 50 * 1024 * 1024; // 50MB max memory usage
  private currentMemorySize = 0;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load high-priority persisted items on startup
      await this.loadPersistedHighPriorityItems();
      
      // Setup cleanup interval
      this.cleanupInterval = setInterval(() => this.cleanupExpired(), 5 * 60 * 1000);
      
      // Setup stats logging in development
      if (__DEV__) {
        this.statsInterval = setInterval(() => this.logStats(), 10 * 60 * 1000);
      }

      // Setup app state listeners for memory management
      AppState.addEventListener('change', this.handleAppStateChange);
      
      // Apply platform optimizations
      this.optimizeForPlatform();
      
      this.isInitialized = true;
      console.log('PerformanceCacheService: Initialized successfully');
    } catch (error) {
      console.error('PerformanceCacheService: Initialization failed:', error);
    }
  }

  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // Reduce memory footprint when app goes to background
      this.reduceMemoryFootprint();
    }
  };

  private async loadPersistedHighPriorityItems(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache:'));
      
      for (const key of cacheKeys) {
        try {
          const persistedData = await AsyncStorage.getItem(key);
          if (persistedData) {
            const parsedItem: CacheItem<any> = JSON.parse(persistedData);
            
            // Only load high priority, non-expired items
            if (parsedItem.priority === 'high' && !this.isExpired(parsedItem)) {
              const namespace = this.getNamespaceFromKey(key);
              const config = this.getConfig(namespace);
              
              // Check if we have space before loading
              if (this.canAddToMemory(key, parsedItem)) {
                this.memoryCache.set(key, parsedItem);
                this.updateMemorySize(key, parsedItem);
              }
            }
          }
        } catch (itemError) {
          console.warn(`PerformanceCacheService: Failed to load cached item ${key}:`, itemError);
        }
      }
      
      console.log(`PerformanceCacheService: Loaded ${this.memoryCache.size} persisted items`);
    } catch (error) {
      console.error('PerformanceCacheService: Failed to load persisted items:', error);
    }
  }

  // Generate cache key
  private generateKey(namespace: string, key: string): string {
    return `cache:${namespace}:${key}`;
  }

  // Extract namespace from key
  private getNamespaceFromKey(cacheKey: string): string {
    const parts = cacheKey.split(':');
    return parts[1] || 'default';
  }

  // Get cache configuration
  private getConfig(namespace: string): CacheConfig {
    return CACHE_CONFIGS[namespace] || { 
      ttl: 5 * 60 * 1000, 
      maxSize: 50, 
      priority: 'medium',
      persist: false 
    };
  }

  // Check if item is expired
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  // Estimate size of an item in bytes
  private estimateSize(data: any): number {
    try {
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch {
      return 1024; // Default 1KB estimate if serialization fails
    }
  }

  // Check if we can add item to memory without exceeding limits
  private canAddToMemory(key: string, item: CacheItem<any>): boolean {
    const namespace = this.getNamespaceFromKey(key);
    const config = this.getConfig(namespace);
    
    // Check namespace size limit
    const namespaceItems = Array.from(this.memoryCache.entries())
      .filter(([k]) => this.getNamespaceFromKey(k) === namespace);
    
    if (namespaceItems.length >= config.maxSize) {
      return false;
    }
    
    // Check total memory limit
    const itemSize = item.size || this.estimateSize(item.data);
    return this.currentMemorySize + itemSize <= this.maxMemorySize;
  }

  // Update memory size tracking
  private updateMemorySize(key: string, item: CacheItem<any>, oldItem?: CacheItem<any>): void {
    const newSize = item.size || this.estimateSize(item.data);
    const oldSize = oldItem ? (oldItem.size || this.estimateSize(oldItem.data)) : 0;
    
    this.currentMemorySize += newSize - oldSize;
  }

  // Update access statistics
  private updateAccess(item: CacheItem<any>): void {
    item.accessCount++;
    item.lastAccessed = Date.now();
  }

  // Evict items based on LRU and priority
  private evictItems(namespace: string, maxSize: number): void {
    const namespaceItems = Array.from(this.memoryCache.entries())
      .filter(([key]) => this.getNamespaceFromKey(key) === namespace)
      .map(([key, item]) => ({ key, item }));

    if (namespaceItems.length <= maxSize) return;

    // Sort by priority (low first), then by last accessed (oldest first), then by access count
    namespaceItems.sort((a, b) => {
      const priorityOrder = { low: 0, medium: 1, high: 2 };
      const priorityDiff = priorityOrder[a.item.priority] - priorityOrder[b.item.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      const accessDiff = a.item.lastAccessed - b.item.lastAccessed;
      if (accessDiff !== 0) return accessDiff;
      
      return a.item.accessCount - b.item.accessCount;
    });

    // Remove excess items
    const itemsToRemove = namespaceItems.slice(0, namespaceItems.length - maxSize);
    
    for (const { key, item } of itemsToRemove) {
      this.memoryCache.delete(key);
      this.updateMemorySize(key, item); // This will subtract the size
      this.cacheStats.evictions++;
    }

    if (itemsToRemove.length > 0 && __DEV__) {
      console.log(`PerformanceCacheService: Evicted ${itemsToRemove.length} items from ${namespace}`);
    }
  }

  // Reduce memory footprint
  private reduceMemoryFootprint(): void {
    const currentSize = this.memoryCache.size;
    if (currentSize <= 50) return; // Don't reduce if already small

    // Keep only high and medium priority items
    const itemsToKeep = Array.from(this.memoryCache.entries())
      .filter(([_, item]) => item.priority === 'high' || item.priority === 'medium')
      .slice(0, 75); // Keep max 75 items

    this.memoryCache.clear();
    this.currentMemorySize = 0;
    
    for (const [key, item] of itemsToKeep) {
      this.memoryCache.set(key, item);
      this.updateMemorySize(key, item);
    }

    if (__DEV__) {
      console.log(`PerformanceCacheService: Reduced memory footprint from ${currentSize} to ${this.memoryCache.size} items`);
    }
  }

  // Clean up expired items
  private cleanupExpired(): void {
    if (this.memoryCache.size === 0) return;

    const expiredKeys: string[] = [];
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      const item = this.memoryCache.get(key);
      this.memoryCache.delete(key);
      if (item) {
        this.updateMemorySize(key, item); // Subtract size
      }
    }
    
    if (expiredKeys.length > 0 && __DEV__) {
      console.log(`PerformanceCacheService: Cleaned up ${expiredKeys.length} expired items`);
    }

    // Also clean up persistent storage
    this.cleanupPersistentExpired();
  }

  // Clean up expired items in persistent storage
  private async cleanupPersistentExpired(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache:'));
      
      for (const key of cacheKeys) {
        try {
          const persistedData = await AsyncStorage.getItem(key);
          if (persistedData) {
            const parsedItem: CacheItem<any> = JSON.parse(persistedData);
            if (this.isExpired(parsedItem)) {
              await AsyncStorage.removeItem(key);
            }
          }
        } catch (itemError) {
          // Remove corrupted items
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('PerformanceCacheService: Failed to clean persistent storage:', error);
    }
  }

  // Get item from cache
  async get<T>(namespace: string, key: string): Promise<T | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.cacheStats.totalRequests++;
    
    const cacheKey = this.generateKey(namespace, key);
    
    try {
      // Check memory cache first
      const memoryItem = this.memoryCache.get(cacheKey);
      if (memoryItem) {
        if (this.isExpired(memoryItem)) {
          // Remove expired item
          this.memoryCache.delete(cacheKey);
          this.updateMemorySize(cacheKey, memoryItem);
          return null;
        }
        
        this.updateAccess(memoryItem);
        this.cacheStats.hits++;
        
        if (__DEV__) {
          console.log(`PerformanceCacheService: Memory cache hit for ${namespace}:${key}`);
        }
        
        return memoryItem.data;
      }

      // Check persistent storage for persisted items
      const config = this.getConfig(namespace);
      if (config.persist) {
        const persistedData = await AsyncStorage.getItem(cacheKey);
        if (persistedData) {
          const parsedItem: CacheItem<T> = JSON.parse(persistedData);
          if (!this.isExpired(parsedItem)) {
            // Restore to memory cache if we have space
            if (this.canAddToMemory(cacheKey, parsedItem)) {
              this.memoryCache.set(cacheKey, parsedItem);
              this.updateMemorySize(cacheKey, parsedItem);
            }
            
            this.cacheStats.hits++;
            
            if (__DEV__) {
              console.log(`PerformanceCacheService: Persistent cache hit for ${namespace}:${key}`);
            }
            
            return parsedItem.data;
          } else {
            // Remove expired persistent item
            await AsyncStorage.removeItem(cacheKey);
          }
        }
      }

      this.cacheStats.misses++;
      return null;
    } catch (error) {
      this.cacheStats.errors++;
      console.warn(`PerformanceCacheService: Error getting ${namespace}:${key}:`, error);
      return null;
    }
  }

  // Set item in cache
  async set<T>(namespace: string, key: string, data: T): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const cacheKey = this.generateKey(namespace, key);
    const config = this.getConfig(namespace);
    
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: config.ttl,
        priority: config.priority,
        accessCount: 1,
        lastAccessed: Date.now(),
        size: this.estimateSize(data),
      };

      const oldItem = this.memoryCache.get(cacheKey);

      // Store in memory cache if we have space
      if (this.canAddToMemory(cacheKey, cacheItem)) {
        this.memoryCache.set(cacheKey, cacheItem);
        this.updateMemorySize(cacheKey, cacheItem, oldItem);
        
        // Evict if necessary
        this.evictItems(namespace, config.maxSize);
      }

      // Store in persistent storage for persisted items
      if (config.persist) {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      }

      if (__DEV__) {
        console.log(`PerformanceCacheService: Cached ${namespace}:${key} with TTL ${config.ttl}ms`);
      }
      
      return true;
    } catch (error) {
      this.cacheStats.errors++;
      console.warn(`PerformanceCacheService: Error setting ${namespace}:${key}:`, error);
      return false;
    }
  }

  // Remove item from cache
  async remove(namespace: string, key: string): Promise<boolean> {
    const cacheKey = this.generateKey(namespace, key);
    
    try {
      const oldItem = this.memoryCache.get(cacheKey);
      this.memoryCache.delete(cacheKey);
      
      if (oldItem) {
        this.updateMemorySize(cacheKey, oldItem);
      }

      const config = this.getConfig(namespace);
      if (config.persist) {
        await AsyncStorage.removeItem(cacheKey);
      }

      if (__DEV__) {
        console.log(`PerformanceCacheService: Removed ${namespace}:${key}`);
      }
      
      return true;
    } catch (error) {
      this.cacheStats.errors++;
      console.warn(`PerformanceCacheService: Error removing ${namespace}:${key}:`, error);
      return false;
    }
  }

  // Clear namespace
  async clearNamespace(namespace: string): Promise<boolean> {
    try {
      const keysToRemove: string[] = [];
      
      for (const key of this.memoryCache.keys()) {
        if (this.getNamespaceFromKey(key) === namespace) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        const item = this.memoryCache.get(key);
        this.memoryCache.delete(key);
        if (item) {
          this.updateMemorySize(key, item);
        }
      }

      // Clear from persistent storage
      const config = this.getConfig(namespace);
      if (config.persist) {
        const allKeys = await AsyncStorage.getAllKeys();
        const namespacePersistentKeys = allKeys.filter(key => 
          this.getNamespaceFromKey(key) === namespace
        );
        
        if (namespacePersistentKeys.length > 0) {
          await AsyncStorage.multiRemove(namespacePersistentKeys);
        }
      }

      if (__DEV__) {
        console.log(`PerformanceCacheService: Cleared namespace ${namespace} (${keysToRemove.length} items)`);
      }
      
      return true;
    } catch (error) {
      this.cacheStats.errors++;
      console.warn(`PerformanceCacheService: Error clearing namespace ${namespace}:`, error);
      return false;
    }
  }

  // Get or set with fallback
  async getOrSet<T>(
    namespace: string, 
    key: string, 
    fallback: () => Promise<T>,
    options?: { forceRefresh?: boolean }
  ): Promise<T> {
    if (!options?.forceRefresh) {
      const cached = await this.get<T>(namespace, key);
      if (cached !== null) {
        return cached;
      }
    }

    if (__DEV__) {
      console.log(`PerformanceCacheService: Cache miss for ${namespace}:${key}, executing fallback`);
    }
    
    const data = await fallback();
    await this.set(namespace, key, data);
    
    return data;
  }

  // Batch operations
  async getBatch<T>(namespace: string, keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};
    
    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.get<T>(namespace, key);
      })
    );

    return results;
  }

  async setBatch<T>(namespace: string, items: Record<string, T>): Promise<void> {
    const entries = Object.entries(items);
    
    for (const [key, data] of entries) {
      await this.set(namespace, key, data);
    }
  }

  // Preload data
  async preload<T>(
    namespace: string, 
    key: string, 
    loader: () => Promise<T>
  ): Promise<boolean> {
    try {
      // Only preload if not already cached
      const existing = await this.get<T>(namespace, key);
      if (existing === null) {
        const data = await loader();
        const success = await this.set(namespace, key, data);
        
        if (__DEV__ && success) {
          console.log(`PerformanceCacheService: Preloaded ${namespace}:${key}`);
        }
        
        return success;
      }
      return true;
    } catch (error) {
      console.warn(`PerformanceCacheService: Error preloading ${namespace}:${key}:`, error);
      return false;
    }
  }

  // Cache statistics
  getStats() {
    const hitRate = this.cacheStats.totalRequests > 0 
      ? (this.cacheStats.hits / this.cacheStats.totalRequests * 100).toFixed(2)
      : '0.00';

    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      memorySize: this.memoryCache.size,
      memoryUsage: `${(this.currentMemorySize / 1024 / 1024).toFixed(2)}MB`,
      maxMemory: `${(this.maxMemorySize / 1024 / 1024).toFixed(2)}MB`,
      initialized: this.isInitialized,
    };
  }

  // Log statistics
  private logStats(): void {
    const stats = this.getStats();
    console.log('PerformanceCacheService Stats:', stats);
  }

  // Clear all cache
  async clearAll(): Promise<boolean> {
    try {
      this.memoryCache.clear();
      this.currentMemorySize = 0;
      
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache:'));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }

      // Reset stats
      this.cacheStats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalRequests: 0,
        errors: 0,
      };

      if (__DEV__) {
        console.log('PerformanceCacheService: Cleared all cache');
      }
      
      return true;
    } catch (error) {
      console.warn('PerformanceCacheService: Error clearing all cache:', error);
      return false;
    }
  }

  // Platform-specific optimizations
  private optimizeForPlatform(): void {
    if (Platform.OS === 'web') {
      // Web-specific optimizations
      this.maxMemorySize = 100 * 1024 * 1024; // 100MB on web
      
      if (__DEV__) {
        console.log('PerformanceCacheService: Applied web optimizations (100MB limit)');
      }
    } else {
      // Mobile-specific optimizations - more conservative
      this.maxMemorySize = 25 * 1024 * 1024; // 25MB on mobile
      
      // Reduce cache sizes on mobile
      Object.keys(CACHE_CONFIGS).forEach(namespace => {
        CACHE_CONFIGS[namespace].maxSize = Math.floor(CACHE_CONFIGS[namespace].maxSize * 0.6);
      });
      
      if (__DEV__) {
        console.log('PerformanceCacheService: Applied mobile optimizations (25MB limit)');
      }
    }
  }

  // Cleanup method to call when service is no longer needed
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.memoryCache.clear();
    this.currentMemorySize = 0;
    this.isInitialized = false;
    
    if (__DEV__) {
      console.log('PerformanceCacheService: Destroyed');
    }
  }
}

// Singleton instance
export const performanceCache = new PerformanceCacheService();

// Export cache service
export default performanceCache;