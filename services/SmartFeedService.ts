// services/SmartFeedService.ts
import { WikipediaArticle, UserPreferences } from '@/types';
import { WikipediaService } from './wikipedia';
import { CacheManager } from './CacheManager';
import { logger } from '@/utils/logger';

export class SmartFeedService {
  private userInterests: Map<string, number> = new Map();
  private viewedArticles: Set<string> = new Set();
  private readingTimes: Map<string, number> = new Map();
  private cacheManager: CacheManager;

  constructor() {
    this.cacheManager = CacheManager.getInstance();
    this.loadUserPreferences();
  }

  private async loadUserPreferences() {
    const prefs = await this.cacheManager.getFromIndexedDB('user_preferences');
    if (prefs) {
      this.userInterests = new Map(prefs.preferredCategories);
      this.viewedArticles = new Set(prefs.readingHistory);
      logger.info('Loaded user preferences', { 
        interestsCount: this.userInterests.size,
        historyCount: this.viewedArticles.size
      });
    }
  }

  async getArticlesByCategory(category: string, limit: number = 10): Promise<WikipediaArticle[]> {
    const cacheKey = `category_${category}_${limit}`;
    const cached = this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const articles = await WikipediaService.getArticlesByCategory(category, limit);
    this.cacheManager.set(cacheKey, articles, 'CATEGORY_LIST');
    return articles;
  }

  trackEngagement(article: WikipediaArticle, categories: string[]) {
    // Update interests
    categories.forEach(cat => {
      const count = this.userInterests.get(cat) || 0;
      this.userInterests.set(cat, count + 1);
    });
    
    // Track viewed
    this.viewedArticles.add(article.title);
    
    // Save preferences
    this.saveUserPreferences();
    
    logger.info('Tracked engagement', { 
      article: article.title,
      categories: categories.join(', ')
    });
  }

  trackReadingTime(articleTitle: string, timeSpent: number) {
    this.readingTimes.set(articleTitle, timeSpent);
  }

  getTopInterests(limit: number = 3): string[] {
    return Array.from(this.userInterests.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([category]) => category);
  }

  private async saveUserPreferences() {
    const preferences: UserPreferences = {
      preferredCategories: Array.from(this.userInterests.entries()),
      readingHistory: Array.from(this.viewedArticles),
      bookmarkedArticles: [],
      lastActive: Date.now()
    };
    
    this.cacheManager.set('user_preferences', preferences, 'USER_PREFS');
  }

  getEngagementStats() {
    return {
      totalInterests: this.userInterests.size,
      totalArticlesViewed: this.viewedArticles.size,
      topInterests: this.getTopInterests(),
      avgReadingTime: Array.from(this.readingTimes.values()).reduce((a, b) => a + b, 0) / this.readingTimes.size || 0
    };
  }
}