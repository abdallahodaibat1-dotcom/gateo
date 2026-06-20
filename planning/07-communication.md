# Phase 7: Communication (Chat & Groups)
**Priority:** 🟡 Medium  
**Duration:** Week 9-10  
**Status:** ⬜ Not Started

---

## 7.1 Private Messaging

### Backend APIs
- [ ] `POST /api/conversations` - Start new conversation
- [ ] `GET /api/conversations` - List conversations
- [ ] `GET /api/conversations/:id` - Get conversation messages
- [ ] `POST /api/conversations/:id/messages` - Send message
  - Text, image, video, audio, location
- [ ] `PUT /api/messages/:id/read` - Mark as read
- [ ] `DELETE /api/messages/:id` - Delete message

### Real-time
- [ ] WebSocket or Server-Sent Events for live messages
- [ ] Typing indicators
- [ ] Online/offline status

### Frontend Screens
- [ ] Conversations list (WhatsApp-like)
  - Last message preview
  - Unread count
  - Online indicator
- [ ] Chat screen
  - Message bubbles
  - Media viewer
  - Voice messages
  - Location sharing
- [ ] New conversation screen
  - User search
  - Create group option

---

## 7.2 Groups

### Backend APIs
- [ ] `POST /api/groups` - Create group
  - Name, photo, description, privacy (public/private)
- [ ] `GET /api/groups` - List groups
  - Public groups
  - My groups
  - Suggestions
- [ ] `GET /api/groups/:id` - Group details
- [ ] `POST /api/groups/:id/join` - Join group
- [ ] `POST /api/groups/:id/leave` - Leave group
- [ ] `POST /api/groups/:id/posts` - Post in group
- [ ] `GET /api/groups/:id/members` - List members
- [ ] `POST /api/groups/:id/members/:userId/remove` - Remove member (admin)

### Frontend Screens
- [ ] Groups list screen
  - Public / Private / My Groups tabs
- [ ] Create Group screen
- [ ] Group Detail screen
  - Members list
  - Posts feed
  - Files/Media
  - Admin controls

---

## Acceptance Criteria
- [ ] Users can start private conversations
- [ ] Messages deliver in real-time
- [ ] Media files send and display correctly
- [ ] Groups can be created (public/private)
- [ ] Users can join/leave groups
- [ ] Group admins can moderate
- [ ] Unread counts update correctly
