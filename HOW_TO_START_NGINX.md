# How to Start NGINX - Complete Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Different Methods to Start NGINX](#different-methods-to-start-nginx)
3. [Checking if NGINX is Running](#checking-if-nginx-is-running)
4. [Troubleshooting](#troubleshooting)
5. [Common Commands](#common-commands)
6. [Understanding the Process](#understanding-the-process)

---

## Quick Start

### macOS (Homebrew) - Your System

```bash
# Start NGINX using Homebrew services (Recommended)
brew services start nginx

# Or start manually
nginx
```

### Linux (Ubuntu/Debian)

```bash
# Start NGINX service
sudo systemctl start nginx

# Enable auto-start on boot
sudo systemctl enable nginx
```

### Linux (CentOS/RHEL)

```bash
# Start NGINX service
sudo systemctl start nginx

# Enable auto-start on boot
sudo systemctl enable nginx
```

---

## Different Methods to Start NGINX

### Method 1: Using Homebrew Services (macOS) ⭐ Recommended

**What it does:**

- Starts NGINX as a background service
- Automatically restarts if it crashes
- Starts on system boot (if enabled)
- Manages the process lifecycle

**Commands:**

```bash
# Start NGINX
brew services start nginx

# Stop NGINX
brew services stop nginx

# Restart NGINX
brew services restart nginx

# Check status
brew services list | grep nginx

# Reload configuration (without stopping)
brew services restart nginx
```

**Output when successful:**

```
==> Successfully started `nginx` (label: homebrew.mxcl.nginx)
```

**When to use:**

- ✅ Production use
- ✅ When you want NGINX to run in background
- ✅ When you want it to auto-start on boot
- ✅ When you want automatic restarts

---

### Method 2: Manual Start (Direct Command)

**What it does:**

- Starts NGINX directly from command line
- Runs in foreground (blocks terminal) or background
- Good for testing and debugging

**Commands:**

```bash
# Start NGINX (runs in background by default)
nginx

# Start NGINX with specific config file
nginx -c /path/to/nginx.conf

# Start NGINX in foreground (for debugging)
nginx -g "daemon off;"

# Stop NGINX
nginx -s stop

# Reload configuration
nginx -s reload

# Quit gracefully (finish current requests)
nginx -s quit
```

**When to use:**

- ✅ Testing configuration changes
- ✅ Debugging issues
- ✅ Quick start without service management
- ✅ Development/testing

---

### Method 3: Using systemctl (Linux)

**What it does:**

- Uses systemd service manager
- Provides service management features
- Standard on most Linux distributions

**Commands:**

```bash
# Start NGINX
sudo systemctl start nginx

# Stop NGINX
sudo systemctl stop nginx

# Restart NGINX
sudo systemctl restart nginx

# Reload configuration (without stopping)
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# Enable auto-start on boot
sudo systemctl enable nginx

# Disable auto-start on boot
sudo systemctl disable nginx

# Check if enabled
sudo systemctl is-enabled nginx
```

**Output when successful:**

```
● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2024-01-15 10:00:00 UTC; 5min ago
```

**When to use:**

- ✅ Linux servers
- ✅ Production environments
- ✅ When you need system-level service management

---

### Method 4: Using service command (Older Linux)

**What it does:**

- Legacy service management
- Still works on older systems

**Commands:**

```bash
# Start NGINX
sudo service nginx start

# Stop NGINX
sudo service nginx stop

# Restart NGINX
sudo service nginx restart

# Reload configuration
sudo service nginx reload

# Check status
sudo service nginx status
```

**When to use:**

- ✅ Older Linux distributions
- ✅ Systems without systemd
- ✅ Compatibility with legacy scripts

---

## Checking if NGINX is Running

### Method 1: Check Process

```bash
# Check if NGINX process exists
ps aux | grep nginx | grep -v grep

# Expected output:
# applemini  12345  0.0  0.0  ... nginx: master process
# applemini  12346  0.0  0.0  ... nginx: worker process
```

**What you see:**

- `master process` - Main NGINX process (manages workers)
- `worker process` - Handles actual requests (usually multiple)

---

### Method 2: Check Service Status

**macOS (Homebrew):**

```bash
brew services list | grep nginx

# Output:
# nginx started  applemini  ~/Library/LaunchAgents/homebrew.mxcl.nginx.plist
```

**Linux (systemctl):**

```bash
sudo systemctl status nginx

# Look for: "Active: active (running)"
```

---

### Method 3: Check Port Listening

```bash
# Check if NGINX is listening on port 80 (default)
lsof -i :80

# Check if NGINX is listening on port 8080 (your config)
lsof -i :8080

# Or use netstat
netstat -tulpn | grep nginx
```

**Expected output:**

```
nginx   12345  applemini    6u  IPv4 0x...  TCP *:8080 (LISTEN)
```

---

### Method 4: Test HTTP Response

```bash
# Test if NGINX responds
curl http://localhost

# Or if on port 8080
curl http://localhost:8080

# Expected: HTML content (welcome page or your site)
```

**Success output:**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to nginx!</title>
    ...
  </head>
</html>
```

---

### Method 5: Check PID File

```bash
# Check if PID file exists (macOS Homebrew)
cat /opt/homebrew/var/run/nginx.pid

# Linux default location
cat /var/run/nginx.pid

# Or check if process with that PID exists
ps -p $(cat /opt/homebrew/var/run/nginx.pid)
```

---

## Troubleshooting

### Problem 1: "Permission Denied" Error

**Error:**

```
nginx: [emerg] open() "/opt/homebrew/var/run/nginx.pid" failed (13: Permission denied)
```

**Solution:**

```bash
# Remove old PID file
rm -f /opt/homebrew/var/run/nginx.pid

# Or fix permissions
sudo chown $(whoami):admin /opt/homebrew/var/run/nginx.pid

# Then start again
brew services start nginx
```

---

### Problem 2: "Address Already in Use"

**Error:**

```
nginx: [emerg] bind() to 0.0.0.0:80 failed (48: Address already in use)
```

**Solution:**

```bash
# Find what's using port 80
sudo lsof -i :80

# Kill the process or change NGINX port
# Edit nginx.conf and change listen port
```

---

### Problem 3: Configuration Syntax Error

**Error:**

```
nginx: [emerg] unexpected "}" in /opt/homebrew/etc/nginx/nginx.conf:45
```

**Solution:**

```bash
# Test configuration first
nginx -t

# Fix syntax errors in config file
# Common issues:
# - Missing semicolons
# - Unclosed braces
# - Invalid directives
```

---

### Problem 4: Service Won't Start

**Check logs:**

```bash
# macOS Homebrew
tail -f /opt/homebrew/var/log/nginx/error.log

# Linux
sudo tail -f /var/log/nginx/error.log
```

**Common causes:**

- Configuration errors
- Port already in use
- Permission issues
- Missing directories

---

### Problem 5: NGINX Starts but Doesn't Respond

**Check:**

```bash
# 1. Verify process is running
ps aux | grep nginx

# 2. Check if listening on correct port
lsof -i :8080

# 3. Check firewall
# macOS: System Preferences > Security & Privacy > Firewall
# Linux: sudo ufw status

# 4. Check configuration
nginx -t

# 5. Check error logs
tail -20 /opt/homebrew/var/log/nginx/error.log
```

---

## Common Commands

### Starting & Stopping

```bash
# Start
brew services start nginx        # macOS
sudo systemctl start nginx       # Linux
nginx                            # Manual

# Stop
brew services stop nginx         # macOS
sudo systemctl stop nginx        # Linux
nginx -s stop                    # Manual (immediate)
nginx -s quit                    # Manual (graceful)

# Restart
brew services restart nginx      # macOS
sudo systemctl restart nginx    # Linux
nginx -s reload                  # Reload config only
```

### Configuration

```bash
# Test configuration
nginx -t

# Test and show full config
nginx -T

# Reload configuration (no downtime)
nginx -s reload
# or
sudo systemctl reload nginx
```

### Logs

```bash
# Error log (macOS)
tail -f /opt/homebrew/var/log/nginx/error.log

# Access log (macOS)
tail -f /opt/homebrew/var/log/nginx/access.log

# Error log (Linux)
sudo tail -f /var/log/nginx/error.log

# Access log (Linux)
sudo tail -f /var/log/nginx/access.log
```

---

## Understanding the Process

### How NGINX Starts

1. **Master Process**
   - Reads configuration file
   - Creates worker processes
   - Manages workers (restart if they crash)
   - Handles signals (reload, stop, etc.)

2. **Worker Processes**
   - Handle actual HTTP requests
   - Process connections
   - Serve content
   - Usually one per CPU core

### Process Hierarchy

```
nginx (master process)
├── nginx (worker process 1)
├── nginx (worker process 2)
└── nginx (worker process 3)
```

### Signals NGINX Understands

- `TERM` or `INT` - Quick shutdown
- `QUIT` - Graceful shutdown (finish current requests)
- `HUP` - Reload configuration
- `USR1` - Reopen log files
- `USR2` - Upgrade executable (zero downtime)

---

## Step-by-Step: Starting NGINX for the First Time

### Step 1: Verify Installation

```bash
# Check if NGINX is installed
which nginx

# Check version
nginx -v

# Expected: nginx version: nginx/1.x.x
```

### Step 2: Test Configuration

```bash
# Test configuration syntax
nginx -t

# Expected output:
# nginx: the configuration file /opt/homebrew/etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /opt/homebrew/etc/nginx/nginx.conf test is successful
```

### Step 3: Start NGINX

```bash
# Start using your preferred method
brew services start nginx
```

### Step 4: Verify It's Running

```bash
# Check process
ps aux | grep nginx | grep -v grep

# Check service status
brew services list | grep nginx

# Test HTTP response
curl http://localhost:8080
```

### Step 5: Access in Browser

Open your browser and go to:

- `http://localhost:8080` (your current config)
- Or `http://localhost` (if on port 80)

You should see the NGINX welcome page!

---

## Auto-Start on Boot

### macOS (Homebrew)

```bash
# Already enabled by default with brew services
# To disable:
brew services stop nginx

# To re-enable:
brew services start nginx
```

### Linux (systemctl)

```bash
# Enable auto-start
sudo systemctl enable nginx

# Disable auto-start
sudo systemctl disable nginx

# Check if enabled
sudo systemctl is-enabled nginx
```

---

## Quick Reference Card

```bash
# START
brew services start nginx      # macOS
sudo systemctl start nginx     # Linux
nginx                          # Manual

# STOP
brew services stop nginx       # macOS
sudo systemctl stop nginx      # Linux
nginx -s stop                  # Immediate
nginx -s quit                  # Graceful

# RESTART
brew services restart nginx    # macOS
sudo systemctl restart nginx   # Linux

# RELOAD CONFIG
nginx -s reload                # Manual
sudo systemctl reload nginx    # Linux

# STATUS
brew services list | grep nginx
sudo systemctl status nginx
ps aux | grep nginx

# TEST CONFIG
nginx -t

# LOGS
tail -f /opt/homebrew/var/log/nginx/error.log    # macOS
sudo tail -f /var/log/nginx/error.log           # Linux
```

---

## Practice Exercises

### Exercise 1: Start and Verify

1. Start NGINX using `brew services start nginx`
2. Check if it's running with `ps aux | grep nginx`
3. Test it with `curl http://localhost:8080`
4. Open `http://localhost:8080` in your browser

### Exercise 2: Reload Configuration

1. Edit `/opt/homebrew/etc/nginx/nginx.conf`
2. Change the `listen` port to `8081`
3. Test config: `nginx -t`
4. Reload: `nginx -s reload` or `brew services restart nginx`
5. Test new port: `curl http://localhost:8081`

### Exercise 3: Stop and Start

1. Stop NGINX: `brew services stop nginx`
2. Verify it's stopped: `ps aux | grep nginx`
3. Start again: `brew services start nginx`
4. Verify it's running: `curl http://localhost:8080`

---

## Summary

**To start NGINX:**

1. **macOS (Homebrew):** `brew services start nginx` ⭐
2. **Linux:** `sudo systemctl start nginx`
3. **Manual:** `nginx`

**To verify it's running:**

1. Check process: `ps aux | grep nginx`
2. Check service: `brew services list | grep nginx`
3. Test HTTP: `curl http://localhost:8080`

**Common issues:**

- Permission errors → Fix PID file permissions
- Port in use → Change port or kill conflicting process
- Config errors → Run `nginx -t` to check

**Best practice:**

- Always test config before starting: `nginx -t`
- Use service management (brew services/systemctl) for production
- Check logs if something goes wrong

Happy learning! 🚀
