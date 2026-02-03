# 🚀 Manual Netlify Deployment Guide

This guide covers deploying the SUVIDHA 2026 frontend to Netlify manually using the dist folder while maintaining full localhost development functionality.

## 🎯 Overview

This setup supports:

- ✅ **Localhost Development**: `http://localhost:3000` → `http://localhost:5000/api`
- ✅ **Manual Netlify Deployment**: Drag & drop dist folder to Netlify
- ✅ **Environment Switching**: Easy switching between local/remote/production
- ✅ **No Code Changes**: Same codebase works in all environments

## 🏠 Local Development Setup

### Quick Start

```bash
# Ensure you're in local development mode
cd frontend
npm run env:local

# Start development server
npm run dev
```

### Environment Management

```bash
# List available environments
npm run env:list

# Switch to local development (localhost:5000)
npm run env:local

# Switch to remote development (your remote server)
npm run env:remote

# Create production environment file
npm run env:production
```

## 🌐 Manual Netlify Deployment

### Step 1: Prepare Production Environment

```bash
cd frontend

# Create production environment file
npm run env:production

# Edit .env.production with your backend URL
# VITE_API_BASE_URL=https://your-backend.vercel.app/api
# VITE_APP_ENV=production
```

### Step 2: Build for Production

```bash
# Build optimized production bundle
npm run build:netlify
```

This script will:

- ✅ Validate environment configuration
- ✅ Clean previous builds
- ✅ Install dependencies
- ✅ Build optimized production bundle
- ✅ Verify build integrity
- ✅ Calculate build size
- ✅ Prepare deployment info

### Step 3: Deploy to Netlify

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Click "Add new site"** → **"Deploy manually"**
3. **Drag & Drop**: Drag the entire `frontend/dist` folder to Netlify
4. **Wait for deployment** (usually 1-2 minutes)
5. **Test your site** at the provided Netlify URL

### Step 4: Configure Custom Domain (Optional)

1. Go to **Site Settings** → **Domain management**
2. Add your custom domain
3. Configure DNS settings as instructed

## 🔧 Environment Configuration Details

### Local Development (`.env.local`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

### Remote Development (`.env`)

```env
VITE_API_BASE_URL=http://13.60.195.81:5000/api
VITE_APP_ENV=development
```

### Production (`.env.production`)

```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
VITE_APP_ENV=production
```

## 📋 Available Scripts

### Development Scripts

```bash
npm run dev              # Start development server (port 3000)
npm run preview          # Preview production build locally
npm run serve            # Serve build on port 3000
```

### Build Scripts

```bash
npm run build:netlify    # Build for manual Netlify deployment
npm run build:production # Build with production mode
npm run build:local      # Build with development mode
```

### Environment Scripts

```bash
npm run env:list         # List all environments
npm run env:local        # Switch to localhost development
npm run env:remote       # Switch to remote development
npm run env:production   # Create production environment
```

### Deployment Scripts

```bash
npm run deploy:manual    # Complete manual deployment build
npm run deploy:verify    # Verify build integrity
```

## 🧪 Testing Your Setup

### Test Local Development

```bash
# 1. Switch to local environment
npm run env:local

# 2. Start development server
npm run dev

# 3. Open http://localhost:3000
# 4. Verify API calls go to localhost:5000
```

### Test Production Build

```bash
# 1. Create production environment
npm run env:production

# 2. Update .env.production with your backend URL

# 3. Build for production
npm run build:netlify

# 4. Preview locally
npm run preview

# 5. Test at http://localhost:3000
```

## 🔍 Troubleshooting

### Build Issues

```bash
# Clear node_modules and rebuild
rm -rf node_modules dist
npm install
npm run build:netlify
```

### Environment Issues

```bash
# Check current environment
npm run env:list

# Reset to local development
npm run env:local
```

### API Connection Issues

1. **Local Development**: Ensure backend runs on port 5000
2. **Production**: Verify `VITE_API_BASE_URL` in `.env.production`
3. **CORS**: Ensure backend allows your Netlify domain

### Netlify Deployment Issues

1. **404 on Routes**: Ensure `_redirects` file exists in dist
2. **API Errors**: Check backend URL in production environment
3. **Build Size**: Optimize if build is >10MB

## 📊 Build Analysis

After running `npm run build:netlify`, you'll see:

```
📊 Build size: 0.36 MB
📁 Total files: 8
🎉 Build Ready for Manual Netlify Deployment!

📋 Next Steps:
1. Go to Netlify Dashboard (https://app.netlify.com)
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the entire "dist" folder
```

## 🔄 Development Workflow

### Daily Development

```bash
# Start local development
npm run env:local
npm run dev
```

### Deploy Updates

```bash
# Build for production
npm run build:netlify

# Drag & drop dist folder to Netlify
# (or use Netlify CLI: netlify deploy --prod --dir=dist)
```

### Switch Environments

```bash
# Work with remote backend
npm run env:remote
npm run dev

# Back to local
npm run env:local
npm run dev
```

## 🎯 Best Practices

### Environment Management

- ✅ Always use `npm run env:local` for localhost development
- ✅ Use `npm run env:remote` when testing with remote backend
- ✅ Create `.env.production` only when ready to deploy
- ✅ Never commit `.env.production` with real URLs

### Build Process

- ✅ Always run `npm run build:netlify` for production builds
- ✅ Test production build locally with `npm run preview`
- ✅ Verify build size and file count before deployment
- ✅ Keep build artifacts in `dist/` folder clean

### Deployment Process

- ✅ Update backend URL in `.env.production` before building
- ✅ Test API connectivity after deployment
- ✅ Verify all routes work (no 404s)
- ✅ Check browser console for errors

## 🚨 Important Notes

### File Priorities (Vite Environment Loading)

1. `.env.local` (highest priority for local development)
2. `.env.production` (used when building with --mode production)
3. `.env` (fallback for remote development)

### Backend CORS Configuration

Ensure your backend allows your Netlify domain:

```javascript
// In backend CORS configuration
origin: [
  "http://localhost:3000", // Local development
  "https://your-app.netlify.app", // Netlify deployment
  "https://your-custom-domain.com", // Custom domain
];
```

---

## 🎉 You're All Set!

Your SUVIDHA 2026 frontend now supports:

- ✅ **Seamless localhost development** on port 3000
- ✅ **Manual Netlify deployment** via drag & drop
- ✅ **Environment switching** without code changes
- ✅ **Production-ready builds** with optimization

Happy coding and deploying! 🚀
