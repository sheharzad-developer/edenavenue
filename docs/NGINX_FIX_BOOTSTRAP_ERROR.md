# Fix NGINX Bootstrap Error on macOS

## Problem

When running `brew services start nginx`, you get this error:

```
Bootstrap failed: 5: Input/output error
Error: Failure while executing; `/bin/launchctl bootstrap gui/503 /Volumes/Samsung\ External\ SSD/Library/LaunchAgents/homebrew.mxcl.nginx.plist` exited with 5.
```

## Root Cause

Homebrew is trying to create the LaunchAgent plist file on an external drive instead of your home directory. This happens when:

- Homebrew is installed on an external drive
- The `HOME` environment variable points to the external drive
- LaunchAgents directory doesn't exist in the correct location

## Solution

### Step 1: Stop NGINX Service

```bash
brew services stop nginx
```

### Step 2: Remove Incorrect Plist Files

```bash
# Remove from external drive (if exists)
rm -f "/Volumes/Samsung External SSD/Library/LaunchAgents/homebrew.mxcl.nginx.plist"

# Remove from home directory (if exists)
rm -f ~/Library/LaunchAgents/homebrew.mxcl.nginx.plist
```

### Step 3: Unload Any Stale Services

```bash
# Try to unload from launchctl
launchctl bootout gui/$(id -u)/homebrew.mxcl.nginx 2>&1 || true
launchctl remove homebrew.mxcl.nginx 2>&1 || true
```

### Step 4: Ensure Correct Directory Exists

```bash
# Make sure LaunchAgents directory exists in your home directory
mkdir -p ~/Library/LaunchAgents
```

### Step 5: Start from Home Directory

```bash
# Change to your actual home directory first
cd ~

# Then start the service
brew services start nginx
```

### Step 6: Verify

```bash
# Check if plist is in correct location
ls -la ~/Library/LaunchAgents/homebrew.mxcl.nginx.plist

# Check service status
brew services list | grep nginx

# Test NGINX
curl http://localhost:8080
```

## Alternative: Manual Start (If Service Still Fails)

If `brew services` continues to have issues, you can start NGINX manually:

```bash
# Start NGINX directly
nginx

# Check if running
ps aux | grep nginx | grep -v grep

# Test
curl http://localhost:8080
```

To stop manually:

```bash
nginx -s stop
# or
nginx -s quit  # graceful shutdown
```

## Prevention

To prevent this issue in the future:

1. **Always run brew commands from your home directory:**

   ```bash
   cd ~
   brew services start nginx
   ```

2. **Check your HOME variable:**

   ```bash
   echo $HOME
   # Should be: /Users/yourusername
   # NOT: /Volumes/Samsung External SSD/...
   ```

3. **If HOME is wrong, fix it:**
   ```bash
   export HOME=$(eval echo ~$USER)
   ```

## Quick Fix Script

Save this as `fix-nginx.sh`:

```bash
#!/bin/bash

echo "Stopping NGINX..."
brew services stop nginx

echo "Cleaning up plist files..."
rm -f "/Volumes/Samsung External SSD/Library/LaunchAgents/homebrew.mxcl.nginx.plist"
rm -f ~/Library/LaunchAgents/homebrew.mxcl.nginx.plist

echo "Ensuring LaunchAgents directory exists..."
mkdir -p ~/Library/LaunchAgents

echo "Starting NGINX from home directory..."
cd ~
brew services start nginx

echo "Waiting for service to start..."
sleep 2

echo "Checking status..."
brew services list | grep nginx

echo "Testing NGINX..."
curl -s http://localhost:8080 | head -3

echo "✅ Done!"
```

Make it executable and run:

```bash
chmod +x fix-nginx.sh
./fix-nginx.sh
```

## Verification Checklist

After fixing, verify:

- [ ] Plist file exists in `~/Library/LaunchAgents/`
- [ ] No plist file on external drive
- [ ] `brew services list` shows nginx status
- [ ] `ps aux | grep nginx` shows processes
- [ ] `curl http://localhost:8080` returns HTML

## Summary

The bootstrap error occurs because launchctl can't access plist files on external drives. The fix is to:

1. Remove incorrect plist files
2. Ensure LaunchAgents directory exists in home directory
3. Start the service from home directory
4. Verify it's working

If `brew services` continues to fail, use manual `nginx` command instead.
