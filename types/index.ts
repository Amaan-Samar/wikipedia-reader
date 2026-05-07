// types/index.ts
export interface WikipediaArticle {
  title: string;
  extract: string;
  url: string;
  pageId: number;
  thumbnail?: string;
  categories?: string[];
  wordCount?: number;
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  wikipediaCategory: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface UserPreferences {
  preferredCategories: Map<string, number>;
  readingHistory: string[];
  bookmarkedArticles: string[];
  lastActive: number;
}