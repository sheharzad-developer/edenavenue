# Vercel Deployment Setup

## Required Environment Variables

You need to set these environment variables in your Vercel project settings:

### 1. DATABASE_URL

Your Neon PostgreSQL connection string:

```
postgresql://neondb_owner:npg_DtEyNTIFH98J@ep-gentle-glitter-ah6pcg6z-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. NEXTAUTH_SECRET

A random secret string for NextAuth session encryption. Generate one with:

```bash
openssl rand -base64 32
```

Or use any long random string.

### 3. NEXTAUTH_URL (Optional but recommended)

Your Vercel deployment URL:

```
https://your-app-name.vercel.app
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

   Repeat for `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

5. After adding variables, **redeploy** your project:
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Click **Redeploy**

## Run Database Migrations on Vercel

After deployment, you need to run migrations. You can do this by:

1. **Option 1: Add a build script** (Recommended)
   Add to `vercel.json`:

   ```json
   {
     "buildCommand": "prisma generate && prisma migrate deploy && next build"
   }
   ```

2. **Option 2: Use Vercel CLI**

   ```bash
   vercel env pull .env.local
   pnpm prisma migrate deploy
   ```

3. **Option 3: Use Neon Dashboard**
   Run the migration SQL directly in Neon's SQL editor

## Verify Deployment

After redeploying:

1. Check the deployment logs for any errors
2. Visit your Vercel URL
3. Try registering a new account
4. Check Vercel function logs if there are issues
