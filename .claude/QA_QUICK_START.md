# QA Agent - Quick Start (Setup Today)

## 🚀 15-Minute Setup - Get QA Agent Running NOW

### Step 1: Install Claude Desktop (5 min)

1. Go to https://claude.ai/download
2. Download for macOS
3. Install and sign in
4. Keep it open

### Step 2: Install Browser MCP (3 min)

```bash
# One command - installs everything
npm install -g @modelcontextprotocol/server-puppeteer
```

### Step 3: Configure Claude Desktop (2 min)

```bash
# Open config file
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Paste this:
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {
        "PUPPETEER_HEADLESS": "false"
      }
    }
  }
}
```

Save and **restart Claude Desktop**.

### Step 4: Verify MCP Works (1 min)

In Claude Desktop, type:
```
Can you navigate to https://example.com using the browser?
```

If Claude says "I'll use Puppeteer to navigate..." - **SUCCESS!** ✅

If it says "I don't have browser access" - MCP not connected, check config.

### Step 5: Start QA Session (2 min)

Paste this into Claude Desktop:

```
You are now a QA Agent for TownHub.

Read these files:
- /Users/carlosmaia/townhub/.claude/QA_AGENT_PROMPT.md
- /Users/carlosmaia/townhub/.claude/ISSUE_TRACKER.md

Then test the CMS at http://localhost:3000 following the comprehensive checklist.

Start by navigating to the login page and systematically test each page.
Take screenshots of any issues and document them.

Begin testing now.
```

### Step 6: Watch It Work (2 min)

