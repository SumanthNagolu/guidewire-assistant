# Student Authentication Flows - Dual Entry Points

## Overview

The platform now supports **TWO separate authentication flows** to optimize the user experience based on entry point:

1. **Academy-Direct Flow** - For users entering from Academy marketing pages
2. **Generic Platform Flow** - For users entering from main navigation

---

## Flow 1: Academy-Direct Student Auth

**Entry Points:**
- `/academy-info` page → "Access Training Portal" button
- `/academy-info` page → "Start Learning Today" button
- Any other academy marketing pages

**Login Flow:**
```
Academy Page
    ↓
/login/student (Student-Specific Login)
    ↓
Has account? → Sign In → Academy Dashboard
    ↓
No account? → "Create Student Account" button
    ↓
/signup/student (Direct to Student Signup)
    ↓
Fill form → Submit
    ↓
/signup/student/confirmation
    ↓
Check email → Click verification link
    ↓
/auth/callback → Verify email
    ↓
/student-profile-setup (Complete Your Profile)
    ↓
Fill profile → Submit
    ↓
/academy (Student Dashboard)
```

**Key Features:**
- **No role selection needed** - User is clearly coming for student/training content
- **Streamlined UX** - Fewer clicks, faster onboarding
- **Context-aware** - Branding and messaging match Academy theme
- **Direct path** - Student login → Student signup → Profile setup → Academy

**Files:**
- `/app/(auth)/login/student/page.tsx` - Student-specific login page (NEW)
- `/app/(auth)/signup/student/page.tsx` - Student signup form
- `/app/(auth)/student-profile-setup/page.tsx` - Profile completion
- `/app/(marketing)/academy-info/page.tsx` - Updated CTAs to `/login/student`

---

## Flow 2: Generic Platform Auth

**Entry Points:**
- Main navigation "Sign In" button
- Direct URL access to `/login`
- General signup link from external sources

**Login Flow:**
```
Generic Entry Point
    ↓
/login (Generic Login Page)
    ↓
Has account? → Sign In → Role-based redirect
    ↓
No account? → "Sign up" link
    ↓
/signup (Signup Selector)
    ↓
Choose: Student | Candidate | Client
    ↓
/signup/{role} (Role-specific signup)
    ↓
Fill form → Submit
    ↓
Role-specific confirmation/onboarding
```

**Key Features:**
- **Multi-role support** - Student, Candidate, Client paths
- **Flexibility** - Users can choose their path
- **Traditional flow** - Familiar pattern for general users
- **Role-based routing** - Each role goes to appropriate portal

**Files:**
- `/app/(auth)/login/page.tsx` - Generic login page
- `/app/(auth)/signup/page.tsx` - Role selector page
- `/app/(auth)/signup/student/page.tsx` - Student signup
- `/app/(auth)/signup/candidate/page.tsx` - Candidate signup
- `/app/(auth)/signup/client/page.tsx` - Client signup

---

## Comparison Table

| Aspect | Academy-Direct Flow | Generic Platform Flow |
|--------|-------------------|---------------------|
| **Entry Point** | Academy marketing pages | Main navigation, external links |
| **Login URL** | `/login/student` | `/login` |
| **Signup Path** | Direct to `/signup/student` | Via selector at `/signup` |
| **Role Selection** | None (implicit) | Explicit (Student/Candidate/Client) |
| **Clicks to Signup** | 2 clicks | 3 clicks (includes selector) |
| **Target Audience** | Academy-focused users | All platform users |
| **Branding** | Academy-themed | Platform-generic |

---

## Technical Implementation

### **Login Pages:**

**Student-Specific Login** (`/login/student`):
- Academy branding (Graduation cap icon, indigo colors)
- "Create Student Account" button → Direct to `/signup/student`
- Link to generic login: "Other sign-in options" → `/login`

**Generic Login** (`/login`):
- Platform branding
- "Sign up" link → `/signup` (selector page)
- Handles all user types via role-based routing

### **Signup Pages:**

**Direct Student Signup** (`/signup/student`):
- Accessible from Academy flow AND generic flow
- Links back to both `/login/student` and `/signup`
- Email verification → `/student-profile-setup`

**Signup Selector** (`/signup`):
- Shows 3 cards: Student | Candidate | Client
- Each card links to role-specific signup
- Only shown in generic flow

### **Profile Setup:**

**Student Profile Setup** (`/student-profile-setup`):
- Comprehensive profile form with:
  - Personal information (name, contact)
  - Location details (country, state)
  - Professional background (title, company, experience)
  - Learning interests (roles, technologies, goals)
- Required fields marked with *
- Validation before submission
- Redirects to `/academy` on completion

---

## Navigation Links Updated

### **Academy Page** (`/academy-info/page.tsx`):
```typescript
// Line 59: "Access Training Portal" button
<Link href="/login/student">

// Line 177: "Start Learning Today" button  
<Link href="/login/student">
```

### **Student Login Page** (`/login/student/page.tsx`):
```typescript
// "Create Student Account" button
<Link href="/signup/student">

// "Other sign-in options" link
<Link href="/login">
```

### **Generic Login Page** (`/login/page.tsx`):
```typescript
// "Sign up" link
<Link href="/signup">
```

### **Student Signup Page** (`/signup/student/page.tsx`):
```typescript
// "Log in" link - points to student login
<Link href="/login/student">

// "Choose signup type" link - back to selector
<Link href="/signup">
```

---

## Email Verification Fixes

### **Issue:**
Email verification links were expiring and redirecting to home page with errors.

### **Solution:**

