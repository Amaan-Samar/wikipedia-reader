// services/BackgroundPrefetcher.ts
class BackgroundPrefetcher {
  private prefetchQueue: string[] = [];
  private isProcessing = false;
  
  async startBackgroundPrefetch() {
    // Use requestIdleCallback for non-critical prefetching
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.processPrefetchQueue(), { timeout: 2000 });
    }
    
    // Also prefetch when network is idle
    this.setupNetworkIdleDetection();
  }
  
  private setupNetworkIdleDetection() {
    let networkTimer: NodeJS.Timeout;
    
    window.addEventListener('load', () => {
      // After page load, wait 5 seconds then prefetch
      setTimeout(() => this.prefetchPopularContent(), 5000);
    });
    
    // Prefetch when user stops scrolling
    let scrollTimer: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (document.hidden === false) {
          this.prefetchNextArticles();
        }
      }, 3000);
    });
  }
  
  private async prefetchNextArticles() {
    const connection = (navigator as any).connection;
    if (connection && connection.saveData) {
      return; // Don't prefetch on slow connections
    }
    
    // Prefetch 3 articles
    const articles = await Promise.all(
      Array(3).fill(null).map(() => WikipediaService.getRandomArticle())
    );
    
    articles.forEach(article => {
      cacheManager.set(`prefetch_${article.title}`, article, 'ARTICLE_CONTENT');
    });
  }
}