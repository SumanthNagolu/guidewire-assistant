# EPIC 1: Authentication & Access Control

**Epic ID**: ADMIN-EPIC-01  
**Epic Name**: Authentication & Access Control  
**Priority**: P0 (Critical - Must be first)  
**Estimated Stories**: 12  
**Estimated Effort**: 3-4 days  
**Command**: `/admin-01-authentication`

---

## Epic Overview

### Goal
Implement secure authentication and authorization system for admin portal with role-based access control, session management, and proper redirects.

### Business Value
- Secure admin portal from unauthorized access
- Prevent non-admin users from accessing sensitive operations
- Track admin sessions for security compliance
- Provide seamless login experience

### Technical Scope
- Admin login page with proper validation
- Authentication guards on all admin routes
- Role verification middleware
- Session management
- Redirect logic for authenticated/unauthenticated users
- Error handling for auth failures

### Dependencies
- Supabase Auth configured
- `user_profiles` table with `role` column
- Admin layout structure exists

---

## User Stories

### Story AUTH-001: Admin Login Page UI

**As a**: System administrator  
**I want**: A dedicated login page for admin access  
**So that**: I can securely authenticate before accessing admin portal

#### Acceptance Criteria
- [ ] Login page renders at `/admin/login`
- [ ] Page has email input field (type=email, required)
- [ ] Page has password input field (type=password, required)
- [ ] Sign In button present and properly styled
- [ ] Form has proper validation (email format, min password length)
- [ ] Loading state shows during authentication
- [ ] Error messages display for invalid credentials
- [ ] Success redirects to `/admin` dashboard
- [ ] Page uses admin branding (purple gradient theme)
- [ ] Mobile responsive layout

#### Technical Implementation

**Files to Create**:
```
app/admin/login/page.tsx
components/admin/auth/AdminLoginForm.tsx
```

**Component Structure**:
```typescript
// app/admin/login/page.tsx
export default function AdminLoginPage() {
  // Check if already authenticated -> redirect to dashboard
  // Render AdminLoginForm
}

// components/admin/auth/AdminLoginForm.tsx
export default function AdminLoginForm() {
  // Form state management
  // Input validation
  // Supabase auth.signInWithPassword()
  // Error handling
  // Loading states
}
```

**Styling Requirements**:
- Use admin color scheme (purple #2B1F52)
- Card-based layout, centered on page
- Proper spacing and typography
- Focus states on inputs
- Disabled state on button during loading

#### Testing Checklist
- [ ] Page loads without errors
- [ ] Form validates empty fields
- [ ] Form validates invalid email format
- [ ] Successful login redirects correctly
- [ ] Failed login shows error message
- [ ] Loading state prevents double submission
- [ ] Works on mobile devices

---

### Story AUTH-002: Admin Auth Guard Middleware

**As a**: Platform security admin  
**I want**: Automatic protection on all admin routes  
**So that**: Non-admin users cannot access admin features

#### Acceptance Criteria
- [ ] Middleware checks authentication on `/admin/*` routes
- [ ] Unauthenticated users redirect to `/admin/login`
- [ ] Authenticated non-admin users redirect to `/academy` or appropriate portal
- [ ] Admin users allowed to access admin routes
- [ ] Redirects preserve original destination (redirectTo param)
- [ ] Session verification happens server-side
- [ ] Performance: No noticeable delay on protected pages

#### Technical Implementation

**Files to Modify**:
```
middleware.ts
lib/auth/admin-guards.ts (create)
```

**Middleware Logic**:
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Admin routes protection
  if (path.startsWith('/admin')) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(
        new URL(`/admin/login?redirectTo=${path}`, request.url)
      );
    }
    
    // Verify admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/academy', request.url));
    }
  }
  
  return NextResponse.next();
}
```

#### Testing Checklist
- [ ] Non-logged-in access to /admin redirects to login
- [ ] Student user cannot access /admin
- [ ] Recruiter user cannot access /admin
- [ ] Admin user can access /admin
- [ ] redirectTo parameter works correctly
- [ ] No infinite redirect loops

---

### Story AUTH-003: Admin Layout Auth Check

**As a**: Developer  
**I want**: Server-side auth verification in admin layout  
**So that**: Additional security layer protects all admin pages

#### Acceptance Criteria
- [ ] Admin layout verifies authentication on server
- [ ] Admin layout checks user role
- [ ] Non-admin users redirected before page render
- [ ] User info passed to AdminHeader component
- [ ] Profile data available to all admin pages
- [ ] No flash of admin content for unauthorized users

#### Technical Implementation

**Files to Modify**:
```
app/admin/layout.tsx (enhance existing)
```

**Enhancement**:
```typescript
export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/admin/login');
  }
  
  // Role verification
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    redirect('/academy');
  }
  
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader user={user} profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Layout renders for admin users
- [ ] Layout redirects non-admin users
- [ ] User data passed to header correctly
- [ ] No TypeScript errors
- [ ] Server-side rendering works

