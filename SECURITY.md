# Security Guidelines

This document outlines security measures, best practices, and incident response procedures for the Guidewire Training Platform.

---

## 🔒 Security Measures Implemented

### 1. Authentication & Authorization

✅ **Supabase Server-Side Auth**
- Session management via secure cookies
- No client-side token exposure
- Automatic session refresh

✅ **Row Level Security (RLS)**
- All database tables protected
- Users can only access their own data
- Admin functions use `SECURITY DEFINER` safely

✅ **Role-Based Access Control**
- User roles: `user`, `admin`
- Admin endpoints protected with role checks
- Bootstrap key for initial admin setup

### 2. Input Validation

✅ **Zod Schema Validation**
- All API inputs validated
- UUID validation for IDs
- String length limits enforced
- Email format validation

✅ **SQL Injection Prevention**
- Supabase parameterized queries
- No raw SQL from user input
- RPC functions properly scoped

### 3. Rate Limiting

✅ **AI Endpoint Limits**
- 50 mentor messages per user per day
- Token usage tracking
- Rate limit headers in responses

⚠️ **Missing:** Auth endpoint rate limiting (TODO)

### 4. Error Handling

✅ **React Error Boundaries**
- Dashboard layout protected
- AI Mentor component protected
- Interview Simulator protected
- User-friendly fallback UI

✅ **Secure Error Messages**
- No stack traces in production
- User-friendly messages only
- Detailed logs server-side

### 5. API Security

✅ **Environment Variables**
- API keys never exposed to client
- Service role key server-side only
- Proper .env.example template

✅ **CORS & Headers**
- Next.js default security headers
- Proper origin validation

---

## 🔐 Admin Setup Security

### Bootstrap Process

For **initial setup only**, use a bootstrap key to create the first admin user.

#### Step 1: Generate Bootstrap Key

```bash
# Generate a secure random key
openssl rand -hex 32
```

#### Step 2: Add to Environment

```bash
# .env.local
SETUP_BOOTSTRAP_KEY=your_generated_key_here
```

#### Step 3: Add to Vercel

```bash
# Using Vercel CLI
vercel env add SETUP_BOOTSTRAP_KEY
```

Or in Vercel Dashboard:
- Go to Project → Settings → Environment Variables
- Add `SETUP_BOOTSTRAP_KEY` (production + preview)

#### Step 4: Use Bootstrap Key

When calling `/api/admin/setup`:

```json
{
  "action": "storage-bucket",
  "bootstrapKey": "your_generated_key_here"
}
```

#### Step 5: Create First Admin User

**Option A: Direct SQL**

```sql
-- In Supabase SQL Editor
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

**Option B: Service Role API**

```typescript
// Use Supabase service role client
const supabase = createClient(url, serviceRoleKey);
await supabase
  .from('user_profiles')
  .update({ role: 'admin' })
  .eq('email', 'your-email@example.com');
```

#### Step 6: Remove Bootstrap Key

Once you have an admin user:

```bash
# Remove from .env.local
# Remove from Vercel environment variables
# Redeploy to apply changes
```

---

## 🚨 Removed Security Risks

### ❌ Debug Endpoint (REMOVED)

**File:** `app/api/debug/env/route.ts`

**Risk:** Information disclosure - exposed environment variable status

**Action:** Deleted entirely

**Alternative:** Use server logs or Vercel dashboard to check environment variables

### ✅ Admin Endpoint (FIXED)

**File:** `app/api/admin/setup/route.ts`

**Previous Risk:** Any authenticated user could run admin setup

**Fix:** 
- Admin role check enforced
- Bootstrap key option for initial setup
- Comprehensive logging

---

## 🔍 Security Checklist

### Production Deployment

- [ ] All environment variables set in Vercel
- [ ] `SETUP_BOOTSTRAP_KEY` removed after initial setup
- [ ] At least one admin user created
- [ ] RLS policies verified in Supabase
- [ ] Rate limiting tested
- [ ] Error boundaries tested
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Security headers configured

### Ongoing

- [ ] Review admin user list monthly
- [ ] Audit API usage and rate limits
- [ ] Monitor error logs for anomalies
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Review Supabase audit logs

---

## 🛡️ Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use `.env.local` (git-ignored)
   - Never hardcode API keys
   - Use environment variables

2. **Validate all inputs**
   - Use Zod schemas
   - Validate on both client and server
   - Sanitize user-generated content

3. **Follow principle of least privilege**
   - Only request permissions needed
   - Use service role sparingly
   - Prefer RLS over admin checks

4. **Log securely**
   - Don't log sensitive data (passwords, keys)
   - Log suspicious activity
   - Use structured logging

### For Admins

1. **Protect admin accounts**
   - Use strong passwords
   - Enable MFA on Supabase account
   - Limit admin users to minimum needed

2. **Monitor regularly**
   - Check Vercel logs weekly
   - Review Supabase audit logs
   - Monitor AI token usage

3. **Respond to incidents**
   - Have escalation plan
   - Document incidents
   - Update security measures

---

## 🐛 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. **DO** email security@yourdomain.com (replace with actual)
3. **INCLUDE:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We aim to respond within 24 hours and patch critical issues within 48 hours.

---

## 📚 Security Resources

### External Tools

- **Supabase Security:** https://supabase.com/docs/guides/auth/row-level-security
- **Next.js Security:** https://nextjs.org/docs/app/building-your-application/configuring/security
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/

### Monitoring

- **Vercel Logs:** Monitor API errors and suspicious activity
- **Supabase Logs:** Track database access patterns
- **OpenAI Dashboard:** Monitor token usage

### Updates

- Run `npm audit` regularly
- Check Dependabot alerts on GitHub
- Update Next.js and Supabase clients monthly

---

## 🔄 Security Roadmap

### Short-term (Next 30 days)

- [ ] Add rate limiting middleware for auth endpoints
- [ ] Implement CSRF protection
- [ ] Add API usage analytics
- [ ] Set up error tracking (Sentry)

### Medium-term (Next 90 days)

- [ ] Add automated security testing to CI/CD
- [ ] Implement content security policy (CSP)
- [ ] Add API request logging
- [ ] Regular security audits

### Long-term

- [ ] Penetration testing
- [ ] SOC 2 compliance (if needed)
- [ ] Bug bounty program
- [ ] Security certification

---

**Last Updated:** January 2025  
**Next Review:** February 2025

For questions or concerns, contact the security team.

