# Phase 10: Maps & SEO
**Priority:** 🟢 Low  
**Duration:** Week 11  
**Status:** 🟡 In Progress

---

## 10.1 Google Maps Integration

### Features
- [x] Display business locations on map
- [x] "Near me" search
- [x] Distance calculation
- [x] Directions to business

### Backend APIs
- [x] `GET /api/businesses/nearby?lat=&lng=&radius=` - Nearby search
- [x] Store lat/lng coordinates for businesses
- [x] Geocoding service (address → coordinates) (via Places Autocomplete in forms)

### Frontend
- [x] Map component (Google Maps or Mapbox)
- [x] Map view in directory
- [x] Business location on profile
- [x] "Get Directions" button

---

## 10.2 SEO Optimization

### Features
- [ ] Dynamic meta tags for each page
- [ ] Open Graph tags for social sharing
- [x] Sitemap.xml generation
- [x] Robots.txt
- [x] Structured data (JSON-LD)
- [ ] Canonical URLs
- [x] Clean URLs (slug-based)

### Business Pages
- [x] Each business gets a unique shareable link
- [ ] Custom domain support (future)
- [ ] Meta description from business info
- [ ] Preview image from cover photo

### APIs
- [x] `GET /sitemap.xml` - Dynamic sitemap
- [x] `GET /robots.txt` - Robots file

---

## Acceptance Criteria
- [x] Map displays business pins correctly
- [x] "Near me" finds businesses within radius
- [ ] Business pages have proper meta tags
- [ ] Social sharing shows preview card
- [x] Sitemap includes all public pages
- [x] Pages are indexable by search engines
