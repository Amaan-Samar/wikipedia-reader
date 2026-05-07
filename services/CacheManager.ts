// services/CacheManager.ts
import { CacheEntry, WikipediaArticle } from '@/types';
import { logger } from '@/utils/logger';

export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private db: IDBDatabase | null = null;
  
  private readonly TTL = {
    CATEGORY_LIST: 3600000,    // 1 hour
    ARTICLE_CONTENT: 86400000,  // 24 hours
    SEARCH_RESULTS: 1800000,    // 30 minutes
    USER_PREFS: 604800000       // 7 days
  };

  private constructor() {
    this.initIndexedDB();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private async initIndexedDB() {
    const request = indexedDB.open('WikipediaReader', 1);
    
    request.onerror = () => {
      logger.error('Failed to open IndexedDB');
    };
    
    request.onsuccess = () => {
      this.db = request.result;
      logger.info('IndexedDB initialized');
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'id' });
      }
    };
  }

  set(key: string, data: any, type: keyof typeof this.TTL): void {
    const entry: CacheEntry<any> = {
      data,
      timestamp: Date.now(),
      ttl: this.TTL[type]
    };
    
    this.memoryCache.set(key, entry);
    this.persistToIndexedDB(key, entry);
    
    logger.debug(`Cached: ${key}`, { type, size: JSON.stringify(data).length });
  }

  get(key: string): any | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private async persistToIndexedDB(key: string, entry: CacheEntry<any>) {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    store.put({ key, ...entry });
  }

  async getFromIndexedDB(key: string): Promise<any | null> {
    if (!this.db) return null;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < result.ttl) {
          this.memoryCache.set(key, result);
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(null);
    });
  }

  clearExpired(): void {
    for (const [key, entry] of this.memoryCache.entries()) {
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
      }
    }
  }
}