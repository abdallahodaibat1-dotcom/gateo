# Phase 1: Foundation
**Priority:** 🔴 High  
**Duration:** Week 1-2  
**Status:** ⬜ Not Started

---

## 1.1 Database Schema Design

### Tables to Create

- [ ] `users` - Basic user info, account type (regular/business/admin)
- [ ] `profiles` - Profile photo, bio, interests, city
- [ ] `businesses` - Business info, documents, verification status
- [ ] `services` - Business services, prices, duration
- [ ] `categories` - Main platform categories
- [ ] `subcategories` - Sub-categories
- [ ] `posts` - Text, images, video, location, hashtags
- [ ] `comments` - Comments on posts
- [ ] `likes` - Post/comment likes
- [ ] `follows` - Follow system
- [ ] `bookings` - Service bookings
- [ ] `reviews` - Business ratings and reviews
- [ ] `conversations` - Chat rooms
- [ ] `messages` - Text/image/video messages
- [ ] `groups` - Public/private groups
- [ ] `group_members` - Group membership
- [ ] `notifications` - User notifications
- [ ] `stories` - 24h stories
- [ ] `reports` - Content/user reports
- [ ] `subscription_plans` - Business subscription tiers
- [ ] `business_subscriptions` - Active subscriptions

### Tasks
- [ ] Draw ERD diagram
- [ ] Define all table relationships
- [ ] Define indexes for performance
- [ ] Create Prisma schema file
- [ ] Run initial migration
- [ ] Seed sample data for testing

---

## 1.2 Project Infrastructure Setup

### Tasks
- [ ] Configure Next.js App Router structure
- [ ] Set up TypeScript strict mode
- [ ] Set up Tailwind CSS + color system
- [ ] Set up Prisma ORM with MariaDB
- [ ] Set up NextAuth.js or custom auth
- [ ] Set up file upload (Local for dev, S3 for prod)
- [ ] Create auth middleware
- [ ] Create role-based access control (RBAC)
- [ ] Set up Zod validators
- [ ] Set up unified error handling
- [ ] Set up API response standardization
- [ ] Set up environment variables (.env.local)
- [ ] Create folder structure:
  ```
  src/
    app/
      api/          # API routes
      (auth)/       # Auth pages
      (main)/       # Main app pages
      admin/        # Admin panel
    components/     # React components
    lib/            # Utilities, DB connection
    hooks/          # Custom hooks
    types/          # TypeScript types
    validations/    # Zod schemas
  prisma/
    schema.prisma
  public/
    uploads/
  ```

---

## Acceptance Criteria
- [ ] Database is fully modeled in Prisma
- [ ] All migrations run successfully
- [ ] Project builds without errors
- [ ] Auth middleware protects routes
- [ ] File upload works for images
