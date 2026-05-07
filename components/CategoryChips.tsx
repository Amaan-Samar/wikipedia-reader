// components/CategoryChips.tsx
'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types';

const CATEGORIES: Category[] = [
  { id: 'all', name: 'all', displayName: 'For You', icon: '🔥', wikipediaCategory: '' },
  { id: 'history', name: 'history', displayName: 'History', icon: '📚', wikipediaCategory: 'History' },
  { id: 'science', name: 'science', displayName: 'Science', icon: '🔬', wikipediaCategory: 'Science' },
  { id: 'technology', name: 'technology', displayName: 'Tech', icon: '💻', wikipediaCategory: 'Technology' },
  { id: 'arts', name: 'arts', displayName: 'Arts', icon: '🎨', wikipediaCategory: 'Art' },
  { id: 'sports', name: 'sports', displayName: 'Sports', icon: '⚽', wikipediaCategory: 'Sports' },
  { id: 'nature', name: 'nature', displayName: 'Nature', icon: '🌿', wikipediaCategory: 'Nature' },
  { id: 'space', name: 'space', displayName: 'Space', icon: '🚀', wikipediaCategory: 'Space' },
];

interface CategoryChipsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryChips({ activeCategory, onCategoryChange }: CategoryChipsProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg transition-shadow ${
      isScrolled ? 'shadow-md' : ''
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="font-medium">{category.displayName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}