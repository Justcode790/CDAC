# 🚀 SUVIDHA 2026 Frontend - Netlify Deployment Guide

This guide covers deploying the SUVIDHA 2026 frontend to both local development and Netlify production environments.

## 📋 Prerequisites

- Node.js 18+ installed
- npm 8+ installed
- Netlify account
- GitHub repository
- Backend deployed (Vercel recommended)

## 🏠 Local Development Setup

### 1. Clone and Install
```bash
cd frontend
npm install
```

### 2. Environment Configuration
The app automatically detects the environment and uses appropriate configurations:

- **Local Development**: Uses `.env.local` (localhost:5001)
- **Remote Development**: Uses `.env` (your remote backend)
- **Production**: Uses Netlify environment variables

### 3. Start Development Server
```bash
npm run dev
```

### 4. Test Local Build
```bash
npm run build
npm run preview
```

## ☁️ Netlify Production Deployment

### 1. Prepare Repository
```bash
git add .
git commit -m "Prepare frontend for Netlify deployment"
git push origin main
```

### 2. Deploy to Netlify

#### Option A: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

#### Option B: Netlify Dashboard
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### 3. Environment Variables (Netlify Dashboard)
Set these in Netlify → Site Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
VITE_APP_ENV=production
```

Optional variables:
```env
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn
```

### 4. Test Production Deployment
- Your Netlify URL: `https://your-app.netlify.app`
- Test all routes and functionality
- Verify API connectivity with backend

## 🔧 Configuration Details

### Netlify.toml Configuration
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Detection
The application automatically detects the environment:
- `import.meta.env.DEV` → Development mode
- `import.meta.env.PROD` → Production mode
- Custom `VITE_APP_ENV` for additional control

### API Configuration
- **Development**: `http://localhost:5001/api`
- **Production**: Uses `VITE_API_BASE_URL` environment variable
- **Fallback**: Automatic environment-based URLs

## 🧪 Testing Deployment

### Local Testing
```bash
# Test development build
npm run dev

# Test production build locally
npm run build
npm run preview

# Run deployment preparation script
node scripts/deploy.js
```

### Production Testing
```bash
# Test all major routes
curl https://your-app.netlify.app
curl https://your-app.netlify.app/citizen/login
curl https://your-app.netlify.app/admin/login

# Test API connectivity (should redirect to backend)
curl https://your-app.netlify.app/api/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript/ESLint errors

2. **API Connection Issues**
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check CORS configuration on backend
   - Ensure backend is deployed and accessible

3. **Routing Issues (404 on refresh)**
   - Verify `_redirects` file exists in `public/`
   - Check `netlify.toml` redirect configuration
   - Ensure SPA redirect rule is active

4. **Environment Variables Not Working**
   - Redeploy after adding variables
   - Check variable names start with `VITE_`
   - Verify no typos in variable names

### Debug Commands
```bash
# Check build output
npm run build
ls -la dist/

# Test local preview
npm run preview

# Check environment variables
echo $VITE_API_BASE_URL

# Netlify CLI debugging
netlify dev
netlify logs
```

## 📊 Performance Optimization

### Build Optimization
- Code splitting enabled
- Vendor chunks separated
- Tree shaking active
- Minification enabled

### Caching Strategy
- Static assets: 1 year cache
- HTML files: No cache (always fresh)
- API calls: No cache

### Bundle Analysis
```bash
npm run build
# Check dist/ folder size and structure
```

## 🔒 Security Features

- Content Security Policy headers
- XSS protection
- Frame options security
- HTTPS enforcement in production
- Environment-based API URLs

## 📈 Monitoring

### Netlify Analytics
- Page views and unique visitors
- Top pages and referrers
- Bandwidth usage

### Performance Monitoring
- Core Web Vitals
- Load times
- Error tracking (if Sentry configured)

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Deployment
node scripts/deploy.js  # Check deployment readiness
netlify deploy --prod   # Deploy to production
netlify logs           # View deployment logs

# Debugging
netlify dev           # Local Netlify environment
netlify open          # Open site in browser
```

## 🌐 Multi-Environment Setup

### Development
- Local backend: `http://localhost:5001/api`
- Hot reload enabled
- Debug logging active

### Staging (Optional)
- Staging backend: `https://staging-backend.vercel.app/api`
- Production build with staging data

### Production
- Production backend: `https://your-backend.vercel.app/api`
- Optimized build
- Error tracking enabled

---

## 🎯 Deployment Checklist

- [ ] All environment variables set in Netlify
- [ ] Backend deployed and accessible
- [ ] CORS configured on backend for frontend domain
- [ ] Build completes successfully
- [ ] All routes work (no 404s)
- [ ] API calls work from production
- [ ] Authentication flows work
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable

Your SUVIDHA 2026 frontend is now ready for seamless Netlify deployment! 🚀