# Agent Prompt: Fix Code Review Issues

## Context
You are tasked with fixing critical security issues and implementing improvements identified in a comprehensive code review of the Guidewire Training Platform. The codebase is a Next.js 15 application using TypeScript, Supabase, and OpenAI.

## Your Mission
Fix the critical security vulnerabilities and implement high-priority improvements to make this codebase production-ready.

---

## CRITICAL FIXES (Must Complete First)

### 1. Fix Admin Setup Endpoint Authorization

**File:** `app/api/admin/setup/route.ts`

**Problem:** Admin authorization check is commented out, allowing any authenticated user to run admin setup actions.

**Current Code (lines 20-32):**
```typescript
// Note: Temporarily allowing all authenticated users to run setup
// TODO: Uncomment this check once admin users are properly set up
/*
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile?.role !== 'admin') {
  return jsonError('Admin access required', 403);
}
*/
```

**Required Actions:**
1. Uncomment the admin check code
2. Ensure it properly validates admin role using the `is_admin()` function or direct role check
3. Add proper error handling if profile doesn't exist
4. Remove the temporary comment about allowing all users

**Expected Fix:**
```typescript
// Get user profile and check admin role
const { data: profile, error: profileError } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profileError || !profile) {
  return jsonError('Failed to verify user permissions', 500);
}

if (profile.role !== 'admin') {
  return jsonError('Admin access required', 403);
}
```

---

### 2. Secure or Remove Debug Endpoint

**File:** `app/api/debug/env/route.ts`

**Problem:** Debug endpoint exposes environment variable information and only requires authentication, not admin access.

**Required Actions:**
Choose ONE of these options:

**Option A: Add Admin Protection (Recommended)**
- Add admin role check before returning environment status
- Keep the endpoint but restrict to admins only
- Update the warning comment to reflect admin-only access

**Option B: Remove Endpoint (Safest)**
- Delete the entire file `app/api/debug/env/route.ts`
- Remove any references to this endpoint in documentation

**If choosing Option A, implement:**
```typescript
// After line 26 (after user check), add:
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (!profile || profile.role !== 'admin') {
  return Response.json(
    { success: false, error: 'Admin access required' },
    { status: 403 }
  );
}
```

**Also update the warning comment (line 4-5):**
```typescript
/**
 * Environment Variables Debug Endpoint
 * 
 * ADMIN ONLY: This endpoint requires admin role to access.
 * Returns sanitized info about critical environment variables.
 */
```

---

## HIGH PRIORITY FIXES (Complete After Critical Fixes)

### 3. Add React Error Boundaries

**Problem:** No error boundaries found, which can cause white screen of death on errors.

**Required Actions:**
1. Create a new file: `components/features/ErrorBoundary.tsx`
2. Implement a React Error Boundary component
3. Add error boundaries to:
   - `app/(dashboard)/layout.tsx` - Wrap children
   - `components/features/ai-mentor/MentorChat.tsx` - Wrap chat component
   - `app/(dashboard)/assessments/quizzes/[id]/page.tsx` - Wrap quiz component

**Error Boundary Template:**
```typescript
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
          >
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### 4. Improve Type Safety - Remove Type Workarounds

**Files to fix:**
- `app/api/ai/mentor/route.ts` (line 112-114)
- `app/api/ai/interview/route.ts` (line 90-92)
- `modules/topics/queries.ts` (lines 117, 206, 228)

**Problem:** Using `as any` and `as unknown` type casts to work around Supabase type limitations.

**Required Actions:**
1. First, check if `types/database.ts` has proper RPC function types
2. If not, add proper types for RPC functions:
   ```typescript
   // In types/database.ts, add to Database type:
   Functions: {
     check_prerequisites: {
       Args: {
         p_user_id: string;
         p_topic_id: string;
       };
       Returns: boolean;
     };
     get_next_topic: {
       Args: {
         p_user_id: string;
         p_product_id: string;
       };
       Returns: string | null;
     };
   }
   ```

3. Replace type casts with proper typed calls:
   ```typescript
   // Instead of:
   const db = supabase as unknown as { from: (...args: any[]) => any };
   
   // Use:
   const { data: prerequisitesMet, error } = await supabase.rpc(
     'check_prerequisites',
     { p_user_id: userId, p_topic_id: topic.id }
   );
   ```

4. Add proper error handling for RPC calls

---

### 5. Add Input Validation to Content API

**File:** `app/api/content/[...path]/route.ts`

**Problem:** Path segments validated but could be more strict with regex validation.

**Required Actions:**
1. Add regex validation for product codes (should be 2-3 uppercase letters: CC, PC, BC, FW)
2. Add regex validation for topic codes (format: `cc-01-001`)
3. Add validation for filename (prevent path traversal)

**Implementation:**
```typescript
// After line 32 (after pathSegments extraction), add:
const [productCode, topicCode, ...filenameParts] = pathSegments;

