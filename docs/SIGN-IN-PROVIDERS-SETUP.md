# 🔐 Sign-In Providers Setup Guide

## Overview

This guide shows you how to configure authentication providers (Google, GitHub, etc.) for your Supabase project.

---

## 🎯 Step 1: Navigate to Providers Settings

1. Go to Supabase Dashboard
2. **Authentication** → **Sign In / Providers**
3. Or direct link: `https://supabase.com/dashboard/project/jbusreaeuxzpjszuhvre/auth/providers`

---

## 📧 Step 2: Configure Email/Password (Already Done ✅)

**Current Status:**
- ✅ "Confirm email" is **ON** (enabled)
- ✅ "Allow new users to sign up" is **ON**

**This is correct!** Your email/password signup is already configured.

---

## 🔵 Step 3: Set Up Google Sign-In

### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing:
   - Project name: `InTime eSolutions`
   - Click **Create**

3. Enable Google+ API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. Create OAuth 2.0 Credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - If prompted, configure OAuth consent screen first:
     - User Type: **External**
     - App name: `InTime eSolutions Academy`
     - User support email: `admin@intimesolutions.com`
     - Developer contact: `admin@intimesolutions.com`
     - Click **Save and Continue**
     - Scopes: Click **Add or Remove Scopes** → Select:
       - `userinfo.email`
       - `userinfo.profile`
       - `openid`
     - Click **Save and Continue**
     - Test users: Add your email (optional for testing)
     - Click **Save and Continue**