---

### Story AUTH-004: Session Persistence

**As a**: Admin user  
**I want**: My session to persist across page refreshes  
**So that**: I don't have to log in repeatedly

#### Acceptance Criteria
- [ ] Session persists across browser refresh
- [ ] Session persists across tab close/reopen (within expiry)
- [ ] Session expires after configured timeout
- [ ] Expired session redirects to login
- [ ] Session renewal on activity
- [ ] Secure cookie storage

#### Technical Implementation

**Files to Modify**:
```
lib/supabase/middleware.ts
lib/supabase/server.ts
```

**Session Config**:
- Use Supabase session management
- Set appropriate expiry (24 hours default)
- Implement sliding window renewal
- Secure httpOnly cookies

#### Testing Checklist
- [ ] Refresh page maintains session
- [ ] Close and reopen tab maintains session
- [ ] Session expires after timeout
- [ ] Activity extends session
- [ ] Logout clears session completely

---

### Story AUTH-005: Logout Functionality

**As a**: Admin user  
**I want**: Ability to securely log out  
**So that**: My session is terminated when I'm done

#### Acceptance Criteria
- [ ] Logout button in sidebar
- [ ] Click triggers sign out
- [ ] Session cleared from cookies
- [ ] Redirect to homepage or login page
- [ ] Confirmation dialog (optional)
- [ ] All client-side state cleared

#### Technical Implementation

**Files to Modify**:
```
components/admin/AdminSidebar.tsx (enhance existing)
```

**Logout Handler**:
```typescript
const handleSignOut = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  
  // Clear any client state
  localStorage.clear();
  sessionStorage.clear();
  
  // Redirect
  window.location.href = '/';
};
```

#### Testing Checklist
- [ ] Logout button visible in sidebar
- [ ] Click logs out user
- [ ] Redirects to homepage
- [ ] Cannot access admin after logout
- [ ] Subsequent login works correctly

---

### Story AUTH-006: Login Error Handling

**As a**: Admin user  
**I want**: Clear error messages when login fails  
**So that**: I understand what went wrong and can fix it

