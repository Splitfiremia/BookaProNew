import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export abstract class BaseRepository<T extends { id: string; createdAt: string; updatedAt: string }> implements Repository<T> {
  protected abstract storageKey: string;
  protected cache: Map<string, T[]> = new Map();
  protected cacheExpiry: Map<string, number> = new Map();
  protected readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  protected generateId(): string {
    return `${this.storageKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected async getStorageData(key?: string): Promise<T[]> {
    const storageKey = key || this.storageKey;
    
    // Check cache first
    const cached = this.cache.get(storageKey);
    const cacheTime = this.cacheExpiry.get(storageKey);
    
    if (cached && cacheTime && Date.now() - cacheTime < this.CACHE_DURATION) {
      console.log(`BaseRepository: Cache hit for ${storageKey}`);
      return cached;
    }

    try {
      console.log(`BaseRepository: Loading from storage ${storageKey}`);
      const stored = await AsyncStorage.getItem(storageKey);
      const data = stored ? JSON.parse(stored) : [];
      
      // Update cache
      this.cache.set(storageKey, data);
      this.cacheExpiry.set(storageKey, Date.now());
      
      return data;
    } catch (error) {
      console.error(`BaseRepository: Error loading ${storageKey}:`, error);
      return [];
    }
  }

  protected async setStorageData(data: T[], key?: string): Promise<void> {
    const storageKey = key || this.storageKey;
    
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      
      // Update cache
      this.cache.set(storageKey, data);
      this.cacheExpiry.set(storageKey, Date.now());
      
      console.log(`BaseRepository: Saved to storage ${storageKey}`);
    } catch (error) {
      console.error(`BaseRepository: Error saving ${storageKey}:`, error);
      throw error;
    }
  }

  async getAll(): Promise<T[]> {
    return this.getStorageData();
  }

  async getById(id: string): Promise<T | null> {
    const items = await this.getAll();
    return items.find(item => item.id === id) || null;
  }

  async create(itemData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date().toISOString();
    const newItem = {
      ...itemData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    } as T;

    const items = await this.getAll();
    const updatedItems = [...items, newItem];
    await this.setStorageData(updatedItems);
    
    return newItem;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const items = await this.getAll();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return null;
    }

    const updatedItem = {
      ...items[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    items[itemIndex] = updatedItem;
    await this.setStorageData(items);
    
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    const items = await this.getAll();
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return false; // Item not found
    }

    await this.setStorageData(filteredItems);
    return true;
  }

  async clear(): Promise<void> {
    await this.setStorageData([]);
    this.cache.delete(this.storageKey);
    this.cacheExpiry.delete(this.storageKey);
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  invalidateCache(key?: string): void {
    const storageKey = key || this.storageKey;
    this.cache.delete(storageKey);
    this.cacheExpiry.delete(storageKey);
  }
}