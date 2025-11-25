# AI Agent Prompt - Setup QA System for TownHub

Copy and paste this entire prompt to an AI assistant (Claude, GPT-4, etc.) to set up automated QA testing.

---

## 🎯 YOUR MISSION

You are an AI Engineer tasked with setting up an automated QA testing system for the TownHub project. You will install dependencies, configure the system, and run comprehensive tests on both the CMS and mobile app.

---

## 📁 PROJECT STRUCTURE

### Main Applications

**CMS (Content Management System):**
- **Location:** `/Users/carlosmaia/townhub`
- **Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, PostgreSQL
- **URL:** http://localhost:3000
- **Start Command:** `cd /Users/carlosmaia/townhub && npm run dev`
- **Admin Portal:** http://localhost:3000/en/admin
- **Authentication:** Mock mode active (any credentials work)

**Mobile App:**
- **Location:** `/Users/carlosmaia/townhub-mobile`
- **Tech Stack:** React Native, Expo, TypeScript
- **Start Command:** `cd /Users/carlosmaia/townhub-mobile && npx expo start`
- **Note:** May have environment issues in sandbox

---

## 📚 DOCUMENTATION TO READ

Before starting, read these files to understand the project:

### Core Documentation
1. `/Users/carlosmaia/townhub/.claude/QA_AGENT_PROMPT.md`
   - Comprehensive testing checklist
   - Issue documentation format
   - Quality standards

2. `/Users/carlosmaia/townhub/.claude/QA_AGENT_SETUP.md`
   - Full setup guide with 3 options
   - Troubleshooting tips
   - CI/CD integration

3. `/Users/carlosmaia/townhub/.claude/QA_QUICK_START.md`
   - 15-minute quick start guide
   - Sample prompts
   - Pro tips

4. `/Users/carlosmaia/townhub/scripts/RUN_QA.md`
   - How to run the QA automation script
   - Setup instructions
   - Expected output

### Project Context
5. `/Users/carlosmaia/townhub/.claude/ISSUE_TRACKER.md`
   - Known issues and bugs
   - Testing status
   - Previously fixed issues

6. `/Users/carlosmaia/townhub/.claude/SESSION_CHECKPOINT.md`
   - Current project state
   - What's working
   - Next tasks

7. `/Users/carlosmaia/townhub/.claude/ARCHITECT_RULES.md`
   - Project workflow
   - Role definitions

8. `/Users/carlosmaia/townhub/TOWNAPP_CMS_PLAN.md`
   - Project roadmap
   - Feature phases
   - Delivery plan

9. `/Users/carlosmaia/townhub/MOBILE_APP_PLAN.md`
   - Mobile app architecture
   - Implementation phases

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Verify Environment

Check that the CMS is running:
```bash
# Check if dev server is running
curl -I http://localhost:3000

# If not running, start it:
cd /Users/carlosmaia/townhub
npm run dev
```

### Step 2: Install QA Dependencies

```bash
cd /Users/carlosmaia/townhub

# Install Playwright and Anthropic SDK
npm install --save-dev @playwright/test @anthropic-ai/sdk

# Install Chromium browser
npx playwright install chromium
```

### Step 3: Configure API Key

You need an Anthropic API key for Claude to analyze pages.

**Option A: Environment Variable**
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

**Option B: .env.local file**
```bash
echo 'ANTHROPIC_API_KEY=sk-ant-api03-...' >> /Users/carlosmaia/townhub/.env.local
```

**Note:** Ask the user for their API key if not already set.

### Step 4: Verify QA Script Exists

Check that the QA script is in place:
```bash
ls -la /Users/carlosmaia/townhub/scripts/qa-agent.ts
```

This file should exist. If not, it needs to be created (refer to QA_AGENT_SETUP.md).

---

## 🧪 TESTING WORKFLOW

### Phase 1: Run Automated QA Script

```bash
cd /Users/carlosmaia/townhub

# Run the QA agent
npx ts-node scripts/qa-agent.ts
```

**What this does:**
1. Opens browser (Chromium)
2. Navigates to each CMS page:
   - Login page (`/en/auth/login`)
   - Admin dashboard (`/en/admin`)
   - Business management (`/en/admin/businesses`)
   - Notification center (`/en/admin/notifications`)
3. Takes full-page screenshots
4. Uses Claude API to analyze each page for bugs
5. Generates comprehensive report
6. Updates ISSUE_TRACKER.md

**Expected Output:**
- Screenshots in `qa-reports/` directory
- `QA_REPORT.md` with all findings
- Console output showing progress

### Phase 2: Review Results

```bash
# Read the generated report
cat /Users/carlosmaia/townhub/qa-reports/QA_REPORT.md

# Check updated issue tracker
cat /Users/carlosmaia/townhub/.claude/ISSUE_TRACKER.md
```

### Phase 3: Document Findings

For each issue found:
1. Assign priority (P0/P1/P2/P3)
2. Document in ISSUE_TRACKER.md format
3. Add screenshots
4. Suggest fixes

### Phase 4: Mobile App Testing (if accessible)

```bash
cd /Users/carlosmaia/townhub-mobile

# Try to start mobile app
npx expo start

# Note: May have environment issues
# Document if it starts or fails
```

If mobile app starts:
- Test all tabs (Home, Places, Events, Notifications, Profile)
- Take screenshots
- Document issues
- Compare to CMS data

---

## 📋 TESTING CHECKLIST

Use this checklist from QA_AGENT_PROMPT.md:

### CMS Pages to Test:
- [ ] Login page (`/en/auth/login`)
- [ ] Admin dashboard (`/en/admin`)
- [ ] Business management (`/en/admin/businesses`)
- [ ] Notification center (`/en/admin/notifications`)
- [ ] Places management (if exists)
- [ ] Events management (if exists)

