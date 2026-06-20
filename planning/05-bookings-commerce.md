# Phase 5: Bookings & Commerce
**Priority:** 🟡 Medium  
**Duration:** Week 7-8  
**Status:** ⬜ Not Started

---

## 5.1 Booking System

### Backend APIs
- [ ] `POST /api/bookings` - Create booking
  - Select service
  - Select date
  - Select time slot
  - Confirm
- [ ] `GET /api/bookings` - My bookings (user view)
- [ ] `GET /api/businesses/:id/bookings` - Business bookings (owner view)
- [ ] `GET /api/bookings/:id` - Booking details
- [ ] `PUT /api/bookings/:id/cancel` - Cancel booking
- [ ] `PUT /api/bookings/:id/accept` - Accept booking (owner)
- [ ] `PUT /api/bookings/:id/reject` - Reject booking (owner)
- [ ] `PUT /api/bookings/:id/reschedule` - Reschedule

### Frontend Screens
- [ ] Create Booking screen
  - Service selector
  - Calendar date picker
  - Time slot picker
  - Confirmation
- [ ] My Bookings screen
  - Tabs: Upcoming / Past / Cancelled
- [ ] Booking Details screen
  - Business info, time, location, status
  - Cancel/Reschedule buttons

---

## 5.2 Payment Integration

### Backend APIs
- [ ] `POST /api/payments/initiate` - Start payment
- [ ] `POST /api/payments/verify` - Verify payment
- [ ] `POST /api/payments/refund` - Process refund
- [ ] Webhook handlers for payment gateways

### Payment Gateways
- [ ] Stripe integration
- [ ] PayPal integration
- [ ] Local payment methods (if needed)

### Policies
- [ ] Refund policy implementation
- [ ] Commission calculation on each transaction
- [ ] Payout system for business owners

---

## Acceptance Criteria
- [ ] User can book a service with date/time
- [ ] Business owner sees booking request
- [ ] Owner can accept/reject/reschedule
- [ ] User receives notification on status change
- [ ] Payment processes successfully
- [ ] Refund works according to policy
- [ ] Commission is calculated and recorded
