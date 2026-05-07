// app/feed/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import ArticleCard from '@/components/ArticleCard';
import CategoryChips from '@/components/CategoryChips';
import { ArticleRotator } from '@/services/ArticleRotator';
import { SmartFeedService } from '@/services/SmartFeedService';
import { WikipediaArticle } from '@/types';
import { logger } from '@/utils/logger';

export default function FeedPage() {
  const [articles, setArticles] = useState<WikipediaArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const rotatorRef = useRef<ArticleRotator>(new ArticleRotator());
  const feedServiceRef = useRef<SmartFeedService>(new SmartFeedService());
  const isLoadingRef = useRef(false);

  const loadMoreArticles = useCallback(async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    
    try {
      const category = activeCategory === 'all' ? undefined : activeCategory;
      const article = await rotatorRef.current.getNextArticle(category);
      
      if (article) {
        setArticles(prev => [...prev, article]);
        
        // Fetch categories in background
        if (!article.categories) {
          // Categories will be fetched and tracked when viewed
        }
      }
    } catch (error) {
      logger.error('Failed to load article', error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [activeCategory]);

  const handleArticleView = useCallback((article: WikipediaArticle, index: number) => {
    // Track engagement when article is viewed
    if (article.categories) {
      feedServiceRef.current.trackEngagement(article, article.categories);
    }
    
    // Preload when approaching end
    if (index === articles.length - 3) {
      loadMoreArticles();
    }
  }, [articles.length, loadMoreArticles]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    rotatorRef.current.updatePreferredCategory(category);
    
    // Clear and reload feed
    setArticles([]);
    setTimeout(() => loadMoreArticles(), 100);
  }, [loadMoreArticles]);

  useEffect(() => {
    loadMoreArticles();
    loadMoreArticles(); // Load 2 initially
    loadMoreArticles();
    
    // Log stats periodically
    const interval = setInterval(() => {
      const stats = rotatorRef.current.getStats();
      logger.info('Feed stats', stats);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <CategoryChips 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      <Virtuoso
        style={{ height: 'calc(100% - 60px)' }}
        data={articles}
        endReached={loadMoreArticles}
        itemContent={(index, article) => (
          <div 
            className="feed-item"
            onMouseEnter={() => handleArticleView(article, index)}
          >
            <ArticleCard article={article} />
          </div>
        )}
        components={{
          Footer: () => (
            <div className="text-center py-8">
              {isLoadingRef.current && (
                <div className="animate-pulse text-gray-500 dark:text-gray-400">
                  Loading more articles...
                </div>
              )}
            </div>
          )
        }}
      />
    </div>
  );
}