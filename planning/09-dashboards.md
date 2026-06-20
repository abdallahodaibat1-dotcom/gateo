# Phase 9: Dashboards (Business + Admin)
**Priority:** 🟡 Medium  
**Duration:** Week 9-10  
**Status:** ⬜ Not Started

---

## 9.1 Business Owner Dashboard

### Analytics APIs
- [ ] `GET /api/dashboard/business/stats` - Key metrics
  - Profile views
  - Post engagement
  - Booking count
  - Revenue
- [ ] `GET /api/dashboard/business/visits` - Visit analytics
- [ ] `GET /api/dashboard/business/bookings` - Booking analytics
- [ ] `GET /api/dashboard/business/revenue` - Revenue reports

### Management APIs
- [ ] `GET /api/dashboard/business/services` - Manage services
- [ ] `POST /api/dashboard/business/services` - Add service
- [ ] `PUT /api/dashboard/business/services/:id` - Edit service
- [ ] `DELETE /api/dashboard/business/services/:id` - Delete service
- [ ] `GET /api/dashboard/business/bookings` - Manage bookings
- [ ] `PUT /api/dashboard/business/bookings/:id` - Accept/reject/reschedule
- [ ] `GET /api/dashboard/business/posts` - Manage posts
- [ ] `POST /api/dashboard/business/posts` - Create post
- [ ] `PUT /api/dashboard/business/posts/:id` - Edit post
- [ ] `DELETE /api/dashboard/business/posts/:id` - Delete post

### Frontend Screens
- [ ] Dashboard Home
  - Stats cards (views, bookings, revenue)
  - Charts/graphs
- [ ] Services Management
  - CRUD services
- [ ] Bookings Management
  - Calendar view
  - Accept/reject/reschedule
- [ ] Posts Management
  - CRUD posts
- [ ] Profile Settings
  - Business info, hours, photos

---

## 9.2 Admin Panel

### Auth
- [ ] `POST /api/admin/login` - Admin login
- [ ] Admin middleware (role-based access)

### Dashboard APIs
- [ ] `GET /api/admin/stats` - Platform overview
  - Total users
  - Total businesses
  - Total bookings
  - Revenue
- [ ] `GET /api/admin/users` - User management
- [ ] `PUT /api/admin/users/:id/ban` - Ban/unban user
- [ ] `GET /api/admin/businesses/pending` - Pending verifications
- [ ] `PUT /api/admin/businesses/:id/verify` - Verify business
- [ ] `PUT /api/admin/businesses/:id/reject` - Reject business
- [ ] `GET /api/admin/reports` - Content reports
- [ ] `PUT /api/admin/reports/:id/resolve` - Resolve report
- [ ] `GET /api/admin/categories` - Manage categories
- [ ] `POST /api/admin/categories` - Add category
- [ ] `PUT /api/admin/categories/:id` - Edit category
- [ ] `DELETE /api/admin/categories/:id` - Delete category

### Frontend Screens
- [ ] Admin Login
- [ ] Dashboard Home
  - KPI cards
  - Charts
- [ ] Business Verification Queue
  - Review applications
  - Approve/reject with notes
- [ ] Reports Management
  - Review reported content
  - Ban users
- [ ] Categories Management
  - CRUD categories
- [ ] Users Management
  - Search, filter, ban

---

## Acceptance Criteria
- [ ] Business owner sees accurate analytics
- [ ] Services can be managed from dashboard
- [ ] Bookings appear in calendar view
- [ ] Admin can review and verify businesses
- [ ] Reports can be reviewed and resolved
- [ ] Categories can be managed
- [ ] All admin actions are logged
