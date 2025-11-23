# Database 500 Error Fix Guide

## Problem

Getting "500 Server error" when fetching dashboard statistics.

## Common Causes & Solutions

### 1. Database Connection Issue

**Symptoms:**

- Error: "Database connection failed"
- Error codes: P1000, P1001

**Solution:**

```bash
# Check your .env file has DATABASE_URL
cat .env | grep DATABASE_URL

# Test database connection
npx prisma db pull
```

**Fix:**

- Ensure DATABASE_URL is set correctly in `.env`
- Check if database server is running
- Verify database credentials

### 2. Missing Database Migrations

**Symptoms:**

- Error: "Unknown model" or "does not exist"
- Error code: P2001

**Solution:**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

### 3. Database Tables Don't Exist

**Symptoms:**

- Error: "relation does not exist"
- Tables missing in database

**Solution:**

```bash
# Reset and migrate (WARNING: This will delete all data)
npx prisma migrate reset

# Or just migrate
npx prisma migrate deploy
```

### 4. Prisma Client Not Generated

**Symptoms:**

- Error: "Cannot find module '@prisma/client'"

**Solution:**

```bash
# Generate Prisma client
npx prisma generate

# Reinstall dependencies
npm install
# or
pnpm install
```

## Quick Diagnostic Steps

### Step 1: Check Database Connection

```bash
npx prisma db pull
```

If this fails, your DATABASE_URL is wrong or database is not accessible.

### Step 2: Check Migrations

```bash
npx prisma migrate status
```

If migrations are pending, run:

```bash
npx prisma migrate deploy
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Test API Endpoint

Visit: `http://localhost:3000/api/dashboard/test`

This will show:

- Database connection status
- Authentication status
- User role

## Check Server Logs

Look at your terminal where `pnpm dev` is running for detailed error messages.

Common error patterns:

- `P1001`: Can't reach database server
- `P2001`: Record does not exist
- `P2002`: Unique constraint violation
- `P2003`: Foreign key constraint failed

## Environment Variables

Make sure your `.env` file has:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Still Not Working?

1. **Check Prisma Schema:**

   ```bash
   cat prisma/schema.prisma
   ```

2. **Verify Database:**
   - PostgreSQL: `psql -U username -d dbname`
   - Check if tables exist: `\dt`

3. **Reset Everything:**

   ```bash
   # WARNING: Deletes all data
   npx prisma migrate reset
   npx prisma generate
   ```

4. **Check Network:**
   - Is database server running?
   - Can you connect from terminal?
   - Firewall blocking connection?

## Improved Error Handling

The dashboard stats API now:

- ✅ Catches individual query errors
- ✅ Returns default values (0) if queries fail
- ✅ Provides detailed error messages in development
- ✅ Shows specific Prisma error codes
- ✅ Handles missing tables gracefully

Even if some queries fail, the dashboard will still show default values instead of crashing.