#### Acceptance Criteria
- [ ] Invalid credentials show: "Invalid email or password"
- [ ] Empty email shows: "Email is required"
- [ ] Empty password shows: "Password is required"
- [ ] Invalid email format shows: "Please enter a valid email"
- [ ] Network errors show: "Connection failed. Please try again."
- [ ] Locked account shows: "Account locked. Contact support."
- [ ] Error messages styled in red
- [ ] Errors clear when user starts typing
- [ ] Generic message for security (don't reveal if email exists)

#### Technical Implementation

**Error Handling Logic**:
```typescript
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    if (error.message.includes('Invalid')) {
      setError('Invalid email or password');
    } else if (error.message.includes('network')) {
      setError('Connection failed. Please try again.');
    } else {
      setError('Authentication failed. Please try again.');
    }
    return;
  }
  
  // Success - redirect
  router.push('/admin');
} catch (err) {
  setError('Unexpected error. Please try again.');
}
```

#### Testing Checklist
- [ ] Wrong password shows correct error
- [ ] Wrong email shows correct error
- [ ] Empty fields show validation errors
- [ ] Network failure handled gracefully
- [ ] Error messages are user-friendly

---

### Story AUTH-007: Login Loading States

**As a**: Admin user  
**I want**: Visual feedback during login  
**So that**: I know the system is processing my request

#### Acceptance Criteria
- [ ] Sign In button shows "Signing in..." text when loading
- [ ] Sign In button shows spinner icon when loading
- [ ] Sign In button disabled during loading
- [ ] Input fields disabled during loading
- [ ] Loading prevents form resubmission
- [ ] Loading state clears on success or error
- [ ] Maximum loading time: 5 seconds before timeout

#### Technical Implementation

**Loading State Management**:
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  
  try {
    // Auth logic
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

**Button State**:
```tsx
<Button 
  type="submit" 
  disabled={isLoading}
  className="w-full"
>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Signing in...
    </>
  ) : (
    'Sign In'
  )}
</Button>
```

#### Testing Checklist
- [ ] Loading state appears on click
- [ ] Button disabled during loading
- [ ] Spinner animates correctly
- [ ] State clears after completion
- [ ] Double-click prevented

---

### Story AUTH-008: Redirect After Login

**As a**: Admin user  
**I want**: Automatic redirect to intended page after login  
**So that**: I land on the page I originally wanted

#### Acceptance Criteria
- [ ] Accessing `/admin/blog` when logged out redirects to login
- [ ] Login preserves destination: `/admin/login?redirectTo=/admin/blog`
- [ ] After successful login, redirect to `/admin/blog`
- [ ] If no redirectTo param, default to `/admin` dashboard
- [ ] Invalid redirectTo values ignored (security)
- [ ] Redirect works with nested paths
- [ ] Query params preserved in redirect

#### Technical Implementation

**Login Page Logic**:
```typescript
const searchParams = useSearchParams();
const redirectTo = searchParams.get('redirectTo') || '/admin';

const handleLogin = async () => {
  // Auth logic
  
  if (success) {
    // Validate redirectTo is safe
    const safeRedirect = redirectTo.startsWith('/admin') 
      ? redirectTo 
      : '/admin';
    
    router.push(safeRedirect);
  }
};
```

#### Testing Checklist
- [ ] Direct access to /admin/blog redirects to login
- [ ] Login redirects back to /admin/blog
- [ ] Default redirect to /admin works
- [ ] Malicious redirectTo values rejected
- [ ] Works with query params

---

### Story AUTH-009: Already Authenticated Redirect

**As a**: Admin user who is already logged in  
**I want**: Automatic redirect from login page  
**So that**: I don't see login page unnecessarily

#### Acceptance Criteria
- [ ] Accessing `/admin/login` when logged in redirects to dashboard
- [ ] Redirect happens server-side (no flash of login page)
- [ ] Works for direct URL access
- [ ] Works for link clicks
- [ ] Proper HTTP redirect status code (302)

#### Technical Implementation

**Login Page Server Component**:
```typescript
export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Check if admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role === 'admin') {
      redirect('/admin');
    }
  }
  
  return <AdminLoginForm />;
}
```

#### Testing Checklist
- [ ] Logged-in admin redirected from login page
- [ ] No flash of login form
- [ ] Redirect fast (< 200ms)
- [ ] Works on page refresh

---

### Story AUTH-010: Non-Admin User Handling

**As a**: Platform security  
**I want**: Non-admin users properly routed to their portals  
**So that**: Users see appropriate interfaces for their roles

#### Acceptance Criteria
- [ ] Student user accessing /admin redirects to /academy
- [ ] Recruiter user accessing /admin redirects to /employee/dashboard
- [ ] Sales user accessing /admin redirects to /employee/dashboard
- [ ] Error message shown: "Admin access required"
- [ ] Toast notification appears
- [ ] Redirect happens server-side
- [ ] Audit log entry created for attempted access

#### Technical Implementation

**Role-Based Redirect**:
```typescript
const redirectByRole = (role: string) => {
  const roleRedirects = {
    'student': '/academy',
    'recruiter': '/employee/dashboard',
    'sales': '/employee/dashboard',
    'account_manager': '/employee/dashboard',
    'operations': '/employee/dashboard',
    'employee': '/employee/dashboard',
  };
  
  return roleRedirects[role] || '/';
};

// In layout/middleware
if (profile?.role !== 'admin') {
  const destination = redirectByRole(profile.role);
  redirect(destination);
}
```

#### Testing Checklist
- [ ] Each role redirects correctly
- [ ] Error message appears
- [ ] Toast notification works
- [ ] Audit log created
- [ ] No access to admin for non-admins

---

### Story AUTH-011: Login Form Validation

**As a**: Admin user  
**I want**: Real-time form validation  
**So that**: I catch input errors before submission

#### Acceptance Criteria
- [ ] Email field validates format on blur
- [ ] Password field validates minimum length (8 chars)
- [ ] Submit button disabled when form invalid
- [ ] Error messages appear below fields
- [ ] Error messages styled in red
- [ ] Validation errors clear on input change
- [ ] Form accepts valid inputs
- [ ] HTML5 validation as fallback

#### Technical Implementation

**Validation Schema**:
```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;
```

**Form Validation**:
```typescript
const [errors, setErrors] = useState<Partial<LoginForm>>({});

const validateField = (name: keyof LoginForm, value: string) => {
  try {
    loginSchema.shape[name].parse(value);
    setErrors(prev => ({ ...prev, [name]: undefined }));
  } catch (err) {
    if (err instanceof z.ZodError) {
      setErrors(prev => ({ ...prev, [name]: err.errors[0].message }));
    }
  }
};
```

#### Testing Checklist
- [ ] Email validation works
- [ ] Password validation works
- [ ] Errors display correctly
- [ ] Errors clear on change
- [ ] Submit disabled when invalid
- [ ] Submit enabled when valid

---

### Story AUTH-012: Session Timeout Handling

**As a**: Admin user  
**I want**: Automatic logout after inactivity  
**So that**: Security is maintained when I step away

#### Acceptance Criteria
- [ ] Session expires after 24 hours of inactivity
- [ ] Warning shown 5 minutes before expiry
- [ ] Option to extend session
- [ ] Expired session redirects to login
- [ ] In-progress work warned before redirect
- [ ] Session activity tracked
- [ ] Configurable timeout duration

#### Technical Implementation

**Session Monitor Hook**:
```typescript
// hooks/useSessionTimeout.ts
export function useSessionTimeout(timeoutMinutes = 1440) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Show warning
        showSessionWarning();
      }, (timeoutMinutes - 5) * 60 * 1000);
    };
    
    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout);
    });
    
    resetTimeout();
    
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [timeoutMinutes]);
}
```

#### Testing Checklist
- [ ] Warning appears before expiry
- [ ] Extend option works
- [ ] Auto-logout on timeout
- [ ] Activity resets timer
- [ ] Works across tabs

---

## Epic Completion Criteria

### Functional Requirements
- [ ] All 12 stories implemented
- [ ] Admin login working end-to-end
- [ ] Auth guards protecting all routes
- [ ] Session management functional
- [ ] Error handling comprehensive

### Technical Requirements
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation complete

### Quality Gates
- [ ] Accessibility: Keyboard navigation works
- [ ] Security: No auth bypasses possible
- [ ] Performance: Login < 2 seconds
- [ ] UX: Clear error messages
- [ ] Mobile: Responsive on all devices

---

## Testing Strategy

### Unit Tests
```typescript
// __tests__/admin/auth/AdminLoginForm.test.tsx
describe('AdminLoginForm', () => {
  it('validates email format', () => {});
  it('validates password length', () => {});
  it('shows loading state during submission', () => {});
  it('displays error messages correctly', () => {});
});
```

### Integration Tests
```typescript
// __tests__/admin/auth/auth-flow.test.tsx
describe('Admin Authentication Flow', () => {
  it('logs in with valid credentials', () => {});
  it('redirects non-admin users', () => {});
  it('handles session expiry', () => {});
});
```

### E2E Tests
```typescript
// e2e/admin-login.spec.ts
test('complete admin login flow', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
  
  await page.fill('[name="email"]', 'admin@test.com');
  await page.fill('[name="password"]', 'test12345');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/admin');
});
```

---

## Dependencies

### Database Requirements
- `user_profiles.role` column exists
- Role values include 'admin'
- Test admin user exists

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Package Dependencies
- `@supabase/supabase-js`
- `zod` (validation)
- `lucide-react` (icons)

---

## Rollout Plan

1. **Story AUTH-001**: Create login page UI
2. **Story AUTH-011**: Add form validation
3. **Story AUTH-006**: Implement error handling
4. **Story AUTH-007**: Add loading states
5. **Story AUTH-002**: Implement auth guards
6. **Story AUTH-003**: Enhance layout auth check
7. **Story AUTH-008**: Add redirect logic
8. **Story AUTH-009**: Handle already authenticated
9. **Story AUTH-010**: Non-admin user handling
10. **Story AUTH-005**: Implement logout
11. **Story AUTH-004**: Session persistence
12. **Story AUTH-012**: Session timeout handling

---

## Success Metrics

- Login success rate: > 99%
- Login time (p95): < 2 seconds
- Auth bounce rate: < 1%
- Session hijacking attempts: 0
- Password brute-force protection: Active

---

**Status**: Ready for implementation  
**Next Epic**: Epic 2 - Dashboard (after AUTH complete)

