# End-to-End Notification Testing Plan

**Purpose:** Verify the complete notification system from CMS → Backend → Expo → Mobile Device

**Status:** Phase 4 Complete - Ready for E2E Testing

---

## 🎯 Test Objectives

1. Verify notifications can be sent from CMS
2. Confirm backend processes notifications correctly
3. Ensure Expo Push service delivers to devices
4. Validate mobile app receives and displays notifications
5. Test notification history and read tracking
6. Verify badge counts update correctly
7. Test deep linking navigation

---

## 📋 Pre-Test Setup

### CMS (Backend):
- [x] Dev server running on http://localhost:3000
- [x] Mock auth enabled (MOCK_AUTH=true)
- [x] Database contains sample notifications
- [x] Admin portal accessible at http://localhost:3000/en/admin

### Mobile App:
- [ ] Expo app running (`npx expo start`)
- [ ] Physical device connected OR simulator running
- [ ] Device token registered in database
- [ ] User authenticated (or using mock profile)
- [ ] Network connection to CMS (localhost/tunnel)

### Verification:
```bash
# Check dev server
curl -I http://localhost:3000

# Check mobile app can reach CMS
# (May need ngrok/expo tunnel for physical device)
curl http://localhost:3000/api/notifications/user
```

---

## 🧪 Test Cases

### Test 1: Send Notification from CMS ⭐ CRITICAL

**Objective:** Verify admin can compose and send notifications

**Steps:**
1. Navigate to http://localhost:3000/en/admin/notifications
2. Click "Create Notification" (or select existing)
3. Fill in:
   - Title: "Test Notification"
   - Body: "This is a test from the CMS"
   - Data (optional): `{"screen": "/(tabs)/places"}`
4. Click "Send now"

**Expected Results:**
- ✅ Loading state shows "Sending…"
- ✅ Success message appears: "✅ Sent to X devices"
- ✅ Notification status changes to "Sent"
- ✅ sentAt timestamp populated
- ✅ deliveryCount matches number of active tokens
- ✅ No errors in console

**Verification Queries:**
```sql
-- Check notification was created
SELECT id, title, status, sentAt, deliveryCount
FROM Notification
WHERE title = 'Test Notification';

-- Check deliveries were created
SELECT * FROM NotificationDelivery
WHERE notificationId = 'xxx';

-- Verify token was used
SELECT * FROM DeviceToken
WHERE active = true;
```

**Pass Criteria:** Notification sent successfully with deliveries tracked

---

### Test 2: Receive Notification on Mobile ⭐ CRITICAL

**Objective:** Verify mobile device receives push notification

**Steps:**
1. Ensure mobile app is in background or closed
2. Send notification from CMS (Test 1)
3. Wait up to 30 seconds

**Expected Results:**
- ✅ Push notification appears in system tray
- ✅ Notification displays correct title
- ✅ Notification displays correct body
- ✅ Notification sound plays (if enabled)
- ✅ Badge appears on app icon (iOS)

**Pass Criteria:** Notification received and displayed on device

---

### Test 3: Foreground Notification Handling

**Objective:** Verify notifications appear when app is open

**Steps:**
1. Open mobile app
2. Keep app in foreground
3. Send notification from CMS

**Expected Results:**
- ✅ Notification banner appears in-app
- ✅ Console logs: "📬 Notification received (foreground)"
- ✅ Notification added to history immediately (or after 30s refetch)
- ✅ Badge count updates

**Pass Criteria:** Foreground notifications displayed correctly

---

### Test 4: Notification History Display ⭐ CRITICAL

**Objective:** Verify user can see notification history

**Steps:**
1. Open mobile app
2. Navigate to Notifications tab (🔔)
3. Wait for data to load

**Expected Results:**
- ✅ Loading state shows briefly
- ✅ Notifications list appears
- ✅ Most recent notifications first
- ✅ Each notification shows:
  - Title
  - Body
  - Time ("X minutes ago")
  - Business name (if applicable)
- ✅ Unread notifications have blue badge dot
- ✅ Read notifications have 60% opacity
- ✅ Pull-to-refresh works (if implemented)

**Pass Criteria:** Notification history displays correctly

---

### Test 5: Mark Notification as Read

**Objective:** Verify tapping notification marks it as read

**Steps:**
1. Go to Notifications tab
2. Find an unread notification (has blue dot)
3. Tap the notification

**Expected Results:**
- ✅ Notification loses blue dot
- ✅ Opacity changes to 60%
- ✅ API request to `/api/notifications/[id]/read` succeeds
- ✅ Database updated (clickedAt populated)
- ✅ Badge count decreases by 1

**Verification:**
```sql
-- Check notification was marked as clicked
SELECT clickedAt FROM NotificationDelivery
WHERE notificationId = 'xxx' AND userId = 'yyy';
```

**Pass Criteria:** Notification marked as read correctly

---

### Test 6: Badge Count Accuracy ⭐ CRITICAL

**Objective:** Verify badge shows correct unread count

**Steps:**
1. Note current badge count
2. Send new notification from CMS
3. Wait up to 30 seconds (refetch interval)
4. Check badge count
5. Tap notification to mark as read
6. Check badge count again

**Expected Results:**
- ✅ Badge count increases when new notification received
- ✅ Badge count decreases when notification marked as read
- ✅ Badge count = 0 when all notifications read
- ✅ Badge disappears when count is 0
- ✅ Badge updates within 30 seconds of changes

**Pass Criteria:** Badge count always reflects actual unread count

---

### Test 7: Deep Link Navigation

