# 🚀 SUVIDHA 2026 - Deployment Guide

This guide covers deploying the SUVIDHA 2026 backend to Vercel and frontend to Netlify.

## 📋 Prerequisites

- Node.js 18+ installed locally
- MongoDB Atlas account (for production database)
- GitHub account
- Vercel account
- Netlify account

## 🔧 Local Development Setup

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd suvidha-2026
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Update backend/.env with your local settings
```

### 3. Database Setup
```bash
# Seed the database with demo data
npm run seed

# Or clear and reseed
npm run reseed
```

### 4. Start Development Server
```bash
# Start backend server
npm run dev

# Server will run on http://localhost:5001
```

## 🌐 Production Deployment

### Backend Deployment (Vercel)

#### 1. Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### 2. Deploy to Vercel

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set root directory to current directory
# - Override settings: No
```

**Option B: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

#### 3. Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

```bash
# Required Variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/suvidha_prod
JWT_SECRET=your-super-secure-production-jwt-secret-256-bits-minimum
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!

# Frontend URLs (for CORS)
FRONTEND_URL=https://your-app.netlify.app
FRONTEND_URL_WWW=https://www.your-domain.com

# Optional Variables
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
BCRYPT_ROUNDS=12
```

#### 4. Deploy and Test
```bash
# Trigger deployment
git push origin main

# Your API will be available at:
# https://your-project.vercel.app/api
```

### Frontend Deployment (Netlify)

#### 1. Prepare Frontend
```bash
cd frontend

# Create production environment file
cp .env.example .env.production

# Update .env.production with your Vercel backend URL
echo "VITE_API_BASE_URL=https://your-backend.vercel.app/api" > .env.production
```

#### 2. Deploy to Netlify

**Option A: Netlify CLI**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**Option B: Netlify Dashboard**
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

#### 3. Configure Environment Variables

In Netlify Dashboard → Site → Settings → Environment Variables:

```bash
VITE_API_BASE_URL=https://your-backend.vercel.app/api
VITE_APP_NAME=SUVIDHA 2026
VITE_ENVIRONMENT=production
```

## 🔍 Testing Production Deployment

### 1. Backend Health Check
```bash
curl https://your-backend.vercel.app/health
```

### 2. API Endpoints Test
```bash
# Test admin login
curl -X POST https://your-backend.vercel.app/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"YourPassword"}'
```

### 3. Frontend Test
- Visit your Netlify URL
- Test all user flows (citizen, officer, admin)
- Check browser console for errors

## 🛠️ Troubleshooting

### Common Issues

#### Backend Issues
1. **500 Internal Server Error**
   - Check Vercel function logs
   - Verify environment variables
   - Check MongoDB connection

2. **CORS Errors**
   - Verify FRONTEND_URL in environment variables
   - Check CORS configuration in app.js

3. **Database Connection Issues**
   - Verify MONGODB_URI format
   - Check MongoDB Atlas network access
   - Ensure database user has proper permissions

#### Frontend Issues
1. **API Connection Failed**
   - Verify VITE_API_BASE_URL
   - Check network tab in browser dev tools
   - Ensure backend is deployed and running

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript/ESLint errors

### Monitoring and Logs

#### Vercel Logs
```bash
# View function logs
vercel logs

# View specific deployment logs
vercel logs --follow
```

#### Netlify Logs
- Check deploy logs in Netlify dashboard
- Monitor function logs if using Netlify functions

## 🔒 Security Checklist

- [ ] Strong JWT secret (256+ bits)
- [ ] Secure admin password
- [ ] HTTPS enabled (automatic with Vercel/Netlify)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] No sensitive data in logs

## 📊 Performance Optimization

### Backend (Vercel)
- Connection pooling enabled
- Database queries optimized
- Response caching where appropriate
- Serverless function cold start minimized

### Frontend (Netlify)
- Static assets optimized
- CDN enabled (automatic)
- Gzip compression enabled
- Image optimization

## 🔄 Continuous Deployment

### Automatic Deployment
Both Vercel and Netlify support automatic deployment:

1. **Push to main branch** → Automatic production deployment
2. **Push to develop branch** → Preview deployment (configure in settings)
3. **Pull requests** → Preview deployments for testing

### Manual Deployment
```bash
# Backend
vercel --prod

# Frontend
cd frontend && netlify deploy --prod --dir=dist
```

## 📝 Environment Variables Reference

### Backend (Vercel)
| Variable | Required | Description |
|----------|----------|-------------|
| NODE_ENV | Yes | Set to "production" |
| MONGODB_URI | Yes | MongoDB connection string |
| JWT_SECRET | Yes | JWT signing secret (256+ bits) |
| ADMIN_EMAIL | Yes | Super admin email |
| ADMIN_PASSWORD | Yes | Super admin password |
| FRONTEND_URL | Yes | Frontend URL for CORS |
| CLOUDINARY_* | No | File upload service |

### Frontend (Netlify)
| Variable | Required | Description |
|----------|----------|-------------|
| VITE_API_BASE_URL | Yes | Backend API URL |
| VITE_APP_NAME | No | Application name |
| VITE_ENVIRONMENT | No | Environment identifier |

## 🎯 Production URLs

After successful deployment:

- **Backend API**: `https://your-project.vercel.app/api`
- **Frontend App**: `https://your-app.netlify.app`
- **Admin Panel**: `https://your-app.netlify.app/admin/login`

## 📞 Support

For deployment issues:
1. Check this documentation
2. Review Vercel/Netlify documentation
3. Check GitHub issues
4. Contact development team

---

**🎉 Congratulations! Your SUVIDHA 2026 application is now live in production!**