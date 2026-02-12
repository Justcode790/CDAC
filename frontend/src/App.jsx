/**
 * SUVIDHA 2026 - Main App Component
 * 
 * Sets up providers and routing with environment awareness
 */

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRoutes from './routes/AppRoutes';
import IdleTimerWrapper from './components/IdleTimerWrapper';
import { APP_CONFIG } from './utils/constants';

function App() {
  // Development environment info
  if (APP_CONFIG.isDevelopment) {
    console.log('🏛️ SUVIDHA 2026 Government System');
    console.log('Environment:', APP_CONFIG.environment);
    console.log('Version:', APP_CONFIG.version);
    console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
  }

  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <IdleTimerWrapper>
            <AppRoutes />
          </IdleTimerWrapper>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
