# Database Setup Guide

## Current Issue

Your database connection is failing. The `DATABASE_URL` in `.env` points to `localhost:51214` which isn't accessible.

## Quick Fix Options

### Option 1: Use Supabase (Free, Recommended)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Project Settings → Database
4. Copy the "Connection string" (URI format)
5. Update `.env`:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

### Option 2: Use Neon (Free)

1. Go to https://neon.tech and create a free account
2. Create a new project
3. Copy the connection string
4. Update `.env` with the connection string

### Option 3: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb eden_avenue`
3. Update `.env`:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/eden_avenue"
   ```

## After Setting Up Database

1. Run migrations:

   ```bash
   pnpm prisma migrate deploy
   ```

2. Restart your dev server:

   ```bash
   pnpm dev
   ```

3. Try registering again at `/auth/register`
