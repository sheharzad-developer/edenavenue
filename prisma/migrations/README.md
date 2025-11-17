# Migrations

This directory contains Prisma migrations.

Since you're using `prisma db push` for development, you can create migrations for production using:

```bash
# With production DATABASE_URL set
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

Or create a baseline migration:

```bash
# Mark current database state as migrated
npx prisma migrate resolve --applied 0_init
```