5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `InTime eSolutions Web`
   - Authorized JavaScript origins:
     ```
     https://jbusreaeuxzpjszuhvre.supabase.co
     http://localhost:3000
     https://intimesolutions.com
     ```
   - Authorized redirect URIs:
     ```
     https://jbusreaeuxzpjszuhvre.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     https://intimesolutions.com/auth/callback
     ```
   - Click **Create**
   - **Copy the Client ID and Client Secret** (you'll need these!)

### 3.2 Configure Google in Supabase

1. In Supabase Dashboard, go to **Authentication** → **Sign In / Providers**
2. Find **Google** in the Auth Providers list
3. Click on **Google** to open settings

4. Fill in the form:

   **Enable Sign in with Google:**
   - Toggle **ON** (green)

   **Client IDs:**
   ```
   [Paste your Google Client ID from Step 3.1]
   ```
   Example: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

   **Client Secret (for OAuth):**
   ```
   [Paste your Google Client Secret from Step 3.1]
   ```
   Example: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

   **Skip nonce checks:**
   - Leave **OFF** (unless you have specific iOS requirements)

   **Allow users without an email:**
   - Leave **OFF** (you need email for user accounts)

5. Click **Save**

### 3.3 Test Google Sign-In

1. Go to your login page: `/login`
2. Look for **"Sign in with Google"** button
3. Click it
4. Complete Google OAuth flow
5. Should redirect back to your app

---

## 🐙 Step 4: Set Up GitHub Sign-In (Optional)

### 4.1 Create GitHub OAuth App

1. Go to GitHub → **Settings** → **Developer settings**
2. Click **OAuth Apps** → **New OAuth App**

3. Fill in the form:

   **Application name:**
   ```
   InTime eSolutions Academy
   ```

   **Homepage URL:**
   ```
   https://intimesolutions.com
   ```

   **Authorization callback URL:**
   ```
   https://jbusreaeuxzpjszuhvre.supabase.co/auth/v1/callback
   ```

4. Click **Register application**
5. **Copy Client ID and generate Client Secret**
6. Save both (you'll need them!)

### 4.2 Configure GitHub in Supabase

1. In Supabase Dashboard, go to **Authentication** → **Sign In / Providers**
2. Find **GitHub** in the Auth Providers list
3. Click on **GitHub** to open settings

4. Fill in:

   **Enable Sign in with GitHub:**
   - Toggle **ON**

   **Client ID:**
   ```
   [Paste your GitHub Client ID]
   ```

   **Client Secret:**
   ```
   [Paste your GitHub Client Secret]
   ```

5. Click **Save**

---

## 🔵 Step 5: Set Up Microsoft/Azure AD (Optional)

### 5.1 Register App in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com/)
2. **Azure Active Directory** → **App registrations** → **New registration**
3. Name: `InTime eSolutions Academy`
4. Supported account types: **Accounts in any organizational directory**
5. Redirect URI: **Web** → `https://jbusreaeuxzpjszuhvre.supabase.co/auth/v1/callback`
6. Click **Register**
7. **Copy Application (client) ID**
8. Go to **Certificates & secrets** → **New client secret**
9. **Copy the secret value** (only shown once!)

### 5.2 Configure Microsoft in Supabase

1. In Supabase Dashboard → **Authentication** → **Sign In / Providers**
2. Find **Microsoft** → Click to open settings
3. Enable and fill in Client ID and Secret
4. Click **Save**

---

## 📱 Step 6: Set Up Apple Sign-In (Optional)

### 6.1 Create Apple Service ID

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Click **+** → **Services IDs** → **Continue**
4. Description: `InTime eSolutions Academy`
5. Identifier: `com.intimesolutions.academy`
6. Enable **Sign in with Apple**
7. Configure:
   - Primary App ID: Select your app
   - Website URLs:
     - Domains: `intimesolutions.com`
     - Return URLs: `https://jbusreaeuxzpjszuhvre.supabase.co/auth/v1/callback`
8. Click **Continue** → **Register**

### 6.2 Create Apple Key

1. **Keys** → **+** → Name: `InTime eSolutions Sign In`
2. Enable **Sign in with Apple**
3. Click **Configure** → Select your Primary App ID
4. Click **Save** → **Continue** → **Register**
5. **Download the key file** (.p8)
6. **Copy Key ID** and **Team ID**

### 6.3 Configure Apple in Supabase

1. In Supabase Dashboard → **Authentication** → **Sign In / Providers**
2. Find **Apple** → Click to open settings
3. Enable and fill in:
   - Services ID
   - Secret Key (upload .p8 file)
   - Key ID
   - Team ID
4. Click **Save**

---

## ⚙️ Step 7: Configure Provider Settings

### 7.1 User Signups Settings

**Current Settings (Recommended):**
- ✅ **Allow new users to sign up:** ON
- ✅ **Confirm email:** ON
- ⚪ **Allow manual linking:** OFF (unless needed)
- ⚪ **Allow anonymous sign-ins:** OFF (unless needed)

**Keep these as-is** unless you have specific requirements.

### 7.2 Provider-Specific Settings

For each provider, you can configure:

- **Enable/Disable:** Toggle provider on/off
- **Client ID:** Your OAuth client ID
- **Client Secret:** Your OAuth client secret
- **Scopes:** What permissions to request (usually default is fine)
- **Additional settings:** Provider-specific options

---

## 🧪 Step 8: Test All Providers

### Test Checklist

- [ ] Email/Password signup works
- [ ] Email/Password login works
- [ ] Google sign-in works
- [ ] GitHub sign-in works (if enabled)
- [ ] Microsoft sign-in works (if enabled)
- [ ] Apple sign-in works (if enabled)
- [ ] Users can link accounts (if enabled)
- [ ] Error handling works (invalid credentials, etc.)

---

## 🔒 Step 9: Security Best Practices

### 9.1 OAuth Security

1. **Never expose Client Secrets** in client-side code
2. **Use environment variables** for secrets
3. **Rotate secrets regularly** (every 90 days)
4. **Monitor OAuth usage** in provider dashboards
5. **Set up rate limiting** in Supabase

### 9.2 Redirect URLs

**Always include:**
- Production URL: `https://intimesolutions.com/auth/callback`
- Development URL: `http://localhost:3000/auth/callback`
- Supabase callback: `https://jbusreaeuxzpjszuhvre.supabase.co/auth/v1/callback`

**Never include:**
- Unauthorized domains
- HTTP URLs in production (use HTTPS)

---

## 🐛 Troubleshooting

### "Redirect URI mismatch" Error

**Problem:** OAuth redirect doesn't match registered URL

**Solution:**
1. Check redirect URL in Supabase matches exactly
2. Check OAuth provider settings
3. Ensure no trailing slashes
4. Use exact URL format (http vs https)

### "Invalid client" Error

**Problem:** Client ID or Secret is wrong

**Solution:**
1. Double-check Client ID and Secret
2. Ensure no extra spaces when copying
3. Regenerate secret if needed
4. Verify provider app is active

### Users Can't Sign Up

**Problem:** Signup disabled or email confirmation blocking

**Solution:**
1. Check "Allow new users to sign up" is ON
2. Check "Confirm email" setting
3. For OAuth providers, email is usually auto-confirmed
4. Check user signup logs in Supabase

---

## 📋 Provider Setup Checklist

### Google
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created
- [ ] Redirect URIs added
- [ ] Client ID added to Supabase
- [ ] Client Secret added to Supabase
- [ ] Google provider enabled
- [ ] Tested sign-in

### GitHub
- [ ] GitHub OAuth app created
- [ ] Callback URL configured
- [ ] Client ID added to Supabase
- [ ] Client Secret added to Supabase
- [ ] GitHub provider enabled
- [ ] Tested sign-in

### Microsoft
- [ ] Azure app registered
- [ ] Redirect URI configured
- [ ] Client ID added to Supabase
- [ ] Client Secret added to Supabase
- [ ] Microsoft provider enabled
- [ ] Tested sign-in

### Apple
- [ ] Apple Developer account
- [ ] Service ID created
- [ ] Key created and downloaded
- [ ] Service ID added to Supabase
- [ ] Key uploaded to Supabase
- [ ] Key ID and Team ID added
- [ ] Apple provider enabled
- [ ] Tested sign-in

---

## 📚 Additional Resources

- [Supabase Auth Providers Docs](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Setup](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Microsoft OAuth Setup](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

---

## 💡 Pro Tips

1. **Start with Google** - Easiest to set up and most popular
2. **Test in incognito mode** - Avoids cached sessions
3. **Monitor OAuth usage** - Check provider dashboards regularly
4. **Set up error handling** - Handle OAuth failures gracefully
5. **Document your setup** - Keep track of Client IDs and secrets securely

---

**Once providers are configured, users can sign in with their preferred method!** 🎉