**Objective:** Verify tapping notification navigates to correct screen

**Test 7a: Navigate to Specific Screen**
1. Send notification with data: `{"screen": "/(tabs)/places"}`
2. Tap notification
3. **Expected:** App opens to Places tab

**Test 7b: Navigate to Place Details**
1. Send notification with data: `{"placeId": "clxxxxx"}`
2. Tap notification
3. **Expected:** App opens to place detail screen

**Test 7c: Navigate to Event Details**
1. Send notification with data: `{"eventId": "clxxxxx"}`
2. Tap notification
3. **Expected:** App opens to event detail screen

**Test 7d: Default Navigation (No Data)**
1. Send notification with no data field
2. Tap notification
3. **Expected:** App opens to Notifications tab

**Pass Criteria:** All deep links navigate correctly

---

### Test 8: Empty State

**Objective:** Verify empty state when no notifications exist

**Steps:**
1. Clear all notifications from database (optional)
2. Open Notifications tab

**Expected Results:**
- ✅ Shows message: "No notifications yet"
- ✅ Shows subtext: "You'll see notifications from your town here"
- ✅ No loading spinner indefinitely
- ✅ No error messages

**Pass Criteria:** Empty state displays correctly

---

### Test 9: Error Handling

**Objective:** Verify graceful error handling

**Test 9a: Network Error**
1. Disable network on mobile device
2. Open Notifications tab
3. **Expected:** Error message: "Error loading notifications"

**Test 9b: Unauthorized**
1. Remove auth token (if applicable)
2. Try to fetch notifications
3. **Expected:** 401 error handled gracefully

**Pass Criteria:** Errors handled without crashes

---

### Test 10: Performance & Polish

**Objective:** Verify smooth user experience

**Checklist:**
- [ ] Notifications load in < 2 seconds
- [ ] No console errors or warnings
- [ ] Smooth scrolling in notification list
- [ ] No UI jank or flicker
- [ ] Badge updates don't cause re-renders
- [ ] Images load properly (if business logos)
- [ ] Time formatting is readable
- [ ] Touch targets are large enough (min 44px)

**Pass Criteria:** App feels polished and responsive

---

## 🔧 Testing Tools

### Manual Testing:
- CMS Admin Portal: http://localhost:3000/en/admin
- Mobile App: Expo Go or development build

### API Testing:
```bash
# Test get user notifications (requires auth)
curl -X GET http://localhost:3000/api/notifications/user \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test mark as read (requires auth)
curl -X POST http://localhost:3000/api/notifications/NOTIF_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID"}'
```

### Database Queries:
```sql
-- View all notifications
SELECT * FROM Notification ORDER BY createdAt DESC LIMIT 10;

-- View deliveries for a user
SELECT nd.*, n.title, n.body
FROM NotificationDelivery nd
JOIN Notification n ON n.id = nd.notificationId
WHERE nd.userId = 'USER_ID'
ORDER BY nd.sentAt DESC;

-- Check active device tokens
SELECT * FROM DeviceToken WHERE active = true;

-- Count unread notifications for user
SELECT COUNT(*) FROM NotificationDelivery
WHERE userId = 'USER_ID' AND clickedAt IS NULL;
```

---

## 📊 Success Criteria

### Must Pass (Blockers):
- ✅ Test 1: Send notification from CMS
- ✅ Test 2: Receive notification on mobile
- ✅ Test 4: Notification history displays
- ✅ Test 5: Mark as read works
- ✅ Test 6: Badge count accurate
- ✅ Test 7: Deep links work

### Should Pass (Important):
- ✅ Test 3: Foreground notifications
- ✅ Test 8: Empty state
- ✅ Test 9: Error handling

### Nice to Have:
- ✅ Test 10: Performance & polish

---

## 🚨 Known Limitations

1. **Sandbox Environment:**
   - npm registry unreachable (packages pre-installed)
   - May need ngrok/tunnel for physical device testing

2. **Mock Authentication:**
   - Using MOCK_AUTH=true for CMS
   - May affect mobile auth flow

3. **Database:**
   - PgBouncer enabled
   - May have connection limits

4. **Expo Push Service:**
   - Requires valid Expo push tokens
   - Development builds may have limitations
   - Production notifications require standalone builds

---

## 📝 Test Execution Checklist

### Pre-Test:
- [ ] CMS dev server running
- [ ] Mobile app running (Expo)
- [ ] Device token registered
- [ ] At least one device token in database
- [ ] Sample notification created in CMS

### During Test:
- [ ] Run tests 1-10 in order
- [ ] Document any failures
- [ ] Take screenshots of issues
- [ ] Note console errors
- [ ] Verify database changes

### Post-Test:
- [ ] All critical tests pass
- [ ] Document any bugs found
- [ ] Create issues for failures
- [ ] Update SESSION_CHECKPOINT
- [ ] Report results to Architect

---

## 🎯 Next Steps After E2E Testing

### If All Tests Pass:
1. Update SESSION_CHECKPOINT.md (notification system 100% complete)
2. Move to P1 UX issue fixes (#20, #21)
3. Run final QA Agent audit
4. Prepare for launch

### If Tests Fail:
1. Document failures in ISSUE_TRACKER.md
2. Prioritize fixes (P0 = blocking)
3. Engineer fixes issues
4. Re-test until all pass
5. Then proceed to P1 fixes

---

**Created:** 2025-11-20
**Status:** Ready for Execution
**Owner:** Architect + QA Team
**Priority:** P0 (Blocking Launch)
