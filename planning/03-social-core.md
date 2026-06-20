# Phase 3: Social Core Features
**Priority:** 🔴 High  
**Duration:** Week 3-4  
**Status:** ⬜ Not Started

---

## 3.1 Posts & Feed

### Backend APIs
- [ ] `POST /api/posts` - Create post (text/images/video/location/hashtags)
- [ ] `GET /api/posts` - Get home feed (posts from followed users + businesses)
- [ ] `GET /api/posts/:id` - Get single post with comments
- [ ] `PUT /api/posts/:id` - Edit post
- [ ] `DELETE /api/posts/:id` - Delete post
- [ ] `GET /api/posts/explore` - Explore page posts

### Frontend Screens
- [ ] Home Feed screen (Instagram-like)
  - Stories bar at top
  - Posts with like/comment/share
  - Create post button
- [ ] Create Post screen
  - Text input
  - Image/video upload (multiple)
  - Location tag
  - Hashtags
- [ ] Post Detail screen
  - Full post + all comments

---

## 3.2 Engagement (Likes, Comments, Shares)

### Backend APIs
- [ ] `POST /api/posts/:id/like` - Like/unlike post
- [ ] `POST /api/posts/:id/comments` - Add comment
- [ ] `GET /api/posts/:id/comments` - Get comments
- [ ] `POST /api/comments/:id/reply` - Reply to comment
- [ ] `POST /api/comments/:id/like` - Like comment
- [ ] `POST /api/posts/:id/save` - Save post
- [ ] `POST /api/posts/:id/share` - Share post

### Frontend Screens
- [ ] Comments screen
  - Add comment
  - Reply to comment
  - Like comments

---

## 3.3 Stories

### Backend APIs
- [ ] `POST /api/stories` - Create story (image/video)
- [ ] `GET /api/stories` - Get active stories (last 24h)
- [ ] `DELETE /api/stories/:id` - Delete story
- [ ] Cron job: Auto-delete expired stories

### Frontend Screens
- [ ] Stories viewer (Instagram-like full screen)
- [ ] Create story screen

---

## 3.4 Follow System

### Backend APIs
- [ ] `POST /api/users/:id/follow` - Follow/unfollow
- [ ] `GET /api/users/:id/followers` - List followers
- [ ] `GET /api/users/:id/following` - List following
- [ ] `GET /api/users/suggestions` - Suggested users to follow

---

## 3.5 Notifications

### Backend APIs
- [ ] `GET /api/notifications` - List notifications
- [ ] `PUT /api/notifications/:id/read` - Mark as read
- [ ] `PUT /api/notifications/read-all` - Mark all as read
- [ ] WebSocket or polling for real-time notifications

### Frontend Screens
- [ ] Notifications screen
  - Likes, comments, follows, messages, bookings
  - Unread count badge

---

## Acceptance Criteria
- [ ] User can create post with media
- [ ] Home feed shows posts chronologically
- [ ] Like/comment/share works on posts
- [ ] Stories display for 24h then disappear
- [ ] Follow/unfollow updates feed content
- [ ] Notifications appear for all interactions
- [ ] Unread count shows on notification icon
