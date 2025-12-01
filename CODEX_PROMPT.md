# TownApp - AI Assistant Execution Guide

**Project:** TownApp (formerly TownHub)
**Architecture:** React Native Mobile App + Next.js CMS
**Last Updated:** 2025-11-25

---

## 📋 QUICK REFERENCE

Keep this document handy and share it with any AI assistant working on the TownApp project. It captures the required execution context and operating guidelines.

---

## 🎯 PROJECT OVERVIEW

**What is TownApp?**
- **Target Users:** Small towns (up to 15,000 people) and local businesses
- **Business Model:** Subscription-based notification packages for businesses
- **Components:**
  - React Native mobile app (iOS/Android)
  - Next.js CMS for admins
  - PostgreSQL database via Supabase

**Project Locations:**
- **CMS:** `/Users/carlosmaia/townhub`
- **Mobile:** `/Users/carlosmaia/townhub-mobile`

**Key Documentation:**
- **Master Plan:** `.claude/INTEGRATED_DEVELOPMENT_PLAN.md`
- **Current Session:** `.claude/CURRENT_SESSION.md`
- **Setup Guide:** `SETUP.md` and `README.md`
- **Mobile Plan:** `MOBILE_APP_PLAN.md`
- **Database Schema:** `prisma/schema.prisma`

---

## 🚀 PROJECT STRUCTURE

### Current Setup: Separate Projects (Recommended)
```
/Users/carlosmaia/
├── townhub/              # CMS + Backend API
│   ├── app/              # Next.js 16 (App Router)
│   ├── components/       # React components
│   ├── lib/              # Utilities, services
│   ├── prisma/           # Database schema
│   └── .claude/          # AI agent documentation
│
└── townhub-mobile/       # Mobile App
    ├── app/              # Expo Router screens
    ├── components/       # React Native components
    ├── services/         # API client, notifications
    ├── hooks/            # Custom React hooks
    └── eas.json          # EAS Build configuration
```

### Future Option: Monorepo
```
townhub-monorepo/
├── packages/
│   ├── mobile/    # React Native app
│   ├── web/       # Next.js CMS
│   ├── api/       # Backend services
│   └── shared/    # Shared TypeScript types, utilities
```

**Current Recommendation:** Stick with separate projects for simplicity.

---

## 💻 TECHNOLOGY STACK

### CMS (townhub/)
- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** Supabase Auth (mock auth in sandbox)
- **Deployment:** Vercel (recommended)

### Mobile App (townhub-mobile/)
- **Framework:** React Native with Expo (SDK 52)
- **Router:** Expo Router (file-based routing)
- **Language:** TypeScript
- **State:** React Query for API calls
- **Maps:** react-native-maps (Google Maps)
- **Notifications:** Expo Push Notifications
- **Build:** EAS Build (for native features)
- **Deployment:** EAS Submit (App Store/Play Store)

---

## 🗄️ DATABASE CONTEXT

### Connection Details (Supabase)

**Primary Connection:**
```
postgresql://postgres:Cwm1980Awm2012@db.magtuguppyucsxbxdpuh.supabase.co:5432/postgres
```

**Connection Pooling (PgBouncer):**
```
postgresql://postgres:Cwm1980Awm2012@db.magtuguppyucsxbxdpuh.supabase.co:6543/postgres?pgbouncer=true
```

**Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://..." (direct connection)
DATABASE_URL_POOLING="postgresql://..." (pooler for serverless)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://magtuguppyucsxbxdpuh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_77Icp07Im42qXBLsDDPm4Q_ADGbmvXM

# Mock Auth (sandbox only)
MOCK_AUTH=true
```

### Database Schema

**Key Tables:**
- `User` - Users with roles (SUPER_ADMIN, TOWN_ADMIN, BUSINESS_OWNER)
- `Town` - Towns/municipalities
- `Place` - Places of interest (lodging, restaurants, attractions)
- `Event` - Events and activities
- `Business` - Local businesses with subscriptions
- `Notification` - Push notifications
- `DeviceToken` - Mobile device registration for push

**See:** `prisma/schema.prisma` for full schema

---

## 🎭 DEVELOPMENT WORKFLOW

### AI Agent Roles

**1. Architect**
- Coordinates all agents
- Reviews and approves work
- Makes technical decisions
- Writes prompts for other agents
- **Does NOT write code directly**

**2. Engineer**
- Implements features
- Fixes bugs
- Writes code following specs
- Reports completion with evidence

**3. QA Agent**
- Tests functionality
- Finds bugs
- Creates quality reports
- Verifies fixes

**4. Designer Agent**
- Audits visual design
- Creates design systems
- Defines brand identity
- Recommends improvements

### Working with Agents

**Engineer Prompt Format:**
```markdown
## ENGINEER TASK: [Task Name]

