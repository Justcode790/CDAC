# 🚀 SUVIDHA 2026 - Complete Deployment Guide

This guide covers the complete setup for both **localhost development** and **manual Netlify deployment** without requiring any code changes.

## 🎯 Overview

Your SUVIDHA 2026 application now supports:
- ✅ **Localhost Development**: Backend (port 5000) + Frontend (port 3000)
- ✅ **Manual Netlify Deployment**: Drag & drop dist folder
- ✅ **Environment Switching**: Easy switching between local/remote/production
- ✅ **No Code Changes**: Same codebase works everywhere
- ✅ **CORS Fixed**: All cross-origin issues resolved

## 🏠 Localhost Development

### Quick Start
```bash
# 1. Start Backend (Port 5000)
npm run dev

# 2. Start Frontend (Port 3000) - New Terminal
cd frontend
npm run env:local  # Ensure local environment
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health**: http://localhost:5000/api/health

### Demo Credentials
- **Super Admin**: admin@suvidha.gov.in / 123456
- **Officer**: MUN_WORKS_2026_0011 / 123456
- **Citizen**: 9876543210 + OTP

## 🌐 Manual Netlify Deployment

### Step 1: Prepare Production Environment
```bash
cd frontend

# Create production environment file
npm run env:production

# Edit .env.production with your backend URL
# VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

### Step 2: Build for Netlify
```bash
# Build optimized production bundle
npm run build:netlify
```

### Step 3: Deploy to Netlify
1. Go to **Netlify Dashboard**: https://app.netlify.com
2. Click **"Add new site"** → **"Deploy manually"**
3. **Drag & Drop** the entire `frontend/dist` folder
4. **Wait for deployment** (1-2 minutes)
5. **Test your site** at the provided URL

## 🔧 Environment Management

### Available Environments
```bash
# List all environments
npm run env:list

# Switch to local development (localhost:5000)
npm run env:local

# Switch to remote development (your remote server)
npm run env:remote

# Create/switch to production environment
npm run env:production
```

### Environment Files
- **`.env.local`**: Local development (localhost:5000)
- **`.env`**: Remote development/testing
- **`.env.production`**: Production deployment (Netlify)

## 📋 Complete Command Reference

### Root Directory (Backend)
```bash
npm run dev              # Start backend (port 5000)
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run dev:both         # Start both servers
npm run seed             # Seed database with demo data
```

### Frontend Directory
```bash
# Development
npm run dev              # Start development server (port 3000)
npm run preview          # Preview production build

# Environment Management
npm run env:list         # List all environments
npm run env:local        # Switch to localhost
npm run env:remote       # Switch to remote server
npm run env:production   # Create production environment

# Building & Deployment
npm run build:netlify    # Build for manual Netlify deployment
npm run build:production # Build with production optimizations
npm run deploy:manual    # Complete manual deployment process

# Setup
npm run setup            # Quick setup for new installations
```

## 🧪 Testing Your Setup

### Test Localhost Development
```bash
# 1. Ensure local environment
cd frontend
npm run env:local

# 2. Start both servers
cd ..
npm run dev:both

# 3. Test in browser
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api/health
```

### Test Production Build
```bash
# 1. Create production environment
cd frontend
npm run env:production

# 2. Update .env.production with your backend URL

# 3. Build and test
npm run build:netlify
npm run preview

# 4. Test at http://localhost:3000
```

## 🔍 Troubleshooting

### CORS Issues ✅ **RESOLVED**
The CORS configuration has been updated to support all required headers including custom environment headers.

### Port Conflicts
```bash
# Check what's using the ports
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill processes if needed
taskkill /PID <PID_NUMBER> /F
```

### Environment Issues
```bash
# Reset to local development
npm run env:local

# Check current environment
npm run env:list

# Clear and reinstall
rm -rf node_modules
npm install
```

### Build Issues
```bash
# Clear build cache
cd frontend
rm -rf dist node_modules
npm install
npm run build:netlify
```

