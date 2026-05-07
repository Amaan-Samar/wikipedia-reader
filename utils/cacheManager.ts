// utils/cacheManager.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  
  // Different TTLs for different data types
  private readonly TTL = {
    CATEGORY_LIST: 3600000,    // 1 hour - categories don't change often
    ARTICLE_CONTENT: 86400000,  // 24 hours - articles are stable
    SEARCH_RESULTS: 1800000,    // 30 minutes - fresh enough
    USER_HISTORY: 604800000     // 7 days - user preferences
  };
  
  set(key: string, data: any, type: keyof typeof this.TTL) {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.TTL[type]
    });
    
    // Also persist to IndexedDB for offline access
    this.persistToIndexedDB(key, data, this.TTL[type]);
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
  
  // Prefetch popular categories in background
  async prefetchPopularCategories() {
    const popularCategories = ['History', 'Science', 'Technology'];
    for (const category of popularCategories) {
      if (!this.categoryCache.has(category)) {
        const articles = await WikipediaService.getArticlesByCategory(category, 20);
        this.categoryCache.set(category, articles);
      }
    }
  }
}