### OBJECTIVE
[Clear goal]

### STEPS
1. [Specific action]
2. [Specific action]

### ACCEPTANCE CRITERIA
- ✅ [Success metric]
- ✅ [Expected outcome]

### FILES TO MODIFY
- [List of files]
```

**QA/Designer Prompts:**
- Point them to their unified prompt files:
  - `.claude/QA_UNIFIED_PROMPT.md`
  - `.claude/DESIGNER_UNIFIED_PROMPT.md`

---

## ⚡ OPTIMIZATION GUIDELINES

### 1. Token-Efficient Practices
- **Read only what you need** - Use Glob/Grep for targeted searches
- **Reuse existing code** - Check for similar patterns before writing new code
- **Use Task tool for exploration** - Reduce context usage
- **Reference, don't repeat** - Point to existing implementations

### 2. Incremental Development
- Implement features in small, testable chunks
- Use TodoWrite tool to track progress
- Mark tasks completed immediately
- Test each feature before moving to next

### 3. Code Reuse
- Analyze existing code in `/Users/carlosmaia/townhub` first
- Reuse TypeScript types, utilities, business logic
- Share constants between web and mobile
- Extract common code to shared utilities

### 4. Performance Best Practices
- Leverage existing libraries (don't reinvent)
- Follow React Native performance guidelines
- Implement proper memoization and lazy loading
- Use TypeScript types from existing codebase

---

## 📱 MOBILE APP DEVELOPMENT

### EAS Build System

**Configuration** (`eas.json`):
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

**Build Commands:**
```bash
# Development build (includes dev client)
eas build --profile development --platform android

# Preview build (for testing)
eas build --profile preview --platform android

# Production build
eas build --profile production --platform android

# iOS builds
eas build --profile [development|preview|production] --platform ios
```

### Native Features Requiring EAS Build

- **Maps:** `react-native-maps` (requires native modules)
- **Notifications:** Expo Push Notifications (native setup)
- **Camera:** `expo-camera` (native permissions)
- **Location:** `expo-location` (GPS access)

### Testing on Physical Device

**Requirements:**
- Device connected to same WiFi as dev machine
- Metro bundler running on host machine
- Correct IP address configured

**Setup:**
1. Find host IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Update `townhub/.env.local`: `NEXT_PUBLIC_API_URL=http://[IP]:3000`
3. Update `townhub-mobile/app.json`: `extra.apiUrl`
4. Start Metro: `npx expo start --dev-client`
5. On device, enter Metro URL: `http://[IP]:8081`

---

## 🔧 COMMON COMMANDS

### Backend (CMS)
```bash
cd /Users/carlosmaia/townhub

# Start dev server
npm run dev

# Start on specific host (for mobile access)
sudo -E npm run dev -- --hostname 0.0.0.0 --port 3000

# Database commands
npx prisma migrate dev        # Create migration
npx prisma db push            # Push schema without migration
npx prisma studio             # Open database GUI
npx prisma generate           # Generate Prisma client

# Type checking
npx tsc --noEmit
```

### Mobile App
```bash
cd /Users/carlosmaia/townhub-mobile

# Start Expo development
npx expo start

# Start with dev client (after EAS build)
npx expo start --dev-client

# Clear cache
npx expo start --clear

# Type checking
npx tsc --noEmit

# Build commands
eas build --profile development --platform android
eas build --profile development --platform ios
```

---

## 🐛 TROUBLESHOOTING

### Permission Errors (EACCES)
```bash
# Fix file ownership
sudo chown -R carlosmaia:staff /Users/carlosmaia/townhub
sudo chown -R carlosmaia:staff /Users/carlosmaia/townhub-mobile
```

### Port Conflicts
```bash
# Check what's using ports
lsof -i :3000 -i :8081 -i :8082 | grep LISTEN

# Kill process
sudo kill -9 <PID>
```

### Turbopack Crashes (Next.js)
```bash
# Clear Next.js cache
rm -rf /Users/carlosmaia/townhub/.next
cd /Users/carlosmaia/townhub && npm run dev
```

### Metro Connection Issues
1. Check IP hasn't changed: `ifconfig | grep "inet "`
2. Update `.env.local` and `app.json`
3. Restart both servers
4. Clear Metro cache: `npx expo start --clear`

### Database Connection Issues
- Use connection pooling URL for serverless functions
- Check Supabase dashboard for connection limits
- Verify credentials in `.env.local`

---

## 📊 PHASE-BY-PHASE DEVELOPMENT

### Phase 1: Foundation ✅ COMPLETE
- [x] Mobile project setup (Expo)
- [x] Database schema extensions
- [x] API client setup
- [x] Basic routing and navigation

