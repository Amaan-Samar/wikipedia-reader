# Wikipedia Reader - Smart Feed

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8)](https://web.dev/progressive-web-apps/)

A modern, performant Wikipedia reader with an infinite scroll feed, smart article rotation, offline caching, and personalized content discovery. Built with Next.js 15 and optimized for mobile-first reading experiences.

## 🎯 Purpose

Wikipedia Reader transforms the traditional Wikipedia browsing experience into a TikTok-style infinite feed of random articles. The application intelligently rotates content, caches articles for offline reading, and learns user preferences to deliver engaging, educational content in a seamless interface.

## ✨ Features

### Core Features
- **Infinite Scroll Feed** - Endless stream of Wikipedia articles
- **Smart Article Rotation** - Intelligent content delivery with 15-article rotation buffer
- **Category Filtering** - Browse by topics: History, Science, Technology, Arts, Sports, Nature, Space
- **Dark/Light Mode** - System-aware theme with manual toggle
- **PWA Ready** - Installable as native app with offline fallback

### Intelligent Features
- **User Engagement Tracking** - Learns reading habits and topic preferences
- **Smart Prefetching** - Background article loading using requestIdleCallback
- **Bandwidth-Aware Caching** - Respects user's `Save-Data` preferences
- **Reading Time Estimates** - Dynamic calculation based on content length
- **Scroll-Aware Preloading** - Prefetches when user nears bottom of feed

### Performance Optimizations
- **Multi-Layer Caching** - Memory + IndexedDB with configurable TTLs
- **Virtual Scrolling** - Using `react-virtuoso` for memory-efficient rendering
- **Resource Hints** - Preconnect to Wikipedia API domains
- **Optimized Images** - Next.js Image component with lazy loading
- **Background Prefetching** - Network idle detection for non-critical assets

## 📊 Progress

### ✅ Implemented
- [x] Article rotator with 15-article rotation buffer
- [x] Category-based filtering system
- [x] IndexedDB caching (1hr for categories, 24hr for articles)
- [x] Dark mode with persistence
- [x] PWA manifest and service worker
- [x] Smart feed service with engagement tracking
- [x] Background prefetching infrastructure
- [x] Responsive design (mobile-first)
- [x] Share functionality (Web Share API)
- [x] Bookmarking (local persistence)

### 🚧 In Progress
- [ ] Full-text search with debouncing
- [ ] Reading history timeline
- [ ] Social sharing images (OG tags)
- [ ] Push notifications for new articles

### 📋 Planned
- [ ] User accounts and cloud sync
- [ ] AI-powered content recommendations
- [ ] Audio reading mode (TTS)
- [ ] Offline article queue management
- [ ] Reading streaks and gamification
- [ ] Multi-language support
- [ ] Custom feed algorithms

## 🚧 Limitations

### Current Constraints
1. **Wikipedia API Rate Limits** - 10 requests/second limit may cause throttling
2. **No Authentication** - User preferences stored locally only
3. **Limited Category Depth** - Only top-level Wikipedia categories supported
4. **Image CORS Issues** - Some Wikipedia images may fail to load due to CORS policies
5. **Mobile Performance** - Very long sessions may cause memory pressure
6. **No Sync Across Devices** - Bookmarks and history tied to single browser

### Browser Support
- **Fully Supported**: Chrome, Edge, Firefox, Safari (latest 2 versions)
- **Partial Support**: Opera, Samsung Internet
- **Not Supported**: IE11 and older browsers (no IndexedDB/Service Workers)

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| TypeScript | Type safety and better DX |
| Tailwind CSS | Utility-first styling |
| IndexedDB | Offline caching |
| React Virtuoso | Virtual scrolling |
| Heroicons | Icon system |
| Wikipedia API | Content source (via custom API route) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm / yarn / pnpm / bun
- Modern web browser with IndexedDB support

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Amaan-Samar/wikipedia-reader.git
cd wikipedia-reader
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory to add the vars

```

4. **Run the development server**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Production Build

```bash
npm run build
npm run start
```

### PWA Installation

1. Visit your deployed site in Chrome/Edge/Safari
2. Look for the install icon in address bar
3. Click "Install" to add to home screen
4. App will work offline after first load

## 📁 Project Structure

```
wikipedia-reader/
├── app/                    # Next.js 16 App Router
│   ├── feed/              # Optimized feed page
│   ├── layout.tsx         # Root layout with PWA meta
│   └── page.tsx           # Splash screen / redirect
├── components/            # React components
│   ├── ArticleCard.tsx    # Article display with actions
│   ├── CategoryChips.tsx  # Category selector
│   └── ThemeToggle.tsx    # Dark mode toggle
├── services/              # Core business logic
│   ├── ArticleRotator.ts  # Smart content rotation
│   ├── CacheManager.ts    # Multi-layer caching
│   ├── SmartFeedService.ts # Personalization engine
│   ├── BackgroundPrefetcher.ts # Intelligent preloading
│   └── wikipedia.ts       # Wikipedia API client
├── types/                 # TypeScript definitions
├── utils/                 # Helpers (logger, etc.)
├── public/                # Static assets & PWA icons
└── next.config.ts         # Next.js config (PWA enabled)
```

## 🔧 Configuration

### Cache TTLs (Configurable in `CacheManager.ts`)

| Type | Duration | Use Case |
|------|----------|----------|
| Category List | 1 hour | Category-based article lists |
| Article Content | 24 hours | Full article text and metadata |
| Search Results | 30 minutes | Search query responses |
| User Preferences | 7 days | Reading history and interests |

### Rotation Settings (`ArticleRotator.ts`)

- **Pool Size**: 15 articles
- **Refresh Threshold**: <3 articles or 12 repeats
- **Similarity Filter**: Prevents showing same article twice

## PWA Features

- **Offline Fallback**: Shows cached articles when offline
- **Installable**: Add to home screen on mobile
- **Background Sync**: (Planned) Sync bookmarks when back online
- **Splash Screen**: Custom splash for iOS devices


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use `logger` utility instead of `console.log`
- Add proper error boundaries for API calls
- Test offline functionality before PR
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page) for providing free content
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Amaan-Samar/wikipedia-reader/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Amaan-Samar/wikipedia-reader/discussions)

## 📝 Changelog

### v1.0.0 (Current)
- Initial release with infinite scroll feed
- Smart article rotation system
- Offline caching support
- Category filtering and PWA features

---

**Made with ❤️ for knowledge seekers everywhere**
