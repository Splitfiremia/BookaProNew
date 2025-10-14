import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';

interface BatchOperation {
  key: string;
  value: string;
  operation: 'set' | 'remove';
}

interface BatchReadOperation {
  key: string;
}

class AsyncStorageBatch {
  private operations: BatchOperation[] = [];
  private readOperations: BatchReadOperation[] = [];
  private batchTimeout: number | null = null;
  private readonly BATCH_DELAY = 10; // 10ms delay to batch operations

  // Add a set operation to the batch
  set(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const serializedValue = JSON.stringify(value);
        this.operations.push({ key, value: serializedValue, operation: 'set' });
        this.scheduleBatchExecution();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Add a remove operation to the batch
  remove(key: string): Promise<void> {
    return new Promise((resolve) => {
      this.operations.push({ key, value: '', operation: 'remove' });
      this.scheduleBatchExecution();
      resolve();
    });
  }

  // Batch read multiple keys
  async multiGet(keys: string[]): Promise<{ [key: string]: any }> {
    try {
      const results = await AsyncStorage.multiGet(keys);
      const parsed: { [key: string]: any } = {};
      
      results.forEach(([key, value]) => {
        if (value !== null) {
          try {
            parsed[key] = JSON.parse(value);
          } catch {
            parsed[key] = value;
          }
        } else {
          parsed[key] = null;
        }
      });
      
      return parsed;
    } catch (error) {
      console.error('AsyncStorage multiGet error:', error);
      throw error;
    }
  }

  // Execute all batched operations
  private async executeBatch(): Promise<void> {
    if (this.operations.length === 0) return;

    const currentOperations = [...this.operations];
    this.operations = [];

    try {
      // Group operations by type
      const setOperations = currentOperations.filter(op => op.operation === 'set');
      const removeOperations = currentOperations.filter(op => op.operation === 'remove');

      // Execute set operations in batch
      if (setOperations.length > 0) {
        const setData: [string, string][] = setOperations.map(op => [op.key, op.value]);
        await AsyncStorage.multiSet(setData);
      }

      // Execute remove operations in batch
      if (removeOperations.length > 0) {
        const removeKeys = removeOperations.map(op => op.key);
        await AsyncStorage.multiRemove(removeKeys);
      }

      console.log(`AsyncStorage batch executed: ${setOperations.length} sets, ${removeOperations.length} removes`);
    } catch (error) {
      console.error('AsyncStorage batch execution error:', error);
      throw error;
    }
  }

  private scheduleBatchExecution(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.executeBatch().catch(console.error);
    }, this.BATCH_DELAY) as unknown as number;
  }

  // Force immediate execution of pending operations
  async flush(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    await this.executeBatch();
  }
}

// Singleton instance for global use
export const asyncStorageBatch = new AsyncStorageBatch();

// Utility functions for common patterns
export const AsyncStorageUtils = {
  // Get with default value and type safety
  async getWithDefault<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return defaultValue;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`AsyncStorage getWithDefault error for key ${key}:`, error);
      return defaultValue;
    }
  },

  // Set with automatic JSON serialization
  async setJSON(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`AsyncStorage setJSON error for key ${key}:`, error);
      throw error;
    }
  },

  // Batch operations for user-specific data
  async getUserData(userId: string, keys: string[]): Promise<{ [key: string]: any }> {
    const userKeys = keys.map(key => `${key}_${userId}`);
    return asyncStorageBatch.multiGet(userKeys);
  },

  async setUserData(userId: string, data: { [key: string]: any }): Promise<void> {
    const promises = Object.entries(data).map(([key, value]) => 
      asyncStorageBatch.set(`${key}_${userId}`, value)
    );
    await Promise.all(promises);
  },

  // Clear all user-specific data
  async clearUserData(userId: string, keys: string[]): Promise<void> {
    const userKeys = keys.map(key => `${key}_${userId}`);
    await AsyncStorage.multiRemove(userKeys);
  },

  // Get storage size and cleanup utilities
  async getStorageInfo(): Promise<{ keys: string[], totalSize: number }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const keys = allKeys.slice();
      const values = await AsyncStorage.multiGet(keys);
      const totalSize = values.reduce((size, [, value]) => {
        return size + (value ? value.length : 0);
      }, 0);
      
      return { keys, totalSize };
    } catch (error) {
      console.error('AsyncStorage getStorageInfo error:', error);
      return { keys: [], totalSize: 0 };
    }
  },

  // Clean up old data based on timestamp
  async cleanupOldData(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const timestampKeys = keys.filter(key => key.endsWith('_timestamp'));
      
      if (timestampKeys.length === 0) return;

      const timestamps = await AsyncStorage.multiGet(timestampKeys);
      const now = Date.now();
      const keysToRemove: string[] = [];

      timestamps.forEach(([timestampKey, value]) => {
        if (value) {
          const timestamp = parseInt(value, 10);
          if (now - timestamp > maxAge) {
            const dataKey = timestampKey.replace('_timestamp', '');
            keysToRemove.push(dataKey, timestampKey);
          }
        }
      });

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`Cleaned up ${keysToRemove.length} old AsyncStorage entries`);
      }
    } catch (error) {
      console.error('AsyncStorage cleanup error:', error);
    }
  }
};

// Hook for React components to use batched AsyncStorage

export const useAsyncStorageBatch = () => {
  return useMemo(() => ({
    set: asyncStorageBatch.set.bind(asyncStorageBatch),
    remove: asyncStorageBatch.remove.bind(asyncStorageBatch),
    multiGet: asyncStorageBatch.multiGet.bind(asyncStorageBatch),
    flush: asyncStorageBatch.flush.bind(asyncStorageBatch),
    getWithDefault: AsyncStorageUtils.getWithDefault,
    setJSON: AsyncStorageUtils.setJSON,
    getUserData: AsyncStorageUtils.getUserData,
    setUserData: AsyncStorageUtils.setUserData,
    clearUserData: AsyncStorageUtils.clearUserData,
    getStorageInfo: AsyncStorageUtils.getStorageInfo,
    cleanupOldData: AsyncStorageUtils.cleanupOldData,
  }), []);
};