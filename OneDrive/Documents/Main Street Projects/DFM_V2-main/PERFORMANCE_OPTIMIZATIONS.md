# Map Performance Optimizations

## Overview
This document outlines the performance optimizations implemented for the Dubuque Farmers Market map, specifically targeting mobile users (70%+ of traffic via QR codes).

## Architecture Decision
**Hybrid Architecture Maintained**: Wix Studio UI elements + HTML iframe map
- Smaller initial payload (~773 lines vs ~1262 lines standalone)
- Progressive rendering capabilities
- Wix CDN optimization benefits
- Better mobile performance

## Implemented Optimizations

### 1. iframe Payload Optimizations (`public/map-widget.html`)

#### Resource Loading
- ✅ Added `preconnect` hints for external resources (fonts, CDNs, map tiles)
- ✅ Added `dns-prefetch` for map tile domain
- ✅ Font loading with `display=swap` for faster text rendering

#### CSS Optimizations
- ✅ Added CSS `contain` property for layout/style/paint containment
- ✅ Mobile-optimized touch targets (already present)
- ✅ Removed unnecessary inline styles

#### JavaScript Optimizations
- ✅ Removed console.log statements (production performance)
- ✅ Throttled localStorage writes (500ms) to reduce I/O overhead
- ✅ Deferred geolocation setup using `requestIdleCallback` (non-blocking)
- ✅ Optimized Leaflet map initialization with mobile-specific settings

#### postMessage Batching
- ✅ Implemented message batching for style updates (16ms window)
- ✅ Critical updates (data loads) process immediately
- ✅ Deduplication of rapid filter/search updates
- ✅ Reduces render cycles and improves frame rate

### 2. Velo Code Optimizations (`pages/map-page.js`)

#### Progressive Loading
- ✅ Static data (stalls, POIs) fetched immediately on iframe ready
- ✅ Map renders while data loads (non-blocking)
- ✅ Cache-first strategy for static data

#### Query Optimizations
- ✅ Reduced date search from 12 weeks to 8 weeks (performance)
- ✅ Optimized Saturday finding logic (check current week first)
- ✅ Efficient date calculations

#### User Interaction
- ✅ Reduced search debounce from 400ms to 300ms (better responsiveness)
- ✅ Removed unnecessary console.log statements
- ✅ Streamlined error handling

### 3. Mobile-Specific Optimizations

#### Leaflet Configuration
- ✅ `preferCanvas: true` (already present) - Better mobile rendering
- ✅ Mobile-optimized touch settings
- ✅ Zoom-based marker visibility (already present)
- ✅ Efficient marker rendering at low zoom levels

#### CSS Containment
- ✅ Added `contain: layout style paint` to body and map container
- ✅ Isolates rendering work, improves performance

### 4. Caching Strategy

#### Browser Cache
- ✅ Leverages browser cache for iframe HTML
- ✅ External resources (Leaflet, FontAwesome) cached by CDN

#### Application Cache
- ✅ Static data cache (`staticDataCache`) for stalls and POIs
- ✅ Cache persists across date changes
- ✅ Reduces database queries

## Performance Metrics to Monitor

### Mobile Performance Targets
- **First Contentful Paint (FCP)**: < 1.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1

### Recommended Monitoring
1. Use browser DevTools Performance tab on mobile devices
2. Test on actual 3G/4G connections (not just WiFi)
3. Monitor Lighthouse scores for mobile
4. Track real-world usage via analytics

## Testing Checklist

- [ ] Test on iOS Safari (iPhone)
- [ ] Test on Android Chrome
- [ ] Test on slow 3G connection (Chrome DevTools throttling)
- [ ] Verify map loads before filters are interactive
- [ ] Verify filter changes are responsive (< 100ms)
- [ ] Verify search debouncing works correctly
- [ ] Verify geolocation doesn't block initial render
- [ ] Verify localStorage throttling doesn't cause issues

## Future Optimization Opportunities

1. **Service Worker**: Cache map tiles and static assets
2. **Code Splitting**: Split vendor icon config if it grows
3. **Image Optimization**: Optimize any custom marker images
4. **Lazy Loading**: Load POI details on-demand
5. **Web Workers**: Move heavy GeoJSON processing to worker thread

## Notes

- Console.log statements removed for production performance
- Error handling is silent to avoid performance overhead
- Batching window (16ms) aligns with 60fps rendering
- localStorage throttling prevents I/O blocking on mobile devices