## 🎯 Development Workflow

### Daily Development
```bash
# Start development environment
npm run dev:both

# Or start separately:
# Terminal 1: npm run dev (backend)
# Terminal 2: cd frontend && npm run dev (frontend)
```

### Deploy Updates to Netlify
```bash
# 1. Build for production
cd frontend
npm run build:netlify

# 2. Drag & drop dist folder to Netlify
# (or use Netlify CLI: netlify deploy --prod --dir=dist)
```

### Switch Between Environments
```bash
# Work with remote backend
npm run env:remote
npm run dev

# Back to localhost
npm run env:local
npm run dev
```

## 🔒 Security & Best Practices

### Environment Variables
- ✅ Never commit `.env.production` with real URLs
- ✅ Use `.env.local` for localhost development
- ✅ Keep production URLs secure
- ✅ Use HTTPS URLs in production

### CORS Configuration
- ✅ Backend allows localhost:3000 for development
- ✅ Add your Netlify domain to backend CORS
- ✅ Custom headers properly configured

### Build Optimization
- ✅ Code splitting enabled
- ✅ Vendor chunks separated
- ✅ Production minification
- ✅ Asset optimization

## 📊 Build Analysis

After running `npm run build:netlify`:
```
📊 Build size: 0.36 MB
📁 Total files: 8
🎉 Build Ready for Manual Netlify Deployment!

Dist folder path: /path/to/frontend/dist
```

## 🚨 Production CORS Fix

If you're getting CORS errors after deploying to Netlify + Vercel:

### Quick Fix
```bash
# Get your Netlify URL from dashboard, then run:
node scripts/fix-production-cors.js https://your-app.netlify.app
```

### Manual Fix
1. **Update Vercel Environment Variables**:
   - `FRONTEND_URL=https://your-app.netlify.app`
   - `NODE_ENV=production`

2. **Redeploy backend to Vercel**

3. **Test the fix**

For detailed instructions, see `PRODUCTION_CORS_FIX.md`

## 🌐 Backend CORS Configuration

Ensure your backend includes your Netlify domain:
```javascript
// In backend/app.js CORS configuration
origin: [
  'http://localhost:3000',           // Local development
  'https://your-app.netlify.app',    // Netlify deployment
  'https://your-custom-domain.com'   // Custom domain
]
```

## 📁 Project Structure

```
suvidha-2026/
├── backend/                 # Backend API (Port 5000)
│   ├── app.js              # CORS configured
│   ├── server.js           # Main server
│   └── ...
├── frontend/               # Frontend React App (Port 3000)
│   ├── dist/              # Production build (for Netlify)
│   ├── scripts/           # Deployment scripts
│   ├── .env.local         # Local development
│   ├── .env               # Remote development
│   ├── .env.production    # Production deployment
│   └── ...
├── package.json           # Root scripts
└── DEPLOYMENT_COMPLETE_GUIDE.md
```

## ✅ Verification Checklist

### Local Development
- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 3000
- [ ] API calls work without CORS errors
- [ ] All login flows work
- [ ] Database operations work

### Production Deployment
- [ ] `.env.production` configured with backend URL
- [ ] Build completes without errors
- [ ] Dist folder contains all required files
- [ ] Netlify deployment successful
- [ ] All routes accessible (no 404s)
- [ ] API calls work from production
- [ ] Authentication flows work

---

## 🎉 You're All Set!

Your SUVIDHA 2026 application now has:
- ✅ **Perfect localhost development** setup
- ✅ **Manual Netlify deployment** capability
- ✅ **Environment switching** without code changes
- ✅ **CORS issues resolved**
- ✅ **Production-ready builds**

**Happy coding and deploying!** 🚀

For specific guides, see:
- `frontend/MANUAL_NETLIFY_DEPLOYMENT.md` - Detailed Netlify deployment
- `LOCALHOST_SETUP.md` - Localhost development setup
- `CORS_FIX_GUIDE.md` - CORS troubleshooting