Claude will:
- ✅ Open browser (you'll see it!)
- ✅ Navigate to your CMS
- ✅ Test login, admin pages, forms
- ✅ Take screenshots
- ✅ Document bugs
- ✅ Generate report

---

## 💡 Pro Tips

### Tip 1: Keep Dev Server Running
```bash
cd /Users/carlosmaia/townhub
npm run dev  # Keep this running!
```

### Tip 2: Give Specific Instructions
Instead of "test everything", try:
```
Focus on the Notification Center at /en/admin/notifications.
Test the notification composer form in detail.
Check for validation errors, UX issues, and visual bugs.
```

### Tip 3: Request Screenshots
```
Take a screenshot of the current page and show me.
```

### Tip 4: Compare Designs
```
Here's the Figma design [paste image].
Compare it to the current implementation and note differences.
```

### Tip 5: Mobile Testing
```
Resize browser to iPhone 14 dimensions (390x844) and test mobile layout.
```

---

## 🎯 What to Test First

### Priority 1: Critical Paths
```
Test these flows:
1. Login → Admin Dashboard
2. Create Business → Save → Verify in list
3. Create Notification → Send → Check delivery
4. Upload Image → Verify display
```

### Priority 2: Form Validations
```
Test all forms:
- Business creation form
- Notification composer
- Event creation
- Place creation

Try:
- Empty submissions
- Invalid data
- Edge cases (very long text, special characters)
```

### Priority 3: UI/UX Polish
```
Check every page for:
- Visual alignment issues
- Spacing inconsistencies
- Missing labels
- Confusing flows
- Poor error messages
```

---

## 📝 Sample QA Session Script

Paste this into Claude Desktop for immediate results:

```
🔍 QA AGENT SESSION - TownHub CMS

Environment:
- CMS: http://localhost:3000
- Auth: Mock mode (any credentials work)
- Database: PostgreSQL with sample data

Mission: Comprehensive testing of admin portal

PHASE 1: Authentication
→ Navigate to /en/auth/login
→ Test login with mock credentials
→ Verify redirect to /en/admin
→ Screenshot: Login page
→ Document any issues

PHASE 2: Dashboard
→ Navigate to /en/admin
→ Verify all cards display data
→ Check for console errors
→ Test responsive layout (resize to 768px, 375px)
→ Screenshot: Dashboard at different sizes
→ Document any issues

PHASE 3: Business Management
→ Navigate to /en/admin/businesses
→ Verify business table loads
→ Click "Create Business" button
→ Fill out form with test data
→ Test form validation (leave fields empty)
→ Test subscription dropdown
→ Submit form
→ Verify new business appears in list
→ Screenshot: Business list and form
→ Document any issues

PHASE 4: Notification Center
→ Navigate to /en/admin/notifications
→ Verify composer displays
→ Test notification creation
→ Fill title: "Test Notification"
→ Fill body: "This is a test message"
→ Test audience selection
→ Test language toggle
→ Attempt to send
→ Verify notification history updates
→ Screenshot: Notification center
→ Document any issues

PHASE 5: UX Analysis
→ Review overall navigation flow
→ Check visual consistency
→ Identify confusing UI elements
→ Note accessibility issues
→ Suggest improvements

DELIVERABLE:
→ Comprehensive issue list with screenshots
→ Priority ratings (P0/P1/P2/P3)
→ UX recommendations
→ Summary of findings

Begin testing now. Show me screenshots as you go.
```

---

## 🎨 Example Issue Format

When Claude finds issues, it will document like this:

```markdown
### Issue #20: Business Form - Place Dropdown Cut Off

**Priority:** 🟡 P2 (Medium)
**Component:** CMS - Business Management
**Screenshot:** [Attached]

**Description:**
The "Linked Place" dropdown in the business creation form
is cut off at the bottom when there are more than 5 places.
The scrollbar is not visible.

**Steps to Reproduce:**
1. Go to /en/admin/businesses
2. Click "Create Business"
3. Click "Linked Place" dropdown
4. Observe: Only 5 items visible, no scroll indicator

**Expected:**
Dropdown should show scroll indicator or expand to show all items

**Impact:**
Users cannot select places beyond the first 5 in the list

**Suggested Fix:**
Add `max-height` and `overflow-y: auto` to dropdown menu
```

---

## ⚡ Advanced Usage

### Test Specific Feature
```
Focus exclusively on testing image uploads:
1. Test business logo upload
2. Test place image upload
3. Test event image upload
4. Check file size limits
5. Test invalid file types
6. Verify images display correctly
Document all findings.
```

### Regression Testing
```
Re-test all previously fixed bugs from ISSUE_TRACKER.md.
Verify issues #1, #17, #18, #19 are still resolved.
Document any regressions.
```

### Performance Testing
```
Test page load performance:
1. Measure time to interactive for each page
2. Check for slow API calls
3. Identify render-blocking resources
4. Test with throttled network (Slow 3G)
Document any performance issues.
```

### Accessibility Audit
```
Check WCAG 2.1 AA compliance:
1. Test keyboard navigation (Tab, Enter, Esc)
2. Check color contrast ratios
3. Verify ARIA labels
4. Test with screen reader simulation
5. Check focus indicators
Document accessibility violations.
```

---

## 🏆 Success Checklist

After your first QA session, you should have:

- ✅ Browser automation working (saw Claude open browser)
- ✅ Screenshots of all major CMS pages
- ✅ List of 10-20 new issues documented
- ✅ Priority ratings for each issue
- ✅ UX improvement recommendations
- ✅ Updated ISSUE_TRACKER.md file
- ✅ Confidence in CMS quality

---

## 🔄 Daily QA Routine (5 min)

```
Morning:
→ Open Claude Desktop
→ "Test critical paths on TownHub CMS"
→ Review findings
→ Create fix tickets for P0/P1 issues

After fixes:
→ "Re-test issues #[X, Y, Z]"
→ Verify fixes work
→ Mark issues as resolved

Before deployment:
→ "Full regression test on all pages"
→ Verify no new issues introduced
→ Sign off on release
```

---

## 🎉 You're Ready!

**Start your first QA session right now:**

1. ✅ Open Claude Desktop
2. ✅ Paste the sample QA session script above
3. ✅ Watch the magic happen
4. ✅ Review the findings
5. ✅ Fix the issues
6. ✅ Ship with confidence!

**Your application quality just went 📈 next level!**

---

**Questions? Issues? Check QA_AGENT_SETUP.md for detailed troubleshooting.**
