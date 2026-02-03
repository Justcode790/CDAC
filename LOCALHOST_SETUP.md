# 🏠 SUVIDHA 2026 - Localhost Development Setup

## 🎯 Port Configuration

- **Backend**: `http://localhost:5000/api`
- **Frontend**: `http://localhost:3000`

## 🚀 Quick Start Options

### Option 1: Start Both Servers Together (Recommended)
```bash
# Install dependencies for both backend and frontend
npm install
cd frontend && npm install && cd ..

# Start both servers simultaneously
npm run dev:both
```

### Option 2: Start Servers Separately

#### Terminal 1 - Backend (Port 5000)
```bash
# Start backend server
npm run dev:backend
# or
npm run dev
```

#### Terminal 2 - Frontend (Port 3000)
```bash
# Start frontend server
npm run dev:frontend
# or
cd frontend && npm run dev
```

## 🔧 Configuration Details

### Backend Configuration (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://...
```

### Frontend Configuration (`frontend/.env.local`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

## 🧪 Testing the Setup

### 1. Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Frontend Access
Open browser: `http://localhost:3000`

### 3. API Communication Test
- Login to frontend at `http://localhost:3000`
- Check browser network tab for API calls to `http://localhost:5000/api`

## 📋 Available Scripts

### Root Directory Scripts
```bash
npm run dev:both      # Start both backend and frontend
npm run dev:backend   # Start only backend (port 5000)
npm run dev:frontend  # Start only frontend (port 3000)
npm run seed          # Seed database with demo data
npm run reseed        # Clear and reseed database
```

### Backend Only Scripts
```bash
npm run dev           # Start backend development server
npm run start         # Start backend production server
```

### Frontend Only Scripts (from frontend/ directory)
```bash
cd frontend
npm run dev           # Start frontend development server
npm run build         # Build for production
npm run preview       # Preview production build
```

## 🔍 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

```bash
# Check what's using the ports
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill processes if needed (Windows)
taskkill /PID <PID_NUMBER> /F

# Or use different ports by updating .env files
```

### CORS Issues ✅ **RESOLVED**
The CORS configuration has been updated to support all required headers:

**If you still see CORS errors:**
1. Ensure backend `FRONTEND_URL` is set to `http://localhost:3000`
2. Restart backend server after changing .env
3. Clear browser cache (Ctrl+Shift+R)
4. Check backend logs for CORS debug messages

**Custom Headers Supported:**
- `X-Client-Environment` (for environment detection)
- `X-Client-Version` (for version tracking)

### API Connection Issues
1. Verify backend is running on port 5000
2. Check `frontend/.env.local` has correct API URL
3. Ensure no firewall blocking localhost connections
4. Test API health: `http://localhost:5000/api/health`

## 🎯 Development Workflow

1. **Start Development**:
   ```bash
   npm run dev:both
   ```

2. **Access Applications**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000/api`
   - API Health: `http://localhost:5000/api/health`

3. **Demo Login Credentials**:
   - **Super Admin**: admin@suvidha.gov.in / 123456
   - **Officer**: ELEC_BILL_2026_0001 / 123456
   - **Citizen**: 9876543210 + OTP

4. **Database Operations**:
   ```bash
   npm run seed      # Add demo data
   npm run reseed    # Reset and add demo data
   ```

## ✅ Verification Checklist

- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 3000
- [ ] API health check responds
- [ ] Frontend can access backend APIs
- [ ] CORS is properly configured
- [ ] Demo login works
- [ ] Database connection successful

---

## 🎉 Ready for Development!

Your SUVIDHA 2026 application is now configured for localhost development with:
- Backend on port 5000
- Frontend on port 3000
- Seamless API communication between them