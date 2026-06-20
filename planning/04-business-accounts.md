# Phase 4: Business Accounts
**Priority:** 🔴 High  
**Duration:** Week 5-6  
**Status:** ⬜ Not Started

---

## 4.1 Business Registration & Verification

### Backend APIs
- [ ] `POST /api/businesses/apply` - Submit business application
  - Business name, type, location, contact info
  - Document uploads (license, ID, etc.)
- [ ] `GET /api/businesses/my-application` - Check application status
- [ ] `PUT /api/businesses/:id/verify` - Admin approves (admin only)
- [ ] `PUT /api/businesses/:id/reject` - Admin rejects (admin only)

### Frontend Screens
- [ ] Business Application screen
  - Business name
  - Business type (salon, clinic, fashion, cosmetics)
  - Document upload
  - Location
  - Contact information
- [ ] Application Status screen
  - Pending / Approved / Rejected
  - Admin notes if rejected

---

## 4.2 Business Profile Page

### Backend APIs
- [ ] `GET /api/businesses/:id` - Get business public profile
- [ ] `PUT /api/businesses/:id` - Update business info (owner only)
- [ ] `POST /api/businesses/:id/cover` - Upload cover photo
- [ ] `POST /api/businesses/:id/logo` - Upload logo
- [ ] `GET /api/businesses/:id/gallery` - Get photo/video gallery
- [ ] `POST /api/businesses/:id/gallery` - Add to gallery

### Frontend Screens
- [ ] Business Profile page (mini website)
  - Cover photo, logo, rating
  - Business info, hours, location
  - Services list
  - Gallery
  - Posts
  - Book button, Chat button
- [ ] Edit Business Profile screen
- [ ] Gallery screen (view all photos/videos)

---

## 4.3 Services Management

### Backend APIs
- [ ] `POST /api/businesses/:id/services` - Add service
- [ ] `PUT /api/businesses/:id/services/:serviceId` - Edit service
- [ ] `DELETE /api/businesses/:id/services/:serviceId` - Delete service
- [ ] `GET /api/businesses/:id/services` - List services

### Data Model
- Service name
- Description
- Price
- Duration
- Category
- Is active

---

## 4.4 Reviews & Ratings

### Backend APIs
- [ ] `POST /api/businesses/:id/reviews` - Add review
- [ ] `GET /api/businesses/:id/reviews` - Get reviews
- [ ] `PUT /api/reviews/:id` - Edit own review
- [ ] `DELETE /api/reviews/:id` - Delete own review
- [ ] Calculate average rating

### Frontend Screens
- [ ] Reviews section on business profile
- [ ] Write review modal/screen
- [ ] Star rating display

---

## Acceptance Criteria
- [ ] Business owner can submit application with documents
- [ ] Admin can approve/reject with feedback
- [ ] Business profile is public and SEO-friendly
- [ ] Services can be CRUD by owner
- [ ] Users can rate and review
- [ ] Average rating displays correctly
- [ ] Gallery supports photos and videos
