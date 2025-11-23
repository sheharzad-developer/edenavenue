#!/bin/bash

# Cloudflare Setup Script for Eden Avenue Management
# This script helps configure Cloudflare DNS, CDN, and SSL

echo "🌐 Cloudflare Setup for Eden Avenue Management"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
command -v curl >/dev/null 2>&1 || { echo "Error: curl is required but not installed. Aborting." >&2; exit 1; }

echo "📋 Prerequisites:"
echo "1. Cloudflare account (sign up at https://dash.cloudflare.com)"
echo "2. Domain name added to Cloudflare"
echo "3. Cloudflare API token with Zone:Edit and DNS:Edit permissions"
echo ""

read -p "Do you have these ready? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please set up your Cloudflare account first."
    exit 1
fi

echo ""
echo "📝 Configuration Steps:"
echo ""

# Step 1: DNS Configuration
echo -e "${GREEN}Step 1: DNS Configuration${NC}"
echo "------------------------"
echo "In Cloudflare Dashboard:"
echo "1. Go to DNS → Records"
echo "2. Add/Edit A record:"
echo "   - Type: A"
echo "   - Name: @ (or yourdomain.com)"
echo "   - IPv4 address: YOUR_SERVER_IP"
echo "   - Proxy status: Proxied (orange cloud)"
echo ""
echo "3. Add/Edit A record for www:"
echo "   - Type: A"
echo "   - Name: www"
echo "   - IPv4 address: YOUR_SERVER_IP"
echo "   - Proxy status: Proxied (orange cloud)"
echo ""

read -p "Press Enter when DNS records are configured..."

# Step 2: SSL/TLS Configuration
echo ""
echo -e "${GREEN}Step 2: SSL/TLS Configuration${NC}"
echo "------------------------"
echo "In Cloudflare Dashboard:"
echo "1. Go to SSL/TLS → Overview"
echo "2. Set encryption mode to: Full (strict)"
echo "   - This ensures end-to-end encryption"
echo ""
echo "3. Go to SSL/TLS → Edge Certificates"
echo "   - Enable 'Always Use HTTPS'"
echo "   - Enable 'Automatic HTTPS Rewrites'"
echo "   - Set 'Minimum TLS Version' to 1.2"
echo ""

read -p "Press Enter when SSL/TLS is configured..."

# Step 3: Performance Settings
echo ""
echo -e "${GREEN}Step 3: Performance Optimization${NC}"
echo "------------------------"
echo "In Cloudflare Dashboard:"
echo "1. Go to Speed → Optimization"
echo "   - Enable 'Auto Minify' for JS, CSS, HTML"
echo "   - Enable 'Brotli' compression"
echo ""
echo "2. Go to Caching → Configuration"
echo "   - Set Caching Level: Standard"
echo "   - Enable 'Browser Cache TTL': Respect Existing Headers"
echo ""

read -p "Press Enter when performance settings are configured..."

# Step 4: Security Settings
echo ""
echo -e "${GREEN}Step 4: Security Settings${NC}"
echo "------------------------"
echo "In Cloudflare Dashboard:"
echo "1. Go to Security → WAF"
echo "   - Enable Web Application Firewall"
echo "   - Review and adjust rules as needed"
echo ""
echo "2. Go to Security → DDoS"
echo "   - Enable DDoS protection"
echo ""
echo "3. Go to Security → Bots"
echo "   - Enable Bot Fight Mode (free tier)"
echo ""

read -p "Press Enter when security settings are configured..."

# Step 5: Page Rules (Optional)
echo ""
echo -e "${GREEN}Step 5: Page Rules (Optional)${NC}"
echo "------------------------"
echo "In Cloudflare Dashboard:"
echo "Go to Rules → Page Rules"
echo "Add rule for API routes:"
echo "  URL: *yourdomain.com/api/*"
echo "  Settings:"
echo "    - Cache Level: Bypass"
echo "    - Security Level: High"
echo ""

# Step 6: Environment Variables
echo ""
echo -e "${GREEN}Step 6: Update Environment Variables${NC}"
echo "------------------------"
echo "Update your .env file with:"
echo "  NEXTAUTH_URL=https://yourdomain.com"
echo "  NEXTAUTH_SECRET=your-secret-key"
echo ""
echo "Update your domain configuration in your hosting provider."
echo ""

# Step 8: Verify Setup
echo ""
echo -e "${GREEN}Step 8: Verify Setup${NC}"
echo "------------------------"
echo "1. Check DNS propagation:"
echo "   dig yourdomain.com"
echo ""
echo "2. Test SSL:"
echo "   curl -I https://yourdomain.com"
echo ""
echo "3. Check Cloudflare status:"
echo "   Visit: https://www.cloudflarestatus.com"
echo ""

echo ""
echo -e "${GREEN}✅ Cloudflare setup complete!${NC}"
echo ""
echo "📚 Additional Resources:"
echo "- Cloudflare Docs: https://developers.cloudflare.com"
echo "- SSL Test: https://www.ssllabs.com/ssltest/"
echo "- Security Headers: https://securityheaders.com"
echo ""

