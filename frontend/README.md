# SUVIDHA 2026 - Frontend

Smart City Kiosk System Frontend built with React, Vite, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── LanguageSwitcher.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/            # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── LanguageContext.jsx
│   ├── locales/            # Language files
│   │   ├── en.json
│   │   └── hi.json
│   ├── pages/              # Page components
│   │   ├── Landing.jsx
│   │   ├── citizen/
│   │   ├── officer/
│   │   └── admin/
│   ├── routes/             # Route configuration
│   │   └── AppRoutes.jsx
│   ├── services/           # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── complaintService.js
│   │   ├── departmentService.js
│   │   └── officerService.js
│   ├── utils/              # Utility functions
│   │   └── constants.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Features

### Authentication
- **Citizen**: Mobile + OTP authentication
- **Officer**: Officer ID + Password
- **Admin**: Email + Password
- JWT token management
- Automatic token refresh

### Role-Based Access
- Protected routes with role guards
- Automatic redirects based on user role
- Role-specific dashboards

### Language Support
- English (EN)
- Hindi (HI)
- Seamless language switching
- JSON-based translations

### File Upload
- Multi-file upload support
- Image preview
- File type validation
- Size limits (10MB per file, 5 files max)

### Kiosk-Optimized UI
- Large, touch-friendly buttons
- High contrast design
- Minimal text
- Responsive layout

## 🔐 User Roles

### PUBLIC (Citizen)
- Register/Login via mobile + OTP
- Create complaints with documents
- Track complaint status
- Download receipts
- View own complaints only

### OFFICER
- Login via Officer ID + Password
- View complaints from assigned sub-department only
- Update complaint status
- Add remarks
- Assign complaints to themselves

### ADMIN
- Login via Email + Password
- Full system access
- Manage departments
- Manage sub-departments
- Manage officers
- View all complaints

## 📱 Pages

### Public Pages
- `/` - Landing page with role selection

### Citizen Pages
- `/citizen/login` - Login/Register with OTP
- `/citizen/dashboard` - Citizen dashboard
- `/citizen/new-complaint` - Create new complaint
- `/citizen/track-complaint` - Track complaint details

### Officer Pages
- `/officer/login` - Officer login
- `/officer/dashboard` - Officer dashboard

### Admin Pages
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/departments` - Manage departments
- `/admin/subdepartments` - Manage sub-departments
- `/admin/officers` - Manage officers

## 🛠️ Technologies

- **React 18** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **JWT Decode** - Token decoding

## 📝 Development Notes

### API Integration
- All API calls are made through service files in `src/services/`
- Axios instance configured with interceptors for authentication
- Base URL configurable via environment variables

### State Management
- React Context for global state (Auth, Language)
- Local state for component-specific data
- No external state management library required

### Styling
- Tailwind CSS utility classes
- Custom kiosk-mode styles in `index.css`
- Responsive design with mobile-first approach

### Language Switching
- Context-based language management
- JSON translation files
- No page reload required

## 🚀 Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. The `dist` folder contains the production build

3. Deploy `dist` folder to your hosting service:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Any static hosting service

4. Configure environment variables in your hosting platform

## 🔧 Configuration

### Vite Configuration
- Proxy configured for API calls in development
- Port: 3000 (default)
- API proxy: `/api` → `http://localhost:5000/api`

### Tailwind Configuration
- Custom colors (primary, secondary)
- Kiosk-specific font sizes and spacing
- Custom utility classes

## 📚 API Integration

The frontend integrates with the backend API:

- Base URL: `http://localhost:5000/api` (development)
- All endpoints follow REST conventions
- JWT authentication required for protected routes
- File uploads use `multipart/form-data`

## 🐛 Troubleshooting

### CORS Issues
- Ensure backend CORS is configured correctly
- Check `FRONTEND_URL` in backend `.env`

### Authentication Issues
- Clear localStorage if token is invalid
- Check token expiration
- Verify JWT_SECRET matches backend

### File Upload Issues
- Check file size (max 10MB)
- Verify file types are allowed
- Ensure Cloudinary credentials are configured

## 📄 License

ISC

---

**Built for C-DAC Hackathon 2026**
