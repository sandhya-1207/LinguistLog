import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider, useData } from './context/DataContext';

import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { ResetPassword } from './pages/Auth/ResetPassword';
import { Onboarding } from './pages/Onboarding/Onboarding';

import { Dashboard } from './pages/Dashboard/Dashboard';
import { StudyPlanner } from './pages/StudyPlanner/StudyPlanner';
import { StudyLog } from './pages/StudyLog/StudyLog';
import { VocabularyTracker } from './pages/Vocabulary/VocabularyTracker';
import { GrammarTracker } from './pages/Grammar/GrammarTracker';
import { GoalsPage } from './pages/Goals/GoalsPage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import { CalendarPage } from './pages/Calendar/CalendarPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { SettingsPage } from './pages/Settings/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { profile, loading: dataLoading } = useData();
  const location = useLocation();

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5EFE7] dark:bg-[#17251D]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#755744] dark:border-[#A7BDA9] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#766456] dark:text-[#9CB29F]">
            Loading your progress...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has no profile and isn't already on onboarding, navigate to onboarding
  if (!profile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />

              {/* Protected App Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="planner" element={<StudyPlanner />} />
                <Route path="study-log" element={<StudyLog />} />
                <Route path="vocabulary" element={<VocabularyTracker />} />
                <Route path="grammar" element={<GrammarTracker />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
