# 🚀 GoDaddy Domain + Vercel Deployment Guide

**Your website is READY TO DEPLOY!** Follow these steps to connect your GoDaddy domain to Vercel.

---

## ✅ **CURRENT STATUS:**

- ✅ Website fully built (78 pages)
- ✅ All forms working (connected to database)
- ✅ All links functional (no 404s)
- ✅ Blog, Jobs, Talent pages complete
- ✅ Build passing (`npm run build`)
- ✅ Code pushed to GitHub (`main` branch)
- ⏳ **NEXT:** Connect domain

---

## 📋 **DEPLOYMENT STEPS:**

### **Step 1: Verify Vercel Deployment**

Your GitHub is already connected to Vercel, so every push auto-deploys.

1. Go to [https://vercel.com](https://vercel.com)
2. Find your project: `guidewire-assistant`
3. Click on the latest deployment
4. Verify it shows "Ready" status
5. Click "Visit" to test on the Vercel URL (e.g., `guidewire-assistant.vercel.app`)

**Expected:** Website loads, all pages work, forms submit.

---

### **Step 2: Add Your Domain in Vercel**

1. In Vercel Dashboard → Select your project
2. Go to **Settings** → **Domains**
3. Click **"Add"**
4. Enter your domain: `intimesolutions.com`
5. Click **"Add"**

Vercel will show you the DNS records you need to add to GoDaddy.

---

### **Step 3: Update DNS Records in GoDaddy**

You'll need to add **3 types of records** depending on whether you want:
- `intimesolutions.com` (apex domain)
- `www.intimesolutions.com` (www subdomain)
- `academy.intimesolutions.com` (academy subdomain)

#### **Option A: Main Domain (intimesolutions.com)**

1. Log in to [GoDaddy](https://godaddy.com)
2. Go to **My Products** → **Domains** → **intimesolutions.com**
3. Click **"Manage DNS"**
4. Click **"Add"** and create these records:

**Record 1: A Record (for root domain)**
```
Type: A
Name: @
Value: 76.76.21.21  (Vercel's IP - they'll provide this)
TTL: 600 seconds (default)
```

**Record 2: CNAME for www**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com.
TTL: 600 seconds
```

**Vercel will show you the exact values after you add the domain.**

#### **Option B: Add Academy Subdomain**

For `academy.intimesolutions.com`:

```
Type: CNAME
Name: academy
Value: cname.vercel-dns.com.
TTL: 600 seconds
```

---

### **Step 4: Wait for DNS Propagation**

- DNS changes take **10 minutes to 48 hours** to propagate (usually 10-30 mins).
- Check status at: [https://dnschecker.org](https://dnschecker.org)
- Vercel will automatically issue an SSL certificate once DNS is verified.

---

### **Step 5: Verify SSL Certificate**

1. In Vercel → **Settings** → **Domains**
2. Wait for the certificate status to show **"Valid"**
3. Test your domain:
   - `https://intimesolutions.com` → Should load your website
   - `https://www.intimesolutions.com` → Should redirect to non-www (or vice versa)
   - `https://academy.intimesolutions.com` → Should load academy pages

---

### **Step 6: Configure Domain Redirects (Optional)**

If you want `www.intimesolutions.com` to redirect to `intimesolutions.com` (or vice versa):

1. In Vercel → **Settings** → **Domains**
2. Click the **"..."** menu next to `www.intimesolutions.com`
3. Select **"Redirect to intimesolutions.com"**

---

## 🔧 **TROUBLESHOOTING:**

### **"Domain not verified" in Vercel**
- **Cause:** DNS records not added or not propagated yet.
- **Fix:** Double-check DNS records in GoDaddy. Wait 30 mins and try again.

### **"This site can't be reached" error**
- **Cause:** DNS hasn't propagated yet.
- **Fix:** Wait 1-2 hours. Check [dnschecker.org](https://dnschecker.org).

### **"SSL certificate pending"**
- **Cause:** Vercel is waiting for DNS verification.
- **Fix:** Once DNS propagates, Vercel auto-issues SSL (takes 5-10 mins).

### **404 errors on pages**
- **Cause:** Build or routing issue.
- **Fix:** Check Vercel build logs. Ensure `npm run build` passes locally.

### **Forms not submitting**
- **Cause:** Environment variables missing.
- **Fix:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel → **Settings** → **Environment Variables**.

---

## ✅ **FINAL CHECKS:**

Once deployed, test these critical flows:

1. **Homepage:** 
   - [ ] Loads at `https://intimesolutions.com`
   - [ ] SSL padlock shows (secure)
   
2. **Navigation:**
   - [ ] All menu links work (no 404s)
   - [ ] Resources page loads
   - [ ] Careers pages load
   
3. **Forms:**
   - [ ] Contact form submits → Check Supabase `opportunities` table
   - [ ] Job application submits → Check `candidates` and `applications` tables
   - [ ] Talent inquiry submits → Check `clients` and `opportunities` tables
   
4. **Blog:**
   - [ ] `/resources` page loads
   - [ ] Click on a blog post → Individual post loads
   
5. **Jobs:**
   - [ ] `/careers/open-positions` page loads
   - [ ] Click "Apply Now" → Job detail page loads
   - [ ] Fill form → Application saves to database
   
6. **Talent:**
   - [ ] `/careers/available-talent` page loads
   - [ ] Click "View Full Profile" → Talent detail page loads
   - [ ] Fill form → Inquiry saves to database

---

## 📊 **POST-DEPLOYMENT MONITORING:**

1. **Vercel Analytics:**
   - Go to your project → **Analytics** tab
   - Monitor page views, response times, errors

2. **Supabase Dashboard:**
   - Check for incoming data from forms
   - Monitor `candidates`, `applications`, `opportunities`, `clients` tables

3. **Google Search Console (Optional):**
   - Add your domain at [search.google.com/search-console](https://search.google.com/search-console)
   - Submit sitemap: `https://intimesolutions.com/sitemap.xml`

---

## 🎉 **YOU'RE DONE!**

Your website is now live at:
- **Main Site:** https://intimesolutions.com
- **Academy:** https://academy.intimesolutions.com (if configured)

**Next Steps:**
1. Test all forms and pages
2. Share the website link with your team
3. Start driving traffic!
4. Monitor Supabase for leads coming in

---

**Need help?** Check Vercel logs if anything fails, or re-run the build locally to debug.

**Version:** 1.0  
**Last Updated:** $(date +%Y-%m-%d)

