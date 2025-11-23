# Dashboard Troubleshooting Guide

## If Dashboard is Not Showing

### 1. Check Browser Console

Open browser DevTools (F12) and check for:

- JavaScript errors
- Network errors (failed API calls)
- React component errors

### 2. Verify Authentication

- Make sure you're logged in
- Check if you have ADMIN or MANAGER role
- Try logging out and back in

### 3. Check API Endpoint

Visit: `http://localhost:3000/api/dashboard/stats`

- Should return JSON with stats
- If 401/403: Authentication issue
- If 500: Database/Server issue

### 4. Verify Components

All components should be in:

- `/src/components/Sidebar.tsx`
- `/src/components/TopBar.tsx`
- `/src/components/DashboardStats.tsx`
- `/src/components/DashboardSections.tsx`

### 5. Check Database Connection

- Ensure Prisma is connected
- Run: `npx prisma generate`
- Check `.env` file has `DATABASE_URL`

### 6. Common Issues

**Issue: Blank Page**

- Check browser console for errors
- Verify all imports are correct
- Check if Tailwind CSS is loading

**Issue: Sidebar Not Showing**

- On mobile: Click hamburger menu (top left)
- On desktop: Should be visible by default
- Check z-index conflicts

**Issue: Stats Not Loading**

- Check network tab for API errors
- Verify user role is ADMIN or MANAGER
- Check database has data

### 7. Quick Fixes

**Clear Cache:**

```bash
rm -rf .next
npm run dev
```

**Check Logs:**

```bash
# Check server logs for errors
npm run dev
```

**Verify Routes:**

- Dashboard: `/dashboard`
- API: `/api/dashboard/stats`

### 8. Test Components Individually

Visit these URLs to test:

- `/dashboard` - Main dashboard
- `/dashboard/requests` - Requests page
- `/properties` - Properties page

### 9. Default Behavior

The dashboard will show:

- **ADMIN/MANAGER**: Full dashboard with stats
- **RESIDENT**: Simplified dashboard
- **Unauthenticated**: Redirects to login

### 10. Still Not Working?

1. Check `package.json` dependencies
2. Verify Next.js version compatibility
3. Check for TypeScript errors: `npm run typecheck`
4. Check for lint errors: `npm run lint`