**1. Fixed Redirect URLs** (`/app/auth/callback/route.ts`):
- Students now redirect to `/student-profile-setup` (not `/profile-setup`)
- Error handling for expired tokens
- Proper URL construction for production

**2. Fixed Production URL** (`/modules/auth/actions.ts`):
```typescript
const appUrl = process.env.NODE_ENV === 'production' 
  ? 'https://www.intimeesolutions.com'
  : 'http://localhost:3000';
```

**3. Error Handling Page** (`/signup/student/verify-email/page.tsx`):
- Displays error message for expired links
- "Resend Verification Email" button
- Proper error messaging and guidance

**4. Middleware Error Interception** (`/middleware.ts`):
- Catches OTP expired errors on home page
- Redirects to error handling page
- Preserves error parameters

---

## User Experience Matrix

### **Scenario 1: Academy Visitor (First Time)**
1. Visits `/academy-info`
2. Clicks "Access Training Portal"
3. Lands on `/login/student` 
4. Sees "Create Student Account" button
5. Clicks → `/signup/student`
6. ✅ **No role selector shown** - Direct path to signup

### **Scenario 2: Returning Student**
1. Visits `/academy-info`
2. Clicks "Access Training Portal"
3. Lands on `/login/student`
4. Enters credentials
5. ✅ **Signs in directly** - Goes to Academy

### **Scenario 3: General Platform Visitor**
1. Clicks "Sign In" in main navigation
2. Lands on `/login` (generic)
3. Clicks "Sign up"
4. Lands on `/signup` (selector)
5. Chooses role: Student | Candidate | Client
6. ✅ **Proceeds to role-specific signup**

### **Scenario 4: Email Link Expired**
1. User signs up
2. Email link expires
3. Clicks expired link
4. Lands on `/signup/student/verify-email` with error
5. Clicks "Resend Verification Email"
6. ✅ **New email sent** - Can try again

---

## Benefits

### **For Academy Users:**
- ✅ **Faster onboarding** - 1 less click (no selector)
- ✅ **Clearer intent** - Academy branding throughout
- ✅ **Reduced friction** - Direct path to learning
- ✅ **Better conversion** - Fewer drop-off points

### **For Platform Users:**
- ✅ **Flexibility** - Can choose any role
- ✅ **Clarity** - Explicit role selection
- ✅ **Unified experience** - All roles accessible

### **For Business:**
- ✅ **Higher conversion** - Optimized academy flow
- ✅ **Better analytics** - Can track entry sources
- ✅ **Scalability** - Easy to add more role-specific flows
- ✅ **Professional UX** - Best practice implementation

---

## Testing Checklist

### **Academy-Direct Flow:**
- [ ] Click "Access Training Portal" on academy page → Lands on `/login/student`
- [ ] Student login page shows academy branding
- [ ] "Create Student Account" → Goes to `/signup/student` (no selector)
- [ ] Student signup → Email verification → `/student-profile-setup`
- [ ] Profile setup → Redirects to `/academy`

### **Generic Platform Flow:**
- [ ] Click "Sign In" in navigation → Lands on `/login`
- [ ] Generic login "Sign up" link → Goes to `/signup` (selector)
- [ ] Selector shows 3 cards (Student, Candidate, Client)
- [ ] Each card links to correct signup page
- [ ] All role-specific signups work correctly

### **Email Verification:**
- [ ] Fresh verification link → Redirects to `/student-profile-setup`
- [ ] Expired link → Shows error page at `/signup/student/verify-email`
- [ ] Resend email button works
- [ ] New email arrives with working link

### **Cross-Navigation:**
- [ ] Student login page has link to `/login` (generic)
- [ ] Student signup has link to `/signup` (selector)
- [ ] All flows can access each other
- [ ] No broken links or circular redirects

---

## File Structure

```
/app
  /(auth)
    /login
      page.tsx              # Generic login (all users)
      /student
        page.tsx            # Student-specific login (NEW)
    /signup
      page.tsx              # Role selector (Student/Candidate/Client)
      /student
        page.tsx            # Student signup form
        /confirmation
          page.tsx          # Email sent confirmation
        /verify-email
          page.tsx          # Error handling & resend (NEW)
    /student-profile-setup
      page.tsx              # Complete profile (students only)
    /auth/callback
      route.ts              # Email verification callback (UPDATED)
  /(marketing)
    /academy-info
      page.tsx              # Academy landing page (UPDATED)
```

---

## Environment Variables

Ensure these are set in production:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://www.intimeesolutions.com
```

---

## Supabase Configuration

**Required Settings:**
- Dashboard → Authentication → URL Configuration
  - **Site URL**: `https://www.intimeesolutions.com`
  - **Redirect URLs**: 
    - `https://www.intimeesolutions.com/auth/callback`
    - `http://localhost:3000/auth/callback` (for dev)

**Email Settings:**
- Dashboard → Authentication → Email Auth
  - **Link Expiry**: 24 hours (default, can adjust)
  - **Email Templates**: Customize as needed

---

## Summary

✅ **Two optimized entry flows** - Academy-direct and generic platform
✅ **No redundant role selection** - Students skip selector when coming from Academy
✅ **Email verification fixed** - Proper redirects and error handling
✅ **Better UX** - Contextual branding and streamlined paths
✅ **Scalable architecture** - Easy to add more role-specific flows

**Status:** Ready for deployment and testing
**Next Steps:** Deploy to production and monitor analytics for conversion improvements

---

**Created:** December 2024  
**Last Updated:** December 2024  
**Owned By:** Authentication Team

