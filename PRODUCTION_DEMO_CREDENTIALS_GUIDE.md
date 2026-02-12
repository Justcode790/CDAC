# Production Demo Credentials - Configuration Guide

## Overview
Demo credentials are now enabled for production deployment. You have full control via environment variables.

---

## 🚀 Production Deployment with Demo Credentials

### Backend Configuration

**File: `backend/.env` or Vercel Environment Variables**

```env
# Enable demo credentials in production
SHOW_DEMO_CREDENTIALS=true
NODE_ENV=production

# Other required variables
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@suvidha.gov.in
ADMIN_PASSWORD=123456
```

### Frontend Configuration

**File: `frontend/.env.production`**

```env
# Backend API URL
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api

# Enable demo credentials in production
VITE_SHOW_DEMO_CREDENTIALS=true

# App environment
VITE_APP_ENV=production
```

---

## 🎯 Deployment Platforms

### Vercel (Backend)

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following:

```
SHOW_DEMO_CREDENTIALS = true
NODE_ENV = production
MONGODB_URI = your_connection_string
JWT_SECRET = your_secret
ADMIN_EMAIL = admin@suvidha.gov.in
ADMIN_PASSWORD = 123456
```

### Netlify (Frontend)

1. Go to your Netlify site settings
2. Navigate to "Build & deploy" → "Environment"
3. Add the following:

```
VITE_API_BASE_URL = https://your-backend.vercel.app/api
VITE_SHOW_DEMO_CREDENTIALS = true
VITE_APP_ENV = production
```

---

## 🔧 Control Demo Credentials

### To ENABLE Demo Credentials:

**Backend:**
```env
SHOW_DEMO_CREDENTIALS=true
```

**Frontend:**
```env
VITE_SHOW_DEMO_CREDENTIALS=true
```

### To DISABLE Demo Credentials:

**Backend:**
```env
SHOW_DEMO_CREDENTIALS=false
# or remove the variable entirely
```

**Frontend:**
```env
VITE_SHOW_DEMO_CREDENTIALS=false
# or remove the variable entirely
```

---

## 📊 How It Works

### Backend Logic:
```javascript
// Allows demo credentials if flag is explicitly set to 'true'
const isDemoMode = process.env.SHOW_DEMO_CREDENTIALS === 'true';

if (!isDemoMode) {
  return res.status(403).json({
    success: false,
    message: 'Demo credentials are not available'
  });
}
```

### Frontend Logic:
```javascript
// Shows component only if flag is 'true'
const isDemoMode = import.meta.env.VITE_SHOW_DEMO_CREDENTIALS === 'true';

if (!isDemoMode) {
  return null; // Component doesn't render
}
```

---

## 🎨 Production Landing Page

When enabled, the landing page will show:

**Left Side (2/3 width):**
- SUVIDHA 2026 branding
- Role selection buttons
- Footer information

**Right Side (1/3 width):**
- Demo credentials card
- Collapsible sections
- Copy-to-clipboard
- Direct login buttons

---

## 🔐 Security Considerations

### Why This is Acceptable for Hackathon:

✅ **Controlled Access**: Only enabled when you explicitly set the flag
✅ **Demo Passwords**: Using simple passwords (123456) for demo
✅ **Clear Labeling**: Obvious "Demo Mode" warnings
✅ **Easy Toggle**: Can disable anytime by changing env variable
✅ **Evaluator Friendly**: Makes testing all roles easy

### Best Practices:

1. **After Hackathon**: Set `SHOW_DEMO_CREDENTIALS=false`
2. **Change Passwords**: Update all demo passwords
3. **Remove Demo Users**: Clean up demo accounts if not needed
4. **Monitor Access**: Check who's using demo credentials
5. **Add Rate Limiting**: Prevent abuse of demo accounts

---

## 🧪 Testing Production Build

### Test Locally:

```bash
# Backend
cd backend
NODE_ENV=production SHOW_DEMO_CREDENTIALS=true npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Verify:
1. Open `http://localhost:4173` (or preview URL)
2. Check if credentials are visible on right side
3. Test copy-to-clipboard functionality
4. Test login navigation buttons

---

## 📱 Responsive Behavior

### Desktop (1920x1080):
- Two-column layout
- Credentials sticky on right
- Full visibility

### Tablet (768px - 1024px):
- Two-column layout maintained
- Credentials scroll with page
- Touch-optimized

### Mobile (< 768px):
- Single column layout
- Credentials below main content
- Collapsible sections
- Large touch targets

---

## 🚨 Quick Disable Guide

If you need to quickly disable demo credentials in production:

### Option 1: Environment Variables (Recommended)
```bash
# Vercel
vercel env rm SHOW_DEMO_CREDENTIALS production

# Netlify
# Go to Site Settings → Environment → Delete VITE_SHOW_DEMO_CREDENTIALS
```

### Option 2: Redeploy with Updated .env
```bash
# Update .env files
SHOW_DEMO_CREDENTIALS=false
VITE_SHOW_DEMO_CREDENTIALS=false

# Redeploy
git add .
git commit -m "Disable demo credentials"
git push
```

### Option 3: Code Comment (Emergency)
```javascript
// In DemoCredentials.jsx
const isDemoMode = false; // Force disable
```

---

## 📋 Deployment Checklist

### Before Hackathon:
- [x] Set `SHOW_DEMO_CREDENTIALS=true` in backend
- [x] Set `VITE_SHOW_DEMO_CREDENTIALS=true` in frontend
- [x] Run `npm run seed` to populate demo data
- [x] Test credentials display on landing page
- [x] Verify all login flows work
- [x] Test on mobile devices

### After Hackathon:
- [ ] Decide if keeping demo credentials
- [ ] If keeping: Change all passwords
- [ ] If removing: Set flags to `false`
- [ ] Clean up demo user accounts
- [ ] Update documentation
- [ ] Notify users of changes

---

## 🎯 Current Configuration

### Development:
```env
# Backend
SHOW_DEMO_CREDENTIALS=true
NODE_ENV=development

# Frontend
VITE_SHOW_DEMO_CREDENTIALS=true
VITE_APP_ENV=development
```

### Production (Hackathon):
```env
# Backend
SHOW_DEMO_CREDENTIALS=true
NODE_ENV=production

# Frontend
VITE_SHOW_DEMO_CREDENTIALS=true
VITE_APP_ENV=production
```

---

## 📞 Support

If you need to modify this behavior:

1. **Backend**: Edit `backend/controllers/demoController.js`
2. **Frontend**: Edit `frontend/src/components/DemoCredentials.jsx`
3. **Environment**: Update `.env` files
4. **Styling**: Modify component CSS classes

---

## ✅ Status: PRODUCTION READY

Demo credentials are now configured to work in production. You have full control via environment variables and can enable/disable anytime.

**Current State:**
- ✅ Works in development
- ✅ Works in production (when enabled)
- ✅ Easy to toggle on/off
- ✅ Secure and controlled
- ✅ Hackathon ready

**You're all set for the hackathon evaluation!** 🎉