### Phase 2: Core Features ✅ COMPLETE
- [x] Authentication flow (mock auth for sandbox)
- [x] Place/Event listing screens
- [x] Business profiles
- [x] Push notification system (all 4 phases)

### Phase 3: Polish & Testing 🟡 IN PROGRESS
- [x] EAS build setup
- [x] Visual polish (widgets, cards, gradients)
- [x] Bug fixes (map data, images, routing)
- [ ] P1 UX fixes (place listing, dropdowns)
- [ ] End-to-end testing
- [ ] Cross-browser testing

### Phase 4: Launch Prep 🔜 UPCOMING
- [ ] TownHub → TownApp rebranding
- [ ] Security audit
- [ ] Production database setup
- [ ] App Store/Play Store submission
- [ ] Marketing materials

---

## 🎯 CURRENT PRIORITIES

**This Week:**
1. **Documentation Organization** (QA Agent - active)
   - Consolidate 62 markdown files
   - Create organized folder structure
   - Target: 9/10 documentation health

2. **P1 UX Fixes** (Engineer - queued)
   - Issue #20: Place listing refactor
   - Issue #21: Type dropdown placeholder

3. **Interactive Map Testing** (Architect - next)
   - Test on Samsung device
   - Verify markers and filters
   - GPS auto-detection

**This Month:**
4. **Rebranding** (Designer - in progress)
5. **Security Audit** (Engineer - queued)
6. **Final QA & Launch** (All agents)

---

## 📖 REFERENCE INFORMATION

### Issue Tracking
- **Location:** `.claude/ISSUE_TRACKER.md`
- **Total:** 34 issues (19 fixed, 15 open)
- **Critical:** 0 P0, 2 P1, 9 P2, 4 P3

### Quality Score
- **Current:** 85/100
- **Target for Launch:** 95/100
- **Latest Report:** `qa-reports/QA_SESSION_2025-11-20_FINAL.md`

### Key Metrics
- **Functionality:** 100% (no critical bugs)
- **Visual Design:** 95/100
- **UX:** 75% (P1 issues remain)
- **Performance:** 90/100
- **Accessibility:** 80/100

---

## ✅ VERIFICATION & SUCCESS CRITERIA

### Before Launch Must Have:
- [ ] 0 P0 (Critical) issues
- [ ] 0 P1 (High) issues
- [ ] Notification system working end-to-end
- [ ] Quality score ≥ 95/100
- [ ] Cross-browser tested
- [ ] Mobile responsive verified
- [ ] Documentation organized

### Testing Checklist:
- [ ] Send notification from CMS → receive on mobile
- [ ] All screens load without errors
- [ ] Images display correctly
- [ ] Forms validate properly
- [ ] Navigation works smoothly
- [ ] Map markers display and are interactive
- [ ] GPS location detection works
- [ ] Offline handling (graceful degradation)

---

## 🔗 USEFUL LINKS

**Documentation:**
- Expo Docs: https://docs.expo.dev/
- React Native: https://reactnative.dev/
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- shadcn/ui: https://ui.shadcn.com/

**Project Accounts:**
- Expo: kalwag (logged in via EAS CLI)
- Supabase: magtuguppyucsxbxdpuh

---

## 💡 TIPS FOR NEW AI SESSIONS

1. **Start by reading:**
   - `.claude/CURRENT_SESSION.md` (this is always current)
   - `.claude/INTEGRATED_DEVELOPMENT_PLAN.md` (master plan)

2. **Understand your role:**
   - If Architect: Read `.claude/ARCHITECT_RULES.md`
   - If Engineer: Read `.claude/ENGINEER_RULES.md`
   - If QA: Read `.claude/QA_UNIFIED_PROMPT.md`
   - If Designer: Read `.claude/DESIGNER_UNIFIED_PROMPT.md`

3. **Check current priorities:**
   - Look at `ISSUE_TRACKER.md` for P0/P1 items
   - Review recent commits in git history

4. **Test before approving:**
   - Start both servers (CMS + Mobile)
   - Test on actual device when possible
   - Verify against acceptance criteria

5. **Document as you go:**
   - Update `CURRENT_SESSION.md` with progress
   - Add new issues to `ISSUE_TRACKER.md`
   - Use TodoWrite to track tasks

---

## 🚀 YOU'RE READY!

This project is **90% complete** and ready for the final push. Follow the priorities, coordinate with agents, and maintain quality standards.

**Questions?** Everything is documented in `/Users/carlosmaia/townhub/.claude/`

**Last Updated:** 2025-11-25
**Project Status:** Documentation organization → P1 fixes → Launch
**Timeline:** 6-8 hours to launch-ready state
