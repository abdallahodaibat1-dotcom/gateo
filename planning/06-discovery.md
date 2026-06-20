# Phase 6: Discovery (Search, Filter, Directory)
**Priority:** 🟡 Medium  
**Duration:** Week 9-10  
**Status:** ⬜ Not Started

---

## 6.1 Search

### Backend APIs
- [ ] `GET /api/search?query=&type=` - Global search
  - Type: users / businesses / interests / posts
- [ ] `GET /api/search/suggestions?query=` - Instant suggestions
- [ ] Full-text search on business names, services, posts

### Frontend Screens
- [ ] Search screen
  - Search bar with instant results
  - Tabs: People / Businesses / Posts
  - Recent searches

---

## 6.2 Filter & Directory

### Backend APIs
- [ ] `GET /api/directory?category=&location=&rating=&type=` - Filtered directory
- [ ] `GET /api/directory/nearby?lat=&lng=&radius=` - Nearby businesses
- [ ] `GET /api/directory/trending` - Trending today
- [ ] `GET /api/directory/featured` - Featured businesses

### Filter Options
- [ ] Category (Ladies Gate / Beauty / Fashion / etc.)
- [ ] Location (City / Area)
- [ ] Business type
- [ ] Rating (1-5 stars)
- [ ] Distance / "Nearest"
- [ ] Price range
- [ ] Availability

### Frontend Screens
- [ ] Directory screen
  - Grid/list view of businesses
  - Sort options
- [ ] Filter modal/screen
  - All filter options with clear UI
- [ ] Trending screen
  - "Trending Today"
  - "Most Popular This Week"

---

## 6.3 Explore Page (Guest View)

### Content for non-logged users
- [ ] "Most Discussed"
- [ ] "Live Now"
- [ ] "AI Suggested Products"
- [ ] "Products Near You"
- [ ] "Friends Bought This"
- [ ] "Trending Today"
- [ ] "Rising Businesses"

### Backend APIs
- [ ] `GET /api/explore` - Explore content
- [ ] `GET /api/explore/trending` - Trending items
- [ ] `GET /api/explore/nearby` - Nearby content

---

## Acceptance Criteria
- [ ] Search finds results in real-time
- [ ] Filter narrows results accurately
- [ ] Nearby search uses geolocation
- [ ] Trending shows actual popular content
- [ ] Guest users can browse limited content
- [ ] Results are paginated for performance
