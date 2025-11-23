# Production Deployment Guide

## Overview

This guide covers deploying Eden Avenue Management to production using NGINX, PM2, and Cloudflare.

## Prerequisites

- Ubuntu/Debian server (or similar Linux distribution)
- Domain name
- Root or sudo access
- Node.js 18+ installed
- PostgreSQL database (Neon or self-hosted)

## Step 1: Server Setup

### Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install NGINX
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

## Step 2: Application Setup

### Clone and Build

```bash
# Clone repository
git clone https://github.com/yourusername/edenavenue.git
cd edenavenue/eden-avenue

# Install dependencies
npm install

# Build application
npm run build

# Run database migrations
npx prisma migrate deploy
```

### Environment Variables

Create `.env` file:

```env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

Generate secret:

```bash
openssl rand -base64 32
```

## Step 3: PM2 Configuration

### Update ecosystem.config.js

```javascript
cwd: '/path/to/eden-avenue', // Update this path
```

### Start with PM2

```bash
# Create logs directory
mkdir -p logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown
```

### PM2 Commands

```bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart eden-avenue  # Restart app
pm2 stop eden-avenue     # Stop app
pm2 monit           # Monitor resources
```

## Step 4: NGINX Configuration

### Install Configuration

```bash
# Copy production config
sudo cp nginx-production.conf /etc/nginx/sites-available/eden-avenue

# Edit and update domain name
sudo nano /etc/nginx/sites-available/eden-avenue

# Enable site
sudo ln -s /etc/nginx/sites-available/eden-avenue /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx
```

### Update Domain Name

Replace `yourdomain.com` with your actual domain in:

- `/etc/nginx/sites-available/eden-avenue`

## Step 5: SSL Certificate (Let's Encrypt)

### Obtain Certificate

```bash
# Stop NGINX temporarily
sudo systemctl stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Start NGINX
sudo systemctl start nginx
```

### Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot auto-renewal is set up automatically via systemd timer
```

## Step 6: Cloudflare Setup

### Run Setup Script

```bash
./setup-cloudflare.sh
```

### Manual Configuration

1. **DNS**: Add A records pointing to your server IP (proxied)
2. **SSL/TLS**: Set to "Full (strict)"
3. **Performance**: Enable Auto Minify and Brotli
4. **Security**: Enable WAF and DDoS protection

## Step 7: Firewall Configuration

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 8: Verify Deployment

### Check Services

```bash
# Check PM2
pm2 status

# Check NGINX
sudo systemctl status nginx

# Check SSL
curl -I https://yourdomain.com
```

### Test Application

1. Visit `https://yourdomain.com`
2. Test login/registration
3. Check API endpoints
4. Verify database connections

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
```

### NGINX Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/eden-avenue-access.log

# Error logs
sudo tail -f /var/log/nginx/eden-avenue-error.log
```

### Application Logs

```bash
pm2 logs eden-avenue
```

## Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs eden-avenue --err

# Check environment variables
pm2 env 0

# Restart application
pm2 restart eden-avenue
```

### NGINX Errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Reload NGINX
sudo systemctl reload nginx
```

### SSL Issues

```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check SSL test
# Visit: https://www.ssllabs.com/ssltest/
```

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Restart PM2
pm2 restart eden-avenue
```

### Backup Database

```bash
# Create backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

## Security Checklist

- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured (UFW)
- [ ] Environment variables secured
- [ ] Database credentials secure
- [ ] NGINX security headers enabled
- [ ] Rate limiting configured
- [ ] Cloudflare WAF enabled
- [ ] Regular backups scheduled
- [ ] PM2 monitoring enabled
- [ ] Log rotation configured

## Support

For issues or questions:

- Check logs: `pm2 logs` and `/var/log/nginx/`
- Review NGINX config: `sudo nginx -t`
- Check Cloudflare dashboard
- Review application error logs
