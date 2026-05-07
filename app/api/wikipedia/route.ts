// app/api/wikipedia/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  console.log(`API Route called: action=${action}`);
  
  try {
    switch (action) {
      case 'random':
        return await getRandomArticle();
      case 'category':
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '10');
        if (!category) {
          return NextResponse.json({ error: 'Category is required' }, { status: 400 });
        }
        return await getArticlesByCategory(category, limit);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

async function getRandomArticle() {
  try {
    console.log('Fetching random article from Wikipedia...');
    
    // First, get a random page title
    const randomUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*';
    const randomResponse = await fetch(randomUrl, {
      headers: {
        'User-Agent': 'WikipediaFeed/1.0 (https://your-app.com; your@email.com)'
      }
    });
    
    if (!randomResponse.ok) {
      throw new Error(`Wikipedia API returned ${randomResponse.status}`);
    }
    
    const randomData = await randomResponse.json();
    const randomTitle = randomData.query?.random?.[0]?.title;
    
    if (!randomTitle) {
      throw new Error('Could not fetch random article title');
    }
    
    console.log(`Random article selected: ${randomTitle}`);
    
    // Now fetch the full article content
    return await getFullArticle(randomTitle);
    
  } catch (error: any) {
    console.error('Error in getRandomArticle:', error);
    throw error;
  }
}

async function getArticlesByCategory(category: string, limit: number) {
  try {
    console.log(`Fetching articles for category: ${category}, limit: ${limit}`);
    
    // Search for articles in the category
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=incategory:"${encodeURIComponent(category)}"&format=json&origin=*&srlimit=${limit}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'WikipediaFeed/1.0 (https://your-app.com; your@email.com)'
      }
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Search API returned ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    const searchResults = searchData.query?.search || [];
    
    if (searchResults.length === 0) {
      // Fallback to random if no category results
      console.log(`No results for category ${category}, falling back to random`);
      const randomArticle = await getRandomArticle();
      return NextResponse.json({ success: true, articles: [randomArticle] });
    }
    
    // Fetch full content for each result
    const articles = [];
    for (const result of searchResults.slice(0, limit)) {
      try {
        const article = await getFullArticle(result.title);
        if (article) {
          articles.push(article);
        }
      } catch (err) {
        console.error(`Failed to fetch article ${result.title}:`, err);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return NextResponse.json({ success: true, articles });
    
  } catch (error: any) {
    console.error('Error in getArticlesByCategory:', error);
    throw error;
  }
}

async function getFullArticle(title: string) {
  try {
    console.log(`Fetching full article: ${title}`);
    
    // Get article summary (for metadata)
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const summaryResponse = await fetch(summaryUrl, {
      headers: {
        'User-Agent': 'WikipediaFeed/1.0 (https://your-app.com; your@email.com)'
      }
    });
    
    if (!summaryResponse.ok) {
      throw new Error(`Summary API returned ${summaryResponse.status}`);
    }
    
    const summaryData = await summaryResponse.json();
    
    // Get full content using the action API (more reliable than REST)
    const contentUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&prop=text&origin=*`;
    const contentResponse = await fetch(contentUrl, {
      headers: {
        'User-Agent': 'WikipediaFeed/1.0 (https://your-app.com; your@email.com)'
      }
    });
    
    if (!contentResponse.ok) {
      throw new Error(`Content API returned ${contentResponse.status}`);
    }
    
    const contentData = await contentResponse.json();
    const htmlContent = contentData.parse?.text?.['*'] || '';
    
    // Convert HTML to plain text
    const plainText = convertHtmlToText(htmlContent);
    
    // Limit content length for performance
    const truncatedText = plainText.length > 10000 ? plainText.substring(0, 10000) + '...' : plainText;
    
    return {
      title: summaryData.title,
      extract: truncatedText || summaryData.extract || 'No content available',
      url: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      pageId: summaryData.pageid,
      thumbnail: summaryData.thumbnail?.source,
      success: true
    };
    
  } catch (error: any) {
    console.error(`Error fetching full article for ${title}:`, error);
    throw error;
  }
}

function convertHtmlToText(html: string): string {
  // Remove scripts and styles
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Replace block elements with newlines
  text = text.replace(/<h[1-6][^>]*>/gi, '\n\n');
  text = text.replace(/<p[^>]*>/gi, '\n\n');
  text = text.replace(/<br[^>]*>/gi, '\n');
  text = text.replace(/<div[^>]*>/gi, '\n');
  
  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n\n');
  
  return text.trim();
}