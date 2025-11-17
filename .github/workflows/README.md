# GitHub Actions Workflows

This directory contains CI/CD workflows for the project.

## Workflows

### `ci.yml`

Runs on every push and pull request to `main` and `develop` branches:

- Linting (ESLint)
- Type checking (TypeScript)
- Prisma schema validation
- Code formatting check (Prettier)

### `pr-check.yml`

Runs on pull requests to `main` and `develop`:

- Same checks as CI workflow
- Ensures code quality before merging

## Setup

1. Make sure your repository has the `DATABASE_URL` secret set (optional, uses dummy URL if not set)
2. Workflows will automatically run on push/PR

## Local Testing

You can run the same checks locally:

```bash
pnpm lint          # Run ESLint
pnpm typecheck     # Type check
pnpm format:check  # Check formatting
pnpm format        # Format code
```
