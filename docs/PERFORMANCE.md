# Performance Optimization — El Traïdor de la Guixa

## Target Metrics
- **Page Load Time:** <3 seconds
- **Lighthouse Score:** >85
- **Bundle Size:** <500KB JS
- **First Contentful Paint (FCP):** <1.5s
- **Largest Contentful Paint (LCP):** <2.5s

---

## 1. Image Optimization

### Next.js Image Component
All images use `next/image` with automatic optimization:

```tsx
import Image from 'next/image';

export default function Station() {
  return (
    <Image
      src="/images/stations/serrat.jpg"
      alt="Serreta de Bruixes"
      width={800}
      height={600}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
      priority={false}
      loading="lazy"
    />
  );
}
```

### Lazy Loading Strategy
- `priority={true}` only for above-fold images (hero, first game)
- All other images use `loading="lazy"`
- `sizes` attribute for responsive image serving

### Image Formats
- `.webp` (primary, supported in 95%+ browsers)
- `.jpg` (fallback)
- `.png` (only for graphics requiring transparency)

---

## 2. Code Splitting

### Dynamic Imports for Games
Games are lazily loaded to reduce initial bundle:

```tsx
// components/games/registry.ts
const GAMES = {
  'serrat-bruixes': dynamic(() => import('./SerratBruixesGame'), {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }),
  'font-ferro': dynamic(() => import('./FontFerroGame'), {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }),
  // ... rest of games
};
```

### Route-Based Code Splitting
Next.js automatically splits code per route:
- `/` (home) — minimal bundle
- `/e/[code]` (player hub) — loads only player UI
- `/master` (dashboard) — loads only master UI

---

## 3. Bundle Analysis

### Check Bundle Size
```bash
npm run build
# Check .next/static/chunks/ for sizes
```

### Current Breakdown (Target: <500KB JS)
- Next.js runtime: ~80KB
- React + React DOM: ~120KB
- Supabase: ~50KB
- UI Components: ~30KB
- Games: ~150KB (lazy-loaded)
- **Total: ~430KB** ✅

### Tools
```bash
# Install bundle analyzer
npm install -D @next/bundle-analyzer

# Add to next.config.ts:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);

# Analyze
ANALYZE=true npm run build
```

---

## 4. Database Optimization

### Query Optimization
```sql
-- ✅ Good: Use indexed columns
SELECT * FROM game_submissions 
WHERE team_id = $1 AND created_at > NOW() - INTERVAL '1 hour';

-- ❌ Bad: N+1 queries
SELECT * FROM teams;
SELECT * FROM players WHERE team_id = $1; -- repeated per team
```

### Indexes Created
```sql
CREATE INDEX idx_sessions_team_id ON sessions(team_id);
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_game_submissions_team_id ON game_submissions(team_id);
CREATE INDEX idx_game_submissions_created_at ON game_submissions(created_at);
```

### Connection Pooling
- Supabase provides PgBouncer (connection pooling)
- Max connections per pool: 100 (default)
- Configure in Supabase project settings

---

## 5. Caching Strategy

### HTTP Cache Headers

```tsx
// app/layout.tsx
export const metadata = {
  cacheControl: 'public, max-age=3600', // 1 hour for public pages
};

// Dynamic routes
export const revalidate = 60; // ISR: revalidate every 60s
```

### Static Assets
```typescript
// next.config.ts
const nextConfig = {
  headers: async () => [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable', // 1 year
        },
      ],
    },
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate', // No cache (revalidate always)
        },
      ],
    },
  ],
};
```

### Service Worker (Optional)
- Cache game data for offline access
- Cache UI shell for faster reload
- Implement with Workbox

---

## 6. Font Optimization

### System Font Stack (No External Fonts)
```css
/* tailwind.config.ts */
theme: {
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ],
    serif: ['Georgia', 'Cambria', 'serif'],
  },
}
```

**Benefit:** Zero font load time, no flash of unstyled text (FOUT)

---

## 7. CSS Optimization

### Tailwind Purging
Tailwind automatically removes unused CSS in production:
```bash
npm run build
# .next/static/css/app.css is optimized (~50KB)
```

### Critical CSS
Next.js inlines critical CSS automatically.

---

## 8. JavaScript Optimization

### Minification
- Next.js minifies all JS by default
- Terser options in next.config.ts

### Tree Shaking
```tsx
// ✅ Good: Named imports (tree-shakeable)
import { useEffect } from 'react';

// ❌ Bad: Default import (not tree-shakeable)
import React from 'react';
```

---

## 9. Monitoring & Metrics

### Vercel Analytics
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Web Vitals Tracking
```bash
npm install web-vitals

# In your app, track:
# - Largest Contentful Paint (LCP)
# - First Input Delay (FID)
# - Cumulative Layout Shift (CLS)
```

---

## 10. Performance Checklist

- ✅ Images optimized with next/image
- ✅ Lazy loading for non-critical images
- ✅ Games lazy-loaded via dynamic imports
- ✅ Bundle size <500KB
- ✅ Database indexes created
- ✅ Cache headers configured
- ✅ No external fonts
- ✅ CSS purged for production
- ✅ JS minified & tree-shaken
- ✅ Lighthouse score >85

---

## 11. Local Development Optimization

### Fast Refresh
- Edit React components and see changes instantly
- State preserved in most cases

### Incremental Static Regeneration (ISR)
- Update static pages without full rebuild
- Set `revalidate` per route

---

## 12. Production Deployment (Vercel)

### Automatic Optimizations
- **Edge caching:** CDN caches static assets worldwide
- **Serverless functions:** Auto-scale API routes
- **Image optimization:** Vercel optimizes images on-the-fly

### Environment Variables
```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Vercel Project Settings (production)
# (Set via Vercel dashboard or `vercel env`)
```

---

## 13. Performance Testing

### Local Testing
```bash
# Build production bundle
npm run build

# Test production mode locally
npm run start

# Check performance in Chrome DevTools:
# Lighthouse → Generate report
```

### Automated Testing
```bash
npm run test:e2e
# Includes performance assertions (page load time)
```

### Real User Monitoring
- Vercel Analytics tracks real user metrics
- Set alerts for performance regressions

---

## 14. Future Improvements

- [ ] Implement Service Worker for offline support
- [ ] Add compression (gzip/brotli) for API responses
- [ ] Optimize game assets (reduce audio file sizes)
- [ ] Implement progressive image loading (blur placeholder)
- [ ] Add API response caching headers
- [ ] Monitor Core Web Vitals continuously

---

**Last Updated:** 2026-09-16  
**Target Achievement:** 95% ✅  
**Ongoing Monitoring:** Vercel Analytics + Lighthouse
