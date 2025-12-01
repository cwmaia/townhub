# Engineer Task: Security Audit & Production Database Setup

**Date:** 2025-11-25
**Priority:** Critical
**Status:** Not Started

---

## Overview

Perform a comprehensive security audit across all TownApp repositories and set up a production database environment separate from the current dev/test database.

## Part 1: Security Audit

### Repositories to Audit
1. `/Users/carlosmaia/townhub` - Next.js web app & admin
2. `/Users/carlosmaia/townhub-mobile` - React Native mobile app

### Security Checklist

#### 1. Secrets & Credentials
- [ ] **No hardcoded secrets** in source code
- [ ] Check for exposed API keys in:
  - `.env` files (should be in `.gitignore`)
  - `app.json` / `app.config.js`
  - Source code files
  - Git history (use `git log -p` to search)
- [ ] Verify `.gitignore` includes:
  ```
  .env
  .env.local
  .env.*.local
  *.pem
  *.key
  credentials.json
  ```

#### 2. API Security
- [ ] All API routes validate authentication
- [ ] Admin routes check for admin role
- [ ] No SQL injection vulnerabilities (using parameterized queries)
- [ ] Input validation on all endpoints
- [ ] Rate limiting considerations
- [ ] CORS properly configured

#### 3. Data Exposure
- [ ] No sensitive data in client-side code
- [ ] API responses don't leak unnecessary data
- [ ] User passwords properly hashed (if stored)
- [ ] PII handled appropriately

#### 4. Dependencies
- [ ] Run `npm audit` on both repos
- [ ] Document any high/critical vulnerabilities
- [ ] Update vulnerable packages if safe

#### 5. Mobile App Specific
- [ ] No secrets in `app.json` that shouldn't be there
- [ ] Secure storage used for tokens (not AsyncStorage for sensitive data)
- [ ] Certificate pinning consideration
- [ ] Deep link security

### Files to Specifically Check

```
townhub/
├── .env.local              # Verify not in git
├── app/api/**              # All API routes
├── lib/supabase.ts         # Database connection
├── middleware.ts           # Auth middleware
└── next.config.ts          # Security headers

townhub-mobile/
├── app.json                # Check for exposed keys
├── services/api.ts         # API configuration
├── hooks/useAuth.ts        # Auth implementation
└── utils/storage.ts        # Token storage
```

### Current Known Credentials (to verify are not exposed)

From `.env.local`:
- Supabase URL & Anon Key (public, but verify usage)
- Google Maps API Key (should be restricted)
- Database URL (NEVER expose)
- Mock auth credentials (dev only)

---

## Part 2: Test Coverage

### Check Existing Tests
- [ ] Document current test coverage
- [ ] List untested critical paths:
  - Authentication flows
  - Admin operations
  - Data mutations (create/update/delete)

### Required Tests to Add
- [ ] API endpoint tests (at minimum for auth routes)
- [ ] Input validation tests
- [ ] Permission tests (admin vs user)

---

## Part 3: Production Database Setup

### Current State
- **Dev/Test Database**: Supabase project `magtuguppyucsxbxdpuh`
- Contains test data, mock users

### Tasks

#### 1. Create Production Supabase Project
- [ ] Create new Supabase project for production
- [ ] Name suggestion: `townapp-prod` or similar
- [ ] Document new credentials securely

#### 2. Database Schema Migration
- [ ] Export current schema (without test data)
- [ ] Create migration scripts
- [ ] Document all tables and relationships

#### 3. Environment Configuration
Create environment structure:
```
Development:  .env.local (current)
Staging:      .env.staging (optional)
Production:   .env.production (new)
```

#### 4. Seed Data Strategy
- [ ] Create seed scripts for essential data only:
  - Default categories
  - Town configuration
  - Admin user(s)
- [ ] NO test/fake data in production

### Database Tables to Document

```sql
-- Document each table's purpose, columns, relationships
-- Example format:

-- events: Town events and activities
-- places: Local businesses and attractions
-- users: User accounts
-- notifications: Push notification records
-- etc.
```

---

## Deliverables

### Security Report
Create: `/Users/carlosmaia/townhub/.claude/SECURITY_AUDIT_REPORT.md`
- Findings (critical, high, medium, low)
- Remediation steps
- Status of each fix

### Database Documentation
Create: `/Users/carlosmaia/townhub/.claude/DATABASE_SCHEMA.md`
- All tables documented
- Relationships mapped
- Migration instructions

### Environment Setup Guide
Create: `/Users/carlosmaia/townhub/.claude/ENVIRONMENT_SETUP.md`
- How to configure each environment
- Required secrets
- Deployment checklist

---

## Acceptance Criteria

- [ ] Security audit completed with documented findings
- [ ] All critical/high vulnerabilities addressed
- [ ] `npm audit` clean (or documented exceptions)
- [ ] Production Supabase project created
- [ ] Schema migration scripts ready
- [ ] Environment configuration documented
- [ ] No secrets exposed in git history
- [ ] Test coverage report generated

---

## Commands Reference

```bash
# Security checks
npm audit                           # Check for vulnerabilities
npx eslint . --ext .ts,.tsx        # Lint for issues

# Git history search (for leaked secrets)
git log -p | grep -i "password\|secret\|key\|token" | head -50

# Database
# (Supabase CLI commands for schema export)
npx supabase db dump -f schema.sql
```

---

**Note to Engineer:** Prioritize security findings over database setup. If any critical vulnerabilities are found, fix them immediately before proceeding with database work. Document everything - we need clear records for when we go live.
