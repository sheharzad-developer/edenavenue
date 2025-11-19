# NGINX Learning Guide for Eden Avenue Management

## Table of Contents

1. [What is NGINX?](#what-is-nginx)
2. [Why Learn NGINX?](#why-learn-nginx)
3. [NGINX vs Your Current Setup](#nginx-vs-your-current-setup)
4. [NGINX Architecture](#nginx-architecture)
5. [Installation & Setup](#installation--setup)
6. [Basic Configuration](#basic-configuration)
7. [NGINX for Your Next.js App](#nginx-for-your-nextjs-app)
8. [Common Use Cases](#common-use-cases)
9. [Advanced Features](#advanced-features)
10. [Troubleshooting](#troubleshooting)
11. [Practice Exercises](#practice-exercises)
12. [Resources](#resources)

---

## What is NGINX?

**NGINX** (pronounced "engine-x") is a powerful, high-performance web server, reverse proxy, and load balancer.

### Key Features

✅ **Web Server** - Serves static files (HTML, CSS, JS, images)
✅ **Reverse Proxy** - Routes requests to backend servers
✅ **Load Balancer** - Distributes traffic across multiple servers
✅ **SSL/TLS Termination** - Handles HTTPS encryption
✅ **Caching** - Stores frequently accessed content
✅ **Compression** - Reduces file sizes for faster delivery
✅ **Rate Limiting** - Protects against abuse

### Why It's Popular

- **High Performance** - Handles thousands of concurrent connections
- **Low Memory Usage** - Efficient resource utilization
- **Reliability** - Stable and production-ready
- **Flexibility** - Highly configurable
- **Open Source** - Free and widely used

---

## Why Learn NGINX?

### For Your Career

1. **Industry Standard** - Used by 40%+ of websites
2. **DevOps Essential** - Critical skill for backend/infrastructure roles
3. **Performance** - Understanding how to optimize web delivery
4. **Security** - Learn to configure secure web servers
5. **Scalability** - Know how to handle high traffic

### For Your Project

Even though you're using Vercel (which handles everything), learning NGINX helps you:

- Understand how web servers work
- Deploy to your own server if needed
- Optimize performance
- Set up custom domains
- Handle SSL certificates
- Implement caching strategies
- Set up load balancing

---

## NGINX vs Your Current Setup

### Your Current Setup (Vercel)

```
User Request
    ↓
Vercel Edge Network (CDN)
    ↓
Next.js Serverless Functions
    ↓
Neon PostgreSQL Database
```

**What Vercel Does:**

- ✅ Handles NGINX-like functionality automatically
- ✅ Serves static files via CDN
- ✅ Routes API requests to serverless functions
- ✅ Manages SSL certificates
- ✅ Handles caching
- ✅ No configuration needed

### With NGINX (Self-Hosted)

```
User Request
    ↓
NGINX (Reverse Proxy)
    ↓
Next.js Application Server
    ↓
PostgreSQL Database
```

**What You'd Configure:**

- NGINX configuration files
- SSL certificates
- Caching rules
- Load balancing
- Rate limiting

---

## NGINX Architecture

### How NGINX Works

**Master Process:**

- Reads configuration
- Manages worker processes
- Handles signals (reload, restart)

**Worker Processes:**

- Handle actual requests
- Process connections
- Serve content

**Event-Driven Model:**

- Non-blocking I/O
- Handles multiple connections efficiently
- Low memory footprint

### Key Concepts

**Server Blocks (Virtual Hosts):**

- Define how to handle requests for different domains
- Similar to Apache's virtual hosts

**Location Blocks:**

- Define how to handle specific URL paths
- Can have different rules for different paths

**Upstream:**

- Defines backend servers
- Used for load balancing

---

## Installation & Setup

### macOS (Your System)

```bash
# Install using Homebrew
brew install nginx

# Start NGINX
brew services start nginx

# Stop NGINX
brew services stop nginx

# Restart NGINX
brew services restart nginx

# Check status
brew services list | grep nginx
```

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install NGINX
sudo apt install nginx

# Start NGINX
sudo systemctl start nginx

# Enable auto-start on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Linux (CentOS/RHEL)

```bash
# Install NGINX
sudo yum install nginx

# Start NGINX
sudo systemctl start nginx

# Enable auto-start
sudo systemctl enable nginx
```

### Verify Installation

```bash
# Check if NGINX is running
curl http://localhost

# Or open in browser
open http://localhost
```

You should see the default NGINX welcome page.

### Important Directories

**macOS (Homebrew):**

- Config: `/opt/homebrew/etc/nginx/` or `/usr/local/etc/nginx/`
- Logs: `/opt/homebrew/var/log/nginx/` or `/usr/local/var/log/nginx/`
- HTML: `/opt/homebrew/var/www/` or `/usr/local/var/www/`

**Linux:**

- Config: `/etc/nginx/`
- Logs: `/var/log/nginx/`
- HTML: `/var/www/html/` or `/usr/share/nginx/html/`

---

## Basic Configuration

### Main Configuration File

**Location:**

- macOS: `/opt/homebrew/etc/nginx/nginx.conf` or `/usr/local/etc/nginx/nginx.conf`
- Linux: `/etc/nginx/nginx.conf`

### Basic Structure

```nginx
# Main context
user www-data;
worker_processes auto;
error_log /var/log/nginx/error.log;

events {
    worker_connections 1024;
}

http {
    # HTTP context
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;

    # Server block
    server {
        listen 80;
        server_name localhost;

        location / {
            root /var/www/html;
            index index.html;
        }
    }
}
```

### Key Directives

**`user`** - User that runs worker processes
**`worker_processes`** - Number of worker processes (auto = CPU cores)
**`worker_connections`** - Max connections per worker
**`listen`** - Port to listen on
**`server_name`** - Domain name(s) for this server block
**`root`** - Directory for static files
**`index`** - Default file to serve

### Testing Configuration

```bash
# Test configuration syntax
nginx -t

# Test and show full config
nginx -T

# Reload configuration (after changes)
nginx -s reload

# Or restart
nginx -s restart
```

---

## NGINX for Your Next.js App

### Scenario 1: Reverse Proxy to Next.js

If you were running Next.js on your own server:

```nginx
server {
    listen 80;
    server_name edenavenue.local;

    # Proxy all requests to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static files directly (faster)
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

**What This Does:**

- Listens on port 80
- Routes requests to Next.js on port 3000
- Preserves headers for proper request handling
- Caches static assets

### Scenario 2: Serve Built Static Files

If you built Next.js as static export:

```nginx
server {
    listen 80;
    server_name edenavenue.local;
    root /var/www/eden-avenue/out;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # Cache static assets
    location /_next/static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1000;
}
```

### Scenario 3: API Routes Proxy

For your API routes:

```nginx
server {
    listen 80;
    server_name api.edenavenue.local;

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Rate limiting
        limit_req zone=api_limit burst=10 nodelay;
    }
}

# Rate limiting zone
http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
}
```

---

## Common Use Cases

### 1. SSL/HTTPS Setup

```nginx
server {
    listen 80;
    server_name edenavenue.local;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name edenavenue.local;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/edenavenue.local/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/edenavenue.local/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### 2. Load Balancing

```nginx
# Define upstream servers
upstream backend {
    least_conn;  # Load balancing method
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    server_name edenavenue.local;

    location / {
        proxy_pass http://backend;
    }
}
```

**Load Balancing Methods:**

- `least_conn` - Fewest active connections
- `ip_hash` - Sticky sessions by IP
- `round_robin` - Default, round-robin

### 3. Caching

```nginx
# Cache zone
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

server {
    listen 80;
    server_name edenavenue.local;

    location / {
        proxy_pass http://localhost:3000;
        proxy_cache my_cache;
        proxy_cache_valid 200 60m;
        proxy_cache_use_stale error timeout updating;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

### 4. Compression

```nginx
server {
    listen 80;
    server_name edenavenue.local;

    # Enable gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
```

### 5. Rate Limiting

```nginx
# Define rate limit zones
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;

server {
    listen 80;
    server_name edenavenue.local;

    # General rate limiting
    limit_req zone=general burst=20 nodelay;

    # Stricter API rate limiting
    location /api {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:3000;
    }
}
```

### 6. Serving Static Files

```nginx
server {
    listen 80;
    server_name edenavenue.local;
    root /var/www/eden-avenue/public;

    # Serve static files directly
    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Serve images
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

### 7. Custom Error Pages

```nginx
server {
    listen 80;
    server_name edenavenue.local;

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    location = /50x.html {
        root /var/www/eden-avenue/error-pages;
    }
}
```

---

## Advanced Features

### 1. URL Rewriting

```nginx
server {
    listen 80;
    server_name edenavenue.local;

    # Remove trailing slash
    rewrite ^/(.*)/$ /$1 permanent;

    # Redirect old URLs
    rewrite ^/old-page$ /new-page permanent;

    # Clean URLs (remove .html)
    rewrite ^/(.*)\.html$ /$1 permanent;
}
```

### 2. Access Control

```nginx
server {
    listen 80;
    server_name edenavenue.local;

    # Allow only specific IPs
    location /admin {
        allow 192.168.1.0/24;
        allow 10.0.0.0/8;
        deny all;
        proxy_pass http://localhost:3000;
    }

    # Basic authentication
    location /secure {
        auth_basic "Restricted Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://localhost:3000;
    }
}
```

### 3. Logging

```nginx
# Custom log format
log_format custom '$remote_addr - $remote_user [$time_local] '
                  '"$request" $status $body_bytes_sent '
                  '"$http_referer" "$http_user_agent" '
                  '$request_time';

server {
    listen 80;
    server_name edenavenue.local;

    access_log /var/log/nginx/eden-avenue.log custom;
    error_log /var/log/nginx/eden-avenue-error.log warn;
}
```

### 4. WebSocket Support

```nginx
server {
    listen 80;
    server_name edenavenue.local;

    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 5. Multiple Domains

```nginx
# Domain 1
server {
    listen 80;
    server_name edenavenue.local;
    root /var/www/eden-avenue;
    # ... config
}

# Domain 2
server {
    listen 80;
    server_name api.edenavenue.local;
    # ... config
}

# Default server (catch-all)
server {
    listen 80 default_server;
    server_name _;
    return 444;  # Close connection
}
```

---

## Troubleshooting

### Common Issues

**1. Configuration Syntax Error**

```bash
# Test configuration
nginx -t

# Common errors:
# - Missing semicolon
# - Unclosed braces
# - Invalid directive
```

**2. Permission Denied**

```bash
# Check file permissions
ls -la /var/www/html

# Fix permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

**3. Port Already in Use**

```bash
# Check what's using port 80
sudo lsof -i :80

# Or
sudo netstat -tulpn | grep :80

# Kill process or change NGINX port
```

**4. 502 Bad Gateway**

- Backend server not running
- Wrong proxy_pass URL
- Firewall blocking connection

**5. 403 Forbidden**

- Wrong file permissions
- Wrong root directory
- index file missing

### Debugging Commands

```bash
# Check NGINX status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log

# Test configuration
sudo nginx -t

# Reload configuration
sudo nginx -s reload

# Check open ports
sudo netstat -tulpn | grep nginx
```

---

## Practice Exercises

### Exercise 1: Basic Static Site

**Goal:** Serve a simple HTML page

1. Create a test HTML file:

```bash
mkdir -p ~/nginx-practice
echo "<h1>Hello NGINX!</h1>" > ~/nginx-practice/index.html
```

2. Configure NGINX to serve it:

```nginx
server {
    listen 8080;
    server_name localhost;
    root ~/nginx-practice;
    index index.html;
}
```

3. Test: `curl http://localhost:8080`

### Exercise 2: Reverse Proxy

**Goal:** Proxy requests to a local server

1. Start a simple server:

```bash
# Python example
python3 -m http.server 8000
```

2. Configure NGINX:

```nginx
server {
    listen 8080;
    server_name localhost;

    location / {
        proxy_pass http://localhost:8000;
    }
}
```

3. Test: `curl http://localhost:8080`

### Exercise 3: Load Balancing

**Goal:** Distribute load across multiple servers

1. Start multiple servers on different ports
2. Configure upstream:

```nginx
upstream backend {
    server localhost:8000;
    server localhost:8001;
    server localhost:8002;
}

server {
    listen 8080;
    location / {
        proxy_pass http://backend;
    }
}
```

### Exercise 4: SSL Setup (Local)

**Goal:** Set up HTTPS with self-signed certificate

1. Generate self-signed certificate:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx-selfsigned.key \
  -out /etc/nginx/ssl/nginx-selfsigned.crt
```

2. Configure NGINX:

```nginx
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;

    location / {
        root /var/www/html;
    }
}
```

### Exercise 5: Caching

**Goal:** Implement caching for static files

1. Create cache directory:

```bash
sudo mkdir -p /var/cache/nginx
```

2. Configure caching:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;

server {
    listen 8080;
    location / {
        proxy_pass http://localhost:3000;
        proxy_cache my_cache;
        proxy_cache_valid 200 10m;
    }
}
```

---

## Resources

### Official Documentation

- **NGINX Official Docs**: https://nginx.org/en/docs/
- **NGINX Beginner's Guide**: https://nginx.org/en/docs/beginners_guide.html
- **NGINX Admin Guide**: https://nginx.org/en/docs/http/ngx_http_core_module.html

### Tutorials & Courses

**Free:**

- DigitalOcean NGINX Tutorials: https://www.digitalocean.com/community/tags/nginx
- NGINX Learning: https://www.nginx.com/resources/wiki/
- YouTube: Search "NGINX tutorial"

**Paid:**

- NGINX Official Training: https://www.nginx.com/training/
- Udemy: "Complete NGINX Course"
- Pluralsight: NGINX courses

### Books

- "NGINX HTTP Server" by Martin Fjordvald
- "Mastering NGINX" by Dimitri Aivaliotis
- "NGINX Cookbook" by Derek DeJonghe

### Practice Platforms

- **DigitalOcean**: Deploy NGINX on a droplet
- **AWS EC2**: Set up NGINX on EC2 instance
- **Local VM**: Use VirtualBox/Vagrant
- **Docker**: Run NGINX in containers

### Community

- NGINX Forum: https://forum.nginx.org/
- Stack Overflow: Tag `nginx`
- Reddit: r/nginx
- GitHub: nginx/nginx

---

## Learning Path

### Week 1: Basics

- [ ] Install NGINX
- [ ] Understand configuration structure
- [ ] Serve static files
- [ ] Set up basic server blocks

### Week 2: Reverse Proxy

- [ ] Configure reverse proxy
- [ ] Understand proxy headers
- [ ] Set up for Next.js app
- [ ] Handle WebSockets

### Week 3: SSL & Security

- [ ] Set up SSL certificates
- [ ] Configure HTTPS
- [ ] Implement rate limiting
- [ ] Set up access control

### Week 4: Performance

- [ ] Implement caching
- [ ] Configure compression
- [ ] Set up load balancing
- [ ] Optimize for your app

### Week 5: Advanced

- [ ] Custom logging
- [ ] URL rewriting
- [ ] Multiple domains
- [ ] Monitoring & debugging

---

## Quick Reference

### Common Commands

```bash
# Start NGINX
sudo systemctl start nginx
# or
brew services start nginx

# Stop NGINX
sudo systemctl stop nginx

# Restart NGINX
sudo systemctl restart nginx

# Reload configuration
sudo nginx -s reload
# or
sudo systemctl reload nginx

# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx
```

### Configuration Locations

**macOS (Homebrew):**

- Main config: `/opt/homebrew/etc/nginx/nginx.conf`
- Sites: `/opt/homebrew/etc/nginx/servers/`
- Logs: `/opt/homebrew/var/log/nginx/`

**Linux:**

- Main config: `/etc/nginx/nginx.conf`
- Sites: `/etc/nginx/sites-available/` and `/etc/nginx/sites-enabled/`
- Logs: `/var/log/nginx/`

### Important Directives

- `listen` - Port to listen on
- `server_name` - Domain name
- `root` - Document root directory
- `index` - Default file
- `proxy_pass` - Backend server URL
- `location` - URL path matching
- `rewrite` - URL rewriting
- `return` - HTTP response

---

## Summary

NGINX is a powerful tool for:

- ✅ Serving web applications
- ✅ Reverse proxying
- ✅ Load balancing
- ✅ SSL termination
- ✅ Caching and compression
- ✅ Security and rate limiting

Even though you're using Vercel (which handles all this automatically), learning NGINX gives you:

- Deep understanding of web servers
- Ability to self-host if needed
- Skills for DevOps roles
- Better performance optimization knowledge

**Next Steps:**

1. Install NGINX locally
2. Follow the practice exercises
3. Try configuring it for a test Next.js app
4. Experiment with different features
5. Deploy to a cloud server (DigitalOcean, AWS, etc.)

Happy learning! 🚀
