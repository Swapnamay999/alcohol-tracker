import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

/**
 * environment-resilient storage initializer.
 * If MMKV fails to initialize (e.g., in Expo Go or if native modules are missing),
 * it falls back to a safe in-memory mock to prevent the app from crashing.
 * 
 * Note: v4.x uses createMMKV() factory and .remove() instead of .delete().
 */
const createSafeStorage = () => {
  try {
    return createMMKV();
  } catch (error) {
    console.error('Failed to initialize MMKV storage:', error);
    console.warn('MMKV failed to initialize. Falling back to in-memory storage. (This is expected in Expo Go)');
    
    // In-memory mock for environments without native MMKV support
    const mockMap = new Map<string, string>();
    return {
      set: (key: string, value: string | number | boolean) => mockMap.set(key, String(value)),
      getString: (key: string) => mockMap.get(key),
      remove: (key: string) => mockMap.delete(key), // v4 naming
      clearAll: () => mockMap.clear(),
      getAllKeys: () => Array.from(mockMap.keys()),
    } as any;
  }
};

export const storage = createSafeStorage();

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    // Attempt v4 .remove() but fallback to .delete() if types or older version mismatch
    if (typeof storage.remove === 'function') {
      storage.remove(name);
    } else if (typeof (storage as any).delete === 'function') {
      (storage as any).delete(name);
    }
  },
};