/**
 * SUVIDHA 2026 - Idle Timer Wrapper
 *
 * Detects user inactivity and auto-logs out for kiosk mode
 * Shows warning before logout
 */

import { useState, useEffect } from "react";
import { useIdleTimer } from "react-idle-timer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, Clock } from "lucide-react";

const IdleTimerWrapper = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Kiosk configuration
  const IDLE_WARNING_TIME = 90000; // 90 seconds (1.5 minutes)
  const IDLE_LOGOUT_TIME = 120000; // 120 seconds (2 minutes)
  const WARNING_DURATION = 30000; // 30 seconds warning

  const handleOnIdle = () => {
    // Auto logout
    if (user) {
      console.log("User idle - logging out");
      logout();
      navigate("/");
      alert("You have been logged out due to inactivity.");
    }
  };

  const handleOnPrompt = () => {
    // Show warning
    if (user) {
      setShowWarning(true);
      setCountdown(30);
    }
  };

  const handleOnActive = () => {
    // User is active again
    setShowWarning(false);
    setCountdown(30);
  };

  const { getRemainingTime, activate } = useIdleTimer({
    timeout: IDLE_LOGOUT_TIME,
    promptBeforeIdle: WARNING_DURATION,
    onIdle: handleOnIdle,
    onPrompt: handleOnPrompt,
    onActive: handleOnActive,
    throttle: 500,
    eventsThrottle: 200,
    startOnMount: true,
    startManually: false,
    stopOnIdle: false,
    crossTab: true,
    syncTimers: 200,
    leaderElection: true,
  });

  // Countdown timer
  useEffect(() => {
    if (showWarning) {
      const interval = setInterval(() => {
        const remaining = Math.ceil(getRemainingTime() / 1000);
        setCountdown(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showWarning, getRemainingTime]);

  const handleContinue = () => {
    setShowWarning(false);
    activate();
  };

  const handleLogoutNow = () => {
    setShowWarning(false);
    if (user) {
      logout();
      navigate("/");
    }
  };

  // Only show idle timer for logged-in users
  if (!user) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-yellow-100 rounded-full">
                <AlertCircle className="text-yellow-600" size={48} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-slate-900 text-center mb-4">
              Are You Still There?
            </h2>

            {/* Message */}
            <p className="text-slate-600 text-center mb-6">
              You will be automatically logged out due to inactivity in:
            </p>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Clock className="text-indigo-600" size={32} />
              <div className="text-5xl font-black text-indigo-600">
                {countdown}
              </div>
              <span className="text-xl font-bold text-slate-600">seconds</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 30) * 100}%` }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleLogoutNow}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Logout Now
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Continue Session
              </button>
            </div>

            {/* Info */}
            <p className="text-xs text-slate-500 text-center mt-4">
              Click anywhere or press any key to continue your session
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default IdleTimerWrapper;
