# 🏛️ SUVIDHA 2026 Frontend - Government Complaint Management

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/suvidha-2026)

A modern, responsive React frontend for the SUVIDHA 2026 Government Complaint Management System.

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Verify build is ready
npm run deploy:verify
```

## 📋 Environment Configuration

### Development
- Automatically uses `http://localhost:5001/api`
- Hot reload enabled
- Debug logging active

### Production (Netlify)
Set these environment variables in Netlify:
```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
VITE_APP_ENV=production
```

## 🏗️ Architecture

### Tech Stack
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client with interceptors
- **Lucide React** - Modern icon library

### Key Features
- **Multi-language Support** - Hindi/English
- **Responsive Design** - Mobile-first approach
- **Role-based Access** - Citizen, Officer, Admin interfaces
- **Environment Aware** - Automatic dev/prod configuration
- **PWA Ready** - Progressive Web App capabilities

## 🎯 User Interfaces

### 👥 Citizens
- **Login**: Mobile number + OTP
- **Dashboard**: Complaint overview and quick actions
- **New Complaint**: Submit complaints with file uploads
- **Track Complaint**: Real-time status tracking

### 👮 Officers
- **Login**: Officer ID + Password
- **Dashboard**: Assigned complaints management
- **Complaint Details**: Update status and add remarks

### 🏛️ Administrators
- **Login**: Email + Password
- **Dashboard**: System overview and statistics
- **Department Management**: Create and manage departments
- **Officer Management**: Create, transfer, and manage officers

## 📱 Pages Structure

```
src/
├── pages/
│   ├── Landing.jsx              # Home page
│   ├── citizen/
│   │   ├── CitizenLogin.jsx     # OTP-based login
│   │   ├── CitizenDashboard.jsx # Complaint overview
│   │   ├── NewComplaint.jsx     # Submit new complaint
│   │   └── TrackComplaint.jsx   # Track complaint status
│   ├── officer/
│   │   ├── OfficerLogin.jsx     # Officer authentication
│   │   └── OfficerDashboard.jsx # Manage assigned complaints
│   └── admin/
│       ├── AdminLogin.jsx       # Admin authentication
│       ├── AdminDashboard.jsx   # System overview
│       ├── AdminDepartments.jsx # Department management
│       ├── AdminSubDepartments.jsx # Sub-department management
│       └── AdminOfficers.jsx    # Officer management
```

## 🔧 Configuration Files

### Netlify Configuration (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Vite Configuration (`vite.config.js`)
- Development proxy to backend
- Production build optimization
- Code splitting and chunk optimization
- Environment-aware configuration

### Environment Files
- `.env.local` - Local development
- `.env` - Remote development/testing
- `.env.production` - Production template

## 🚀 Deployment

### Netlify (Recommended)
1. **Connect Repository**
   ```bash
   # Push to GitHub
   git push origin main
   ```

2. **Configure Netlify**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Set Environment Variables**
   ```env
   VITE_API_BASE_URL=https://your-backend.vercel.app/api
   VITE_APP_ENV=production
   ```

4. **Deploy**
   - Automatic deployment on git push
   - Manual deployment via Netlify CLI

### Manual Deployment
```bash
# Prepare deployment
npm run deploy:prepare

# Build and verify
npm run deploy:netlify

# Deploy with Netlify CLI
netlify deploy --prod
```

## 🧪 Testing

### Local Testing
```bash
# Test development server
npm run dev

# Test production build
npm run build
npm run preview

# Verify build integrity
npm run deploy:verify
```

### Production Testing
- Test all user flows
- Verify API connectivity
- Check responsive design
- Test authentication flows

## 🔒 Security Features

- **Content Security Policy** - XSS protection
- **HTTPS Enforcement** - Secure connections only
- **Token-based Auth** - JWT authentication
- **Environment Isolation** - Separate dev/prod configs
- **Input Validation** - Client-side validation

## 📊 Performance

### Build Optimization
- **Code Splitting** - Vendor and route-based chunks
- **Tree Shaking** - Remove unused code
- **Minification** - Compressed assets
- **Caching** - Optimized cache headers

### Runtime Performance
- **Lazy Loading** - Route-based code splitting
- **Image Optimization** - Responsive images
- **API Caching** - Intelligent request caching
- **Bundle Size** - Optimized dependencies

## 🌐 Multi-language Support

### Supported Languages
- **English** - Default language
- **Hindi** - हिंदी भाषा समर्थन

### Language Features
- Dynamic language switching
- Persistent language preference
- RTL support ready
- Localized date/time formats

## 🎨 UI/UX Features

### Design System
- **Consistent Colors** - Government-appropriate palette
- **Typography** - Readable fonts and sizes
- **Spacing** - Consistent margins and padding
- **Components** - Reusable UI components

### Accessibility
- **WCAG Compliant** - Web accessibility standards
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader** - ARIA labels and descriptions
- **High Contrast** - Accessible color combinations

## 📱 Mobile Experience

### Responsive Design
- **Mobile First** - Optimized for mobile devices
- **Touch Friendly** - Large touch targets
- **Fast Loading** - Optimized for mobile networks
- **Offline Ready** - PWA capabilities

### PWA Features
- **App Manifest** - Install as native app
- **Service Worker** - Offline functionality
- **Push Notifications** - Real-time updates
- **App Icons** - Native app experience

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm 8+
- Modern browser

### Setup
```bash
# Clone repository
git clone <repo-url>
cd frontend

# Install dependencies
npm install

# Start development
npm run dev
```

### Available Scripts
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run deploy:prepare   # Prepare for deployment
npm run deploy:verify    # Verify build integrity
npm run deploy:netlify   # Build and verify for Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@suvidha2026.gov.in
- Documentation: [Deployment Guide](DEPLOYMENT.md)

---

**Built with ❤️ for Digital India Initiative**

[![Made in India](https://img.shields.io/badge/Made%20in-India-orange?style=for-the-badge)](https://en.wikipedia.org/wiki/India)
[![Digital India](https://img.shields.io/badge/Digital-India-green?style=for-the-badge)](https://digitalindia.gov.in/)