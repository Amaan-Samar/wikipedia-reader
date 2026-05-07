// services/wikipedia.ts
import { WikipediaArticle } from '@/types';
import { logger } from '@/utils/logger';

export class WikipediaService {
  private static readonly API_BASE = '/api/wikipedia';

  static async getRandomArticle(): Promise<WikipediaArticle | null> {
    try {
      logger.info('Fetching random article via API');
      
      const response = await fetch(`${this.API_BASE}?action=random`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`API returned ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch article');
      }
      
      logger.info(`Successfully fetched article: ${data.title}`, {
        contentLength: data.extract?.length
      });
      
      return {
        title: data.title,
        extract: data.extract,
        url: data.url,
        pageId: data.pageId,
        thumbnail: data.thumbnail
      };
      
    } catch (error) {
      logger.error('Failed to fetch random article', error);
      // Return a fallback article instead of null
      return this.getFallbackArticle();
    }
  }

  static async getArticlesByCategory(category: string, limit: number = 10): Promise<WikipediaArticle[]> {
    try {
      logger.info(`Fetching articles for category: ${category}`);
      
      const response = await fetch(`${this.API_BASE}?action=category&category=${encodeURIComponent(category)}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      const articles = data.articles || [];
      logger.info(`Fetched ${articles.length} articles for category ${category}`);
      
      return articles.filter((a: any) => a !== null);
      
    } catch (error) {
      logger.error(`Failed to fetch articles for category ${category}`, error);
      // Return a single random article as fallback
      const random = await this.getRandomArticle();
      return random ? [random] : [];
    }
  }

  // Fallback method with hardcoded interesting articles
  private static async getFallbackArticle(): Promise<WikipediaArticle> {
    const fallbackArticles = [
      {
        title: "Computer",
        extract: "A computer is a machine that can be programmed to carry out sequences of arithmetic or logical operations automatically. Modern computers can perform generic sets of operations known as programs. These programs enable computers to perform a wide range of tasks.",
        url: "https://en.wikipedia.org/wiki/Computer",
        pageId: 12345,
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Computer-aj_aj_ashton_01.svg/200px-Computer-aj_aj_ashton_01.svg.png"
      },
      {
        title: "Internet",
        extract: "The Internet is the global system of interconnected computer networks that uses the Internet protocol suite to communicate between networks and devices. It is a network of networks that consists of private, public, academic, business, and government networks.",
        url: "https://en.wikipedia.org/wiki/Internet",
        pageId: 12346,
        thumbnail: undefined
      },
      {
        title: "Artificial Intelligence",
        extract: "Artificial intelligence is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. Leading AI textbooks define the field as the study of 'intelligent agents'.",
        url: "https://en.wikipedia.org/wiki/Artificial_intelligence",
        pageId: 12347,
        thumbnail: undefined
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * fallbackArticles.length);
    return fallbackArticles[randomIndex];
  }
}