// Validate product code
if (!/^[A-Z]{2,3}$/.test(productCode)) {
  return Response.json(
    { success: false, error: 'Invalid product code format' },
    { status: 400 }
  );
}

// Validate topic code format (e.g., cc-01-001)
if (!/^[a-z]{2}-\d{2}-\d{3}$/.test(topicCode)) {
  return Response.json(
    { success: false, error: 'Invalid topic code format' },
    { status: 400 }
  );
}

// Validate filename (prevent path traversal)
const filename = filenameParts.join('/');
if (filename.includes('..') || filename.includes('//')) {
  return Response.json(
    { success: false, error: 'Invalid filename' },
    { status: 400 }
  );
}
```

---

## MEDIUM PRIORITY IMPROVEMENTS (Nice to Have)

### 6. Add Rate Limiting to Auth Endpoints

**Files:** `modules/auth/actions.ts`

**Problem:** No rate limiting on signup/login endpoints, vulnerable to brute force.

**Required Actions:**
1. Create a rate limiting utility: `lib/rate-limit.ts`
2. Implement in-memory rate limiting (or use Redis if available)
3. Apply to `signIn` and `signUp` functions

**Note:** This is optional but recommended for production.

---

### 7. Add Materialized View Auto-Refresh

**File:** `database/schema.sql`

**Problem:** Materialized view needs manual refresh or trigger.

**Required Actions:**
1. Add trigger function to refresh view on completion updates
2. Or document the need for scheduled refresh job

---

## Testing Your Fixes

After implementing fixes, verify:

1. **Admin Setup Endpoint:**
   - ✅ Non-admin users get 403 error
   - ✅ Admin users can access endpoint
   - ✅ Test with actual admin user

2. **Debug Endpoint:**
   - ✅ Non-admin users get 403 error (if Option A)
   - ✅ Or endpoint doesn't exist (if Option B)

3. **Error Boundaries:**
   - ✅ Test by throwing an error in a component
   - ✅ Verify error UI displays instead of white screen

4. **Type Safety:**
   - ✅ Run `npm run build` - should compile without errors
   - ✅ Check TypeScript errors: `npx tsc --noEmit`

5. **Content API:**
   - ✅ Test with invalid product code - should return 400
   - ✅ Test with invalid topic code - should return 400
   - ✅ Test with path traversal attempt - should return 400

---

## Code Quality Checklist

Before completing, ensure:

- [ ] All critical security issues fixed
- [ ] No new `any` types introduced (except documented workarounds)
- [ ] Error handling added for all new code paths
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] No linter errors (`npm run lint`)
- [ ] All functions have proper error handling
- [ ] Comments updated to reflect changes

---

## Files You'll Modify

1. `app/api/admin/setup/route.ts` - Fix admin check
2. `app/api/debug/env/route.ts` - Add admin protection or delete
3. `components/features/ErrorBoundary.tsx` - Create new file
4. `app/(dashboard)/layout.tsx` - Add error boundary
5. `app/api/content/[...path]/route.ts` - Add input validation
6. `modules/topics/queries.ts` - Improve type safety
7. `app/api/ai/mentor/route.ts` - Improve type safety
8. `app/api/ai/interview/route.ts` - Improve type safety
9. `types/database.ts` - Add RPC function types (if needed)

---

## Success Criteria

✅ **Critical fixes complete:**
- Admin endpoint properly secured
- Debug endpoint secured or removed
- Error boundaries implemented

✅ **High priority fixes complete:**
- Type safety improved
- Content API validation added

✅ **Code quality:**
- No new security vulnerabilities introduced
- TypeScript compiles successfully
- All tests pass (if any exist)

---

## Notes

- Follow existing code patterns and conventions
- Maintain the API response format: `{ success: boolean, data?: T, error?: string }`
- Use Zod for validation where appropriate
- Add proper error logging with context
- Update comments to reflect changes
- Test each fix independently before moving to next

---

## Questions to Consider

If you encounter issues:

1. **Admin user doesn't exist:** Create a migration script or SQL to create first admin user
2. **Type errors after removing `any`:** Check if Supabase types need regeneration
3. **Error boundary not catching errors:** Ensure it's a class component (React requirement)
4. **Rate limiting implementation:** Consider using a library like `@upstash/ratelimit` or simple in-memory solution

---

**Start with the critical fixes first, then move to high priority items. Test each fix before proceeding to the next.**

