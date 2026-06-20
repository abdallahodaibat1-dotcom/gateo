# Phase 2: Authentication & User Profiles
**Priority:** 🔴 High  
**Duration:** Week 1-2 (parallel with Phase 1)  
**Status:** ⬜ Not Started

---

## 2.1 Registration & Login APIs

### Backend Tasks
- [ ] `POST /api/auth/register` - Register with email/phone
- [ ] `POST /api/auth/login` - Login with credentials
- [ ] `POST /api/auth/otp/send` - Send OTP
- [ ] `POST /api/auth/otp/verify` - Verify OTP
- [ ] `POST /api/auth/forgot-password` - Request password reset
- [ ] `POST /api/auth/reset-password` - Reset password
- [ ] `POST /api/auth/google` - Google OAuth login
- [ ] `POST /api/auth/apple` - Apple OAuth login
- [ ] `POST /api/auth/logout` - Logout

### Frontend Screens
- [ ] Splash Screen
- [ ] Welcome / Onboarding screen
- [ ] Language selector (Arabic / English)
- [ ] Login screen (email/phone + password)
- [ ] Register screen (name, phone, email, password, confirm)
- [ ] OTP verification screen
- [ ] Account type selector (Regular / Business)
- [ ] Complete profile screen (photo, city, interests, bio)

---

## 2.2 User Profiles

### Backend Tasks
- [ ] `GET /api/profile` - Get current user profile
- [ ] `PUT /api/profile` - Update profile
- [ ] `POST /api/profile/avatar` - Upload profile photo
- [ ] `GET /api/profile/:userId` - Get public profile

### Frontend Screens
- [ ] Profile page (similar to Instagram)
  - Profile photo, bio, posts, followers, following
- [ ] Edit profile page
  - Edit name, bio, city, interests, photo
- [ ] Settings page
  - Language, notifications, privacy, block list
  - Change password
  - Logout

---

## Acceptance Criteria
- [ ] New user can register with email/phone
- [ ] OTP is sent and verified
- [ ] User can login with credentials
- [ ] User can login with Google/Apple
- [ ] Password reset flow works end-to-end
- [ ] Profile can be viewed and edited
- [ ] Profile photo can be uploaded
- [ ] Settings can be changed and saved
