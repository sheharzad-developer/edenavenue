# Setting Up NGINX for Eden Avenue Management

## Overview

This guide shows how to configure NGINX to serve your Eden Avenue Management Next.js application.

## Current Setup

- **NGINX Port:** 8080
- **Next.js Dev Server:** localhost:3000
- **NGINX Config:** `/opt/homebrew/etc/nginx/nginx.conf`

## Configuration

NGINX is configured as a **reverse proxy** to your Next.js development server.

### What This Means

```
Browser Request (http://localhost:8080)
    ↓
NGINX (Port 8080)
    ↓
Next.js Dev Server (Port 3000)
    ↓
Your Eden Avenue App
```

## Step-by-Step Setup

### Step 1: Start Next.js Development Server

```bash
cd "/Volumes/Samsung External SSD 1/Project/EdenAvenue-Management/eden-avenue"
pnpm dev
```

This starts Next.js on `http://localhost:3000`

### Step 2: Start NGINX

```bash
# If not already running
brew services start nginx
# or
nginx
```

### Step 3: Access Your App

Open your browser and go to:

- **http://localhost:8080** - Through NGINX (recommended)
- **http://localhost:3000** - Direct Next.js (also works)

## Configuration Details

The NGINX config includes:

1. **Reverse Proxy** - Routes requests to Next.js
2. **WebSocket Support** - For hot reload in development
3. **Static File Caching** - Optimizes `/_next/static` files
4. **Proper Headers** - Preserves client IP and protocol

## Testing

### Test NGINX Configuration

```bash
# Test config syntax
nginx -t

# Should show:
# nginx: the configuration file /opt/homebrew/etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /opt/homebrew/etc/nginx/nginx.conf test is successful
```

### Test Your App

```bash
# Test through NGINX
curl http://localhost:8080

# Test direct Next.js
curl http://localhost:3000

# Both should return your app's HTML
```

### Check Both Are Running

```bash
# Check NGINX
ps aux | grep nginx | grep -v grep

# Check Next.js
lsof -i :3000

# Check ports
lsof -i :8080
lsof -i :3000
```

## Troubleshooting

### Problem: "502 Bad Gateway"

**Cause:** Next.js dev server not running

**Solution:**

```bash
# Start Next.js
cd "/Volumes/Samsung External SSD 1/Project/EdenAvenue-Management/eden-avenue"
pnpm dev
```

### Problem: "Connection Refused"

**Cause:** NGINX can't connect to Next.js

**Solution:**

```bash
# Verify Next.js is running on port 3000
lsof -i :3000

# If not, start it
pnpm dev
```

### Problem: Still Shows Default NGINX Page

**Cause:** NGINX config not reloaded

**Solution:**

```bash
# Reload NGINX config
nginx -s reload

# Or restart
brew services restart nginx
```

### Problem: Changes Not Reflecting

**Cause:** Browser cache or NGINX cache

**Solution:**

```bash
# Hard refresh browser (Cmd+Shift+R on Mac)
# Or clear browser cache
```

## Production Setup (Future)

For production, you have two options:

### Option 1: Proxy to Production Server

```nginx
location / {
    proxy_pass http://localhost:3000;  # Next.js production server
    # ... proxy settings
}
```

### Option 2: Serve Static Files

If you build Next.js as static export:

```nginx
location / {
    root /path/to/eden-avenue/out;
    try_files $uri $uri.html $uri/ =404;
}
```

## Quick Commands

```bash
# Start Next.js
pnpm dev

# Start NGINX
brew services start nginx

# Restart NGINX
nginx -s reload

# Check both running
ps aux | grep -E "(nginx|node)" | grep -v grep

# Access app
open http://localhost:8080
```

## Summary

1. ✅ NGINX is configured to proxy to Next.js
2. ✅ Start Next.js: `pnpm dev`
3. ✅ Start NGINX: `brew services start nginx`
4. ✅ Access: `http://localhost:8080`

Your Eden Avenue Management app should now be accessible through NGINX! 🚀
