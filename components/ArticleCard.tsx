// components/ArticleCard.tsx
'use client';

import { WikipediaArticle } from '@/types';
import Image from 'next/image';
import { useState } from 'react';
import { BookmarkIcon, ShareIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ArticleCardProps {
  article: WikipediaArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullArticle, setShowFullArticle] = useState(false);

  const formatContent = (content: string) => {
    const paragraphs = content.split('\n').filter(p => p.trim().length > 20);
    const displayContent = showFullArticle ? paragraphs : paragraphs.slice(0, 3);
    
    return displayContent.map((paragraph, idx) => (
      <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {paragraph}
      </p>
    ));
  };

  const readingTime = Math.max(1, Math.ceil((article.extract?.split(/\s+/).length || 0) / 200));

  return (
    <article className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      {article.thumbnail && !imageError && (
        <div className="relative h-[40vh] md:h-[50vh] w-full">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover"
            priority
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
        </div>
      )}

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-10">
        {/* Title Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{readingTime} min read</span>
            <span>•</span>
            <span>Wikipedia</span>
          </div>
        </div>

        {/* Article Body */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {formatContent(article.extract || 'Loading content...')}
          </div>

          {/* Read More Toggle */}
          {(article.extract?.split('\n').filter(p => p.trim().length > 20).length || 0) > 3 && (
            <button
              onClick={() => setShowFullArticle(!showFullArticle)}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {showFullArticle ? 'Show less ↑' : 'Continue reading ↓'}
            </button>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <BookmarkIcon className={`w-5 h-5 ${isBookmarked ? 'fill-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`} />
              </button>
              
              <button
                onClick={() => {
                  navigator.share?.({
                    title: article.title,
                    text: `Check out this article: ${article.title}`,
                    url: article.url
                  });
                }}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Read on Wikipedia 
              <ArrowPathIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Spacing for next article */}
        <div className="h-8" />
      </div>
    </article>
  );
}