### For Each Page Check:
- [ ] Page loads without errors
- [ ] No console errors (check browser console)
- [ ] Visual alignment and spacing correct
- [ ] Forms validate properly
- [ ] Buttons work and have hover states
- [ ] Responsive layout works (test 375px, 768px, 1280px)
- [ ] Loading states display
- [ ] Error messages are clear
- [ ] Navigation works correctly

### Mobile App (if accessible):
- [ ] App starts without errors
- [ ] Login/authentication works
- [ ] Home tab displays data
- [ ] Places tab shows images
- [ ] Events tab shows events
- [ ] Notifications tab loads
- [ ] Profile tab accessible
- [ ] API integration working
- [ ] Images render correctly

---

## 📊 DELIVERABLES

After completing QA testing, provide:

### 1. Executive Summary
```markdown
## QA Test Summary - [Date]

**Total Issues Found:** X
- 🔴 Critical (P0): X
- 🟠 High (P1): X
- 🟡 Medium (P2): X
- 🟢 Low (P3): X

**Pages Tested:** [List]
**Overall Quality:** [Excellent/Good/Needs Work/Poor]
```

### 2. Detailed Issue List
Use this format (from ISSUE_TRACKER.md):
```markdown
### Issue #X: [Title]
**Priority:** 🔴 P0
**Status:** ⏳ Open
**Component:** CMS - [Page]
**Description:** [Detailed description]

**Steps to Reproduce:**
1. Step one
2. Step two

**Expected Behavior:** [What should happen]
**Actual Behavior:** [What actually happens]
**Impact:** [User/business impact]
**Screenshot:** [Path or attach]
**Suggested Fix:** [Your recommendation]
```

### 3. Screenshots
- Save all screenshots in `qa-reports/` directory
- Reference them in issue reports
- Organize by page/component

### 4. Updated Files
- Update `/Users/carlosmaia/townhub/.claude/ISSUE_TRACKER.md`
- Generate `/Users/carlosmaia/townhub/qa-reports/QA_REPORT.md`
- Log findings clearly

---

## 🎯 SUCCESS CRITERIA

Your QA setup is successful when:
- ✅ QA script runs without errors
- ✅ Browser opens and navigates pages
- ✅ Screenshots captured for all pages
- ✅ Claude analyzes each page
- ✅ Report generated with findings
- ✅ ISSUE_TRACKER.md updated
- ✅ All P0/P1 issues documented
- ✅ Fix recommendations provided

---

## ⚠️ KNOWN ISSUES & BLOCKERS

Reference from SESSION_CHECKPOINT.md and ISSUE_TRACKER.md:

### Working Systems ✅
- CMS dev server running on port 3000
- Mock authentication active (MOCK_AUTH=true)
- Database has sample data (30 places, 4 events, 4 businesses)
- Admin portal accessible at /en/admin
- API endpoints returning data

### Known Blockers 🚫
- **Issue #15:** Mobile app cannot start in sandbox (Expo port error)
- **Issue #16:** Supabase not reachable (DNS failure - mock auth implemented)
- Network restrictions: npm registry may be unreachable

### Recent Fixes ✅
- Issue #1: Admin import paths fixed
- Issue #17: Business Select error fixed
- Issue #18: Notifications redirect fixed
- Issue #19: Database duplicates removed
- Images now display on mobile (absolute URLs)

---

## 🔧 TROUBLESHOOTING

### If QA Script Fails:

**"Cannot find module @playwright/test"**
```bash
npm install --save-dev @playwright/test @anthropic-ai/sdk
```

**"ANTHROPIC_API_KEY is required"**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

**"Executable doesn't exist"**
```bash
npx playwright install chromium
```

**"Connection refused localhost:3000"**
```bash
cd /Users/carlosmaia/townhub
npm run dev
```

**"Permission denied"**
```bash
chmod +x scripts/qa-agent.ts
```

---

## 💡 OPTIMIZATION TIPS

### For Faster Testing:
```typescript
// In qa-agent.ts, set headless mode
this.browser = await chromium.launch({ headless: true });
```

### For More Detailed Analysis:
Modify the Claude prompt in `analyzePageWithClaude()` to focus on specific areas.

### For Mobile Testing:
```typescript
// Add mobile viewport
this.page = await this.browser.newPage({
  viewport: { width: 375, height: 667 },
  isMobile: true,
});
```

---

## 📝 REPORTING FORMAT

Use this template for your final report:

```markdown
# QA Testing Report - TownHub
**Date:** [YYYY-MM-DD]
**Tester:** AI QA Agent
**Environment:** Development (localhost)

## Executive Summary
[Brief overview of testing session]

## Test Coverage
- CMS: [X pages tested]
- Mobile: [Status]
- APIs: [Status]

## Issues Found
[Detailed list with priorities]

## Screenshots
[Links to all screenshots]

## Recommendations
[Priority fixes and improvements]

## Next Steps
[What should be fixed first]
```

---

## 🎉 BEGIN TESTING

**Your mission starts now:**

1. Read all documentation files listed above
2. Verify CMS is running
3. Install QA dependencies
4. Run QA script
5. Review results
6. Document issues
7. Provide comprehensive report

**Good luck! Your thorough testing will make TownHub production-ready.** 🚀

---

## 📞 NEED HELP?

If you encounter issues:
1. Check the troubleshooting section in RUN_QA.md
2. Review ISSUE_TRACKER.md for known problems
3. Ask the user for missing information (API keys, credentials)
4. Document any blockers you encounter

**Remember:** You're the QA expert. Be thorough, methodical, and detail-oriented!
