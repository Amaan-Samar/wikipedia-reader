// app/optimized-feed/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { SmartFeedService } from '@/services/SmartFeedService';
import { CacheManager } from '@/utils/cacheManager';
import { ArticleRotator } from '@/services/ArticleRotator';
import ArticleCard from '@/components/ArticleCard';
import CategoryChips from '@/app/components/CategoryChips';
import { WikipediaArticle } from '../services/wikipedia';

export default function OptimizedFeed() {
  const [articles, setArticles] = useState<WikipediaArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  const feedService = new SmartFeedService();
  const cacheManager = CacheManager.getInstance();
  const articleRotator = new ArticleRotator();
  
  // Load initial batch with caching
  useEffect(() => {
    loadInitialFeed();
    
    // Prefetch popular categories in background
    cacheManager.prefetchPopularCategories();
    
    // Track user engagement
    const interval = setInterval(() => {
      const stats = feedService.getEngagementStats();
      console.log('User engagement:', stats);
    }, 60000); // Log every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const loadInitialFeed = async () => {
    setIsLoading(true);
    
    // Try cache first
    const cached = cacheManager.get('initial_feed');
    if (cached) {
      setArticles(cached);
      setIsLoading(false);
      return;
    }
    
    // Load 5 articles based on user interests or default
    const initialArticles = await Promise.all(
      Array(5).fill(null).map(() => articleRotator.getNextArticle(activeCategory))
    );
    
    setArticles(initialArticles);
    cacheManager.set('initial_feed', initialArticles, 'ARTICLE_CONTENT');
    setIsLoading(false);
  };
  
  const loadMoreArticles = useCallback(async () => {
    // Get next article using the smart rotator
    const nextArticle = await articleRotator.getNextArticle(activeCategory);
    
    setArticles(prev => [...prev, nextArticle]);
    
    // Track engagement for this article
    const categories = await WikipediaService.getArticleCategories(nextArticle.title);
    categories.forEach(cat => feedService.trackEngagement(nextArticle, cat));
    
    // Preload next article in background
    setTimeout(() => {
      articleRotator.getNextArticle(activeCategory).then(preloaded => {
        cacheManager.set('preloaded_next', preloaded, 'ARTICLE_CONTENT');
      });
    }, 1000);
  }, [activeCategory]);
  
  const handleCategoryChange = async (category: string) => {
    setActiveCategory(category);
    
    // Clear current feed and load new category-specific articles
    setIsLoading(true);
    const categoryArticles = await feedService.getArticlesByCategory(category, 10);
    setArticles(categoryArticles);
    setIsLoading(false);
    
    // Update rotator pool to prefer this category
    articleRotator.updatePreferredCategory(category);
  };
  
  const handleArticleView = (article: WikipediaArticle, index: number) => {
    // Track scroll depth and reading time
    feedService.trackReadingTime(article.title, Date.now());
    
    // If user reaches 70% of article, consider it "engaged"
    if (index === articles.length - 3) {
      // Prefetch next batch
      loadMoreArticles();
    }
  };
  
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      {/* Category selector - floating chips */}
      <CategoryChips 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      {/* Infinite scroll feed */}
      <Virtuoso
        style={{ height: '100%' }}
        data={articles}
        endReached={loadMoreArticles}
        itemContent={(index, article) => (
          <div 
            className="feed-item"
            onIntersection={() => handleArticleView(article, index)}
          >
            <ArticleCard 
              article={article}
              prefetchRelated={index === articles.length - 2}
            />
          </div>
        )}
        components={{
          Footer: () => (
            <div className="text-center py-8">
              {isLoading ? (
                <div className="animate-pulse">Loading more articles...</div>
              ) : (
                <div className="text-gray-500">Swipe for more →</div>
              )}
            </div>
          )
        }}
      />
    </div>
  );
}