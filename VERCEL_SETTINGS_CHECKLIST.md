# Vercel Settings Checklist for Authentication Issues

## Critical Environment Variables

Check these in **Vercel Dashboard → Settings → Environment Variables**:

### 1. ✅ NEXTAUTH_URL (REQUIRED)

- **Value**: `https://edenavenue.vercel.app` (your exact Vercel URL)
- **Important**: Must match your production URL exactly
- **Check**: Go to Settings → Environment Variables → Verify it's set for Production

### 2. ✅ NEXTAUTH_SECRET (REQUIRED)

- **Value**: A random string (at least 32 characters)
- **Generate**: `openssl rand -base64 32`
- **Check**: Must be set in Production environment

### 3. ✅ DATABASE_URL (REQUIRED)

- **Value**: Your Neon PostgreSQL connection string
- **Format**: `postgresql://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require`
- **Important**: Use the **pooler** URL (has `-pooler` in hostname) for serverless

## Vercel Project Settings to Check

### 1. Redirects & Rewrites

**Location**: Settings → Redirects

**Check**: Make sure there are NO redirects that might interfere:

- No redirects from `/dashboard` to `/auth/login`
- No redirects from `/auth/login` to anywhere else
- NextAuth handles redirects automatically via middleware

### 2. Headers

**Location**: Settings → Headers

**Check**: Should be empty or minimal. NextAuth handles headers automatically.

### 3. Build & Development Settings

**Location**: Settings → General

**Check**:

- Framework Preset: Next.js
- Build Command: (leave empty, uses package.json)
- Output Directory: (leave empty, Next.js default)
- Install Command: (leave empty, uses package.json)

### 4. Environment Variables Scope

**Location**: Settings → Environment Variables

**Check**: Each variable should be set for:

- ✅ Production
- ✅ Preview (optional but recommended)
- ✅ Development (optional)

## Common Issues

### Issue 1: NEXTAUTH_URL Not Set

**Symptom**: Login works but redirects fail, cookies not set
**Fix**: Set `NEXTAUTH_URL=https://edenavenue.vercel.app` in Production

### Issue 2: Wrong NEXTAUTH_URL

**Symptom**: Cookies not being set, redirect loops
**Fix**: Must match your exact Vercel URL (check in Vercel dashboard)

### Issue 3: NEXTAUTH_SECRET Missing

**Symptom**: Sessions not persisting, login fails silently
**Fix**: Generate and set a secret: `openssl rand -base64 32`

### Issue 4: Custom Redirects Interfering

**Symptom**: Redirects not working as expected
**Fix**: Remove any custom redirects from Vercel settings

## Verification Steps

1. **Check Environment Variables**:

   ```bash
   # In Vercel Dashboard, verify all three are set:
   - NEXTAUTH_URL=https://edenavenue.vercel.app
   - NEXTAUTH_SECRET=<your-secret>
   - DATABASE_URL=<your-neon-url>
   ```

2. **Check Function Logs**:
   - Go to Vercel → Deployments → Latest → Functions
   - Look for errors in `/api/auth/[...nextauth]` function

3. **Check Browser Console**:
   - Open browser DevTools → Console
   - Look for NextAuth errors or cookie warnings

4. **Test Cookie Setting**:
   - After login, check Application → Cookies
   - Should see `next-auth.session-token` cookie

## Quick Fix: Redeploy After Changes

After updating environment variables:

1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete
5. Clear browser cache and try again
