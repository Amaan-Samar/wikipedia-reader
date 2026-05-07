declare module 'wikipedia' {
  export interface WikipediaOptions {
    lang?: string;
    userAgent?: string;
  }
  
  export interface SearchResult {
    results: Array<{
      title: string;
      pageid: number;
      size?: number;
      wordcount?: number;
      snippet?: string;
      timestamp?: string;
    }>;
    suggestion?: string;
  }
  
  export interface PageSummary {
    title: string;
    pageid: number;
    extract: string;
    thumbnail?: {
      source: string;
      width: number;
      height: number;
    };
    content_urls?: {
      desktop: {
        page: string;
      };
    };
  }
  
  export interface Page {
    content(): Promise<string>;
    summary(): Promise<PageSummary>;
    title: string;
    pageid: number;
  }
  
  export function setLang(lang: string): void;
  export function setUserAgent(ua: string): void;
  export function search(query: string, options?: { limit: number }): Promise<SearchResult>;
  export function page(title: string): Promise<Page>;
  export function random(limit?: number): Promise<string[]>;
}