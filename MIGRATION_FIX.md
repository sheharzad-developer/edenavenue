# Fix Database Migration Issue

## Quick Fix: Run Migration Manually in Neon

1. Go to https://console.neon.tech
2. Select your project
3. Click on **SQL Editor**
4. Run this SQL command:

```sql
ALTER TABLE "MaintenanceRequest" ADD COLUMN "houseNumber" TEXT;
```

5. Click **Run** or press Ctrl+Enter
6. Verify the column was added (you should see a success message)

## Verify Migration

After running the SQL, try creating a maintenance request again. It should work now.

## Why This Happened

The migration file exists in the codebase, but Vercel's build process may not have applied it yet. Running it manually ensures the database schema is up to date immediately.

## Future Migrations

For future migrations, they should run automatically during Vercel builds (configured in `vercel.json`). If they don't, you can always run them manually in Neon's SQL Editor.
