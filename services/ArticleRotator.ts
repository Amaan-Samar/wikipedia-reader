// services/ArticleRotator.ts
import { WikipediaArticle } from '@/types';
import { WikipediaService } from './wikipedia';
import { logger } from '@/utils/logger';

export class ArticleRotator {
  private recentArticles: string[] = [];
  private articlePool: WikipediaArticle[] = [];
  private repeatCounter = 0;
  private currentCategory: string | null = null;
  private readonly ROTATION_SIZE = 15;

  async getNextArticle(category?: string): Promise<WikipediaArticle> {
    try {
      // Update category preference
      if (category && category !== this.currentCategory && category !== 'all') {
        this.currentCategory = category;
        await this.refreshArticlePool(category);
        this.repeatCounter = 0;
      }
      
      // Refresh pool if needed
      if (this.articlePool.length < 3 || this.repeatCounter >= 12) {
        await this.refreshArticlePool(this.currentCategory || undefined);
        this.repeatCounter = 0;
      }
      
      // If pool is still empty, create a basic fallback
      if (this.articlePool.length === 0) {
        logger.warn('Article pool is empty, fetching single article');
        const article = await WikipediaService.getRandomArticle();
        if (article) {
          return article;
        }
        throw new Error('No articles available');
      }
      
      // Get unseen article
      const availableArticles = this.articlePool.filter(
        a => !this.recentArticles.includes(a.title)
      );
      
      let nextArticle: WikipediaArticle;
      if (availableArticles.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableArticles.length);
        nextArticle = availableArticles[randomIndex];
      } else {
        // If all seen, take first from pool
        nextArticle = this.articlePool[0];
      }
      
      // Update tracking
      this.recentArticles.unshift(nextArticle.title);
      if (this.recentArticles.length > this.ROTATION_SIZE) {
        this.recentArticles.pop();
      }
      
      this.repeatCounter++;
      
      logger.info(`Rotator: Serving article ${nextArticle.title}`, {
        poolSize: this.articlePool.length,
        repeatCounter: this.repeatCounter
      });
      
      return nextArticle;
      
    } catch (error) {
      logger.error('Failed to get next article', error);
      // Ultimate fallback
      return {
        title: "Wikipedia",
        extract: "Wikipedia is a free online encyclopedia, created and edited by volunteers around the world. Please check your internet connection and try again.",
        url: "https://en.wikipedia.org",
        pageId: 0,
        thumbnail: undefined
      };
    }
  }

  private async refreshArticlePool(category?: string) {
    try {
      let articles: WikipediaArticle[] = [];
      
      if (category && category !== 'all') {
        logger.info(`Refreshing pool for category: ${category}`);
        articles = await WikipediaService.getArticlesByCategory(category, 15);
      }
      
      // If no category results or category is 'all', get random articles
      if (articles.length === 0) {
        logger.info('Refreshing pool with random articles');
        const randomPromises = Array(8).fill(null).map(() => WikipediaService.getRandomArticle());
        const randomResults = await Promise.all(randomPromises);
        articles = randomResults.filter((a): a is WikipediaArticle => a !== null);
      }
      
      if (articles.length > 0) {
        this.articlePool = this.shuffleArray(articles);
        logger.info(`Pool refreshed with ${this.articlePool.length} articles`);
      } else {
        logger.warn('No articles available, keeping existing pool');
      }
      
    } catch (error) {
      logger.error('Failed to refresh article pool', error);
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  updatePreferredCategory(category: string) {
    if (category !== 'all') {
      this.currentCategory = category;
      this.refreshArticlePool(category);
    }
  }

  getStats() {
    return {
      poolSize: this.articlePool.length,
      recentCount: this.recentArticles.length,
      repeatCounter: this.repeatCounter,
      currentCategory: this.currentCategory
    };
  }
}