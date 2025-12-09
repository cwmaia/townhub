# Fix Mock Auth for Settings Page and Login Routes

## Problems to Fix

### 1. Settings Page Not Working with Mock Auth
**File:** `app/[locale]/settings/page.tsx`

The settings page uses `createSupabaseServerClient` directly (lines 20-26) instead of `getCurrentProfile()` from `lib/auth/guards.ts`. This means mock auth users get redirected away because Supabase returns no user.

**Fix:** Replace the Supabase auth check with `getCurrentProfile()`:

```typescript
import { getCurrentProfile } from "@/lib/auth/guards";

// Replace lines 20-27 with:
const { user, profile: existingProfile } = await getCurrentProfile();

if (!user) {
  redirect(`/${locale}/stykkisholmur`);
}

// Then query for the full profile with subscriptions using existingProfile.userId or user.id
```

### 2. Login Page Mock Auth Not Working
**File:** `app/[locale]/auth/login/page.tsx`

The login page checks `process.env.NEXT_PUBLIC_MOCK_AUTH` (line 21) but:
- The server uses `MOCK_AUTH` (not NEXT_PUBLIC_MOCK_AUTH)
- Even if both are set, NEXT_PUBLIC_ vars need to be added to Vercel separately

**Fix:** The login page should work without needing the client-side env var. Instead, fetch the mock status from an API or always show mock options when on the login page since real users would use magic link from ProfileMenu.

Simple fix: Always show demo personas on the login page (this is an admin login page anyway):

```typescript
// Remove the mockEnabled check on line 21, or set it to true by default for demo purposes
// Or create a simple API endpoint that returns { mockEnabled: boolean }
```

### 3. Add Regular USER Demo Persona for Onboarding Demo
**File:** `lib/auth/demo-users.ts`

Currently only has SUPER_ADMIN, TOWN_ADMIN, BUSINESS_OWNER. Need a regular USER persona to demo the onboarding flow.

**Add to DEMO_USER_OPTIONS:**
```typescript
{
  userId: "demo-user",
  email: "user@townhub.demo",
  firstName: "Demo",
  role: "USER",
  label: "Regular User",
  description: "Standard user account to test onboarding and subscriptions.",
  redirectPath: "/stykkisholmur",
},
```

**Also update the type:**
```typescript
export type DemoUserRole = "SUPER_ADMIN" | "TOWN_ADMIN" | "BUSINESS_OWNER" | "USER";
```

### 4. Create Demo User Profile in Database
Need to ensure the demo-user profile exists in the database. Either:
- Add a migration/seed script
- Or have the mock.ts create the profile on first access if it doesn't exist

**In `lib/auth/mock.ts`, update `getMockAuthSession` to upsert profile if not found:**

```typescript
export async function getMockAuthSession(): Promise<MockAuthContext | null> {
  if (!MOCK_AUTH_ENABLED) {
    return null;
  }

  const cookieStore = await cookies();
  const cookieUserId = cookieStore.get(MOCK_AUTH_COOKIE_NAME)?.value;
  const defaultUserId = process.env.MOCK_AUTH_USER_ID;
  const selectedUser =
    DEMO_USER_OPTIONS.find((user) => user.userId === cookieUserId) ??
    DEMO_USER_OPTIONS.find((user) => user.userId === defaultUserId) ??
    DEFAULT_DEMO_USER;

  // Upsert the profile to ensure it exists
  const profile = await prisma.profile.upsert({
    where: { userId: selectedUser.userId },
    create: {
      userId: selectedUser.userId,
      email: selectedUser.email,
      firstName: selectedUser.firstName,
      role: selectedUser.role as UserRole,
    },
    update: {}, // Don't update if exists
  });

  return {
    user: {
      id: selectedUser.userId,
      email: profile.email ?? selectedUser.email,
    },
    profile,
  };
}
```

### 5. Add Link to Onboarding from Settings Page
**File:** `app/[locale]/settings/SettingsClient.tsx`

Add a button/link to re-run the onboarding flow for demo purposes. Something like:
```tsx
<Button variant="outline" onClick={() => router.push(`/${locale}/onboarding`)}>
  Re-run Onboarding Setup
</Button>
```

Or create a web onboarding page if it doesn't exist yet.

## Files to Modify

1. `app/[locale]/settings/page.tsx` - Use getCurrentProfile() instead of direct Supabase
2. `app/[locale]/auth/login/page.tsx` - Fix mock auth detection or always show demo options
3. `lib/auth/demo-users.ts` - Add USER role and demo-user persona
4. `lib/auth/mock.ts` - Upsert profile on access to auto-create demo users
5. `app/[locale]/settings/SettingsClient.tsx` - Optionally add onboarding link

## Testing

After fixes:
1. Go to `/en/auth/login` - should see demo persona buttons
2. Click "Regular User" - should redirect to stykkisholmur
3. Click profile avatar → Settings - should load settings page
4. Settings page should show notification preferences
