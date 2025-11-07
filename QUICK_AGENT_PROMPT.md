# Quick Agent Prompt: Fix Code Review Issues

You are fixing critical security vulnerabilities in a Next.js 15 TypeScript codebase. Follow these steps:

## CRITICAL FIXES (Do First)

### 1. Fix Admin Setup Authorization
**File:** `app/api/admin/setup/route.ts` lines 20-32
- Uncomment the admin role check
- Ensure it validates `profile.role === 'admin'`
- Add error handling if profile doesn't exist
- Remove the "temporarily allowing all users" comment

### 2. Secure Debug Endpoint  
**File:** `app/api/debug/env/route.ts`
- Add admin role check after user authentication (line 26)
- OR delete the entire file if not needed
- Update comments to reflect admin-only access

## HIGH PRIORITY FIXES

### 3. Add Error Boundaries
- Create `components/features/ErrorBoundary.tsx` (class component)
- Wrap children in `app/(dashboard)/layout.tsx`
- Wrap AI mentor chat component
- Wrap quiz components

### 4. Improve Type Safety
- Remove `as any` casts in:
  - `app/api/ai/mentor/route.ts` (line 112)
  - `app/api/ai/interview/route.ts` (line 90)
  - `modules/topics/queries.ts` (lines 117, 206, 228)
- Add proper RPC function types to `types/database.ts` if missing
- Use typed Supabase RPC calls instead of casts

### 5. Add Content API Validation
**File:** `app/api/content/[...path]/route.ts`
- Validate product code: `/^[A-Z]{2,3}$/`
- Validate topic code: `/^[a-z]{2}-\d{2}-\d{3}$/`
- Prevent path traversal in filename

## Verification
- Run `npm run build` - must succeed
- Run `npm run lint` - no errors
- Test admin endpoint returns 403 for non-admins
- Test debug endpoint is secured or removed

**Priority: Critical fixes first, then high priority. Test each fix before proceeding.**

