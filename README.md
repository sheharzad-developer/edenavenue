# Eden Avenue Management

Property management system with web admin panel, PWA for residents, and native mobile app.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## 📚 Documentation

All documentation is in the `docs/` folder:

- **`docs/DEPLOYMENT.md`** - Production deployment guide (NGINX, SSL, Cloudflare, PM2)
- **`docs/PWA_SETUP.md`** - Progressive Web App setup and configuration
- **`mobile/docs/`** - Mobile app documentation

## 🏗️ Project Structure

```
eden-avenue/
├── src/              # Next.js application
├── prisma/           # Database schema and migrations
├── public/           # Static assets (PWA files, icons)
├── docs/             # Documentation
└── mobile/           # React Native mobile app
```

## 📱 Features

### Web Admin Panel

- ✅ Dashboard with analytics
- ✅ Resident management
- ✅ Staff management
- ✅ Maintenance requests
- ✅ Notices/Announcements
- ✅ Property/Unit management

### PWA (Resident App Lite)

- ✅ Install to home screen
- ✅ Offline support
- ✅ Push notifications
- ✅ Mobile-optimized UI

### Mobile App (React Native)

- ✅ Native iOS/Android app
- ✅ Camera integration
- ✅ Real-time notifications
- ✅ Chat with management
- ✅ Payments integration
- ✅ Resident verification

## 🔧 Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** NextAuth.js
- **Mobile:** React Native + Expo
- **PWA:** Service Worker, Web Push API

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking

## 🚀 Deployment

See `docs/DEPLOYMENT.md` for detailed deployment instructions including:

- Server setup
- NGINX configuration
- SSL certificate setup
- Cloudflare configuration
- PM2 process management

## 📝 License

Private project
