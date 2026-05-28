import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { lazy, Suspense, useEffect } from 'react';
import { NotificationContainer } from './components/ui/NotificationContainer';
import { useNotificationStore } from './store/notificationStore';
import toast from 'react-hot-toast';

const DashboardPage            = lazy(() => import('./pages/host/DashboardPage').then(m => ({ default: m.DashboardPage })));
const QuizBuilderPage          = lazy(() => import('./pages/host/QuizBuilderPage').then(m => ({ default: m.QuizBuilderPage })));
const CreateSessionPage        = lazy(() => import('./pages/host/CreateSessionPage').then(m => ({ default: m.CreateSessionPage })));
const HostPanelPage            = lazy(() => import('./pages/host/HostPanelPage').then(m => ({ default: m.HostPanelPage })));
const AnalyticsPage            = lazy(() => import('./pages/host/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const AnalyticsListPage        = lazy(() => import('./pages/host/AnalyticsListPage').then(m => ({ default: m.AnalyticsListPage })));
const SessionHistoryPage       = lazy(() => import('./pages/host/SessionHistoryPage').then(m => ({ default: m.SessionHistoryPage })));
const HostLayout               = lazy(() => import('./pages/host/HostLayout').then(m => ({ default: m.HostLayout })));
const ParticipantLayout        = lazy(() => import('./pages/participant/ParticipantLayout').then(m => ({ default: m.ParticipantLayout })));
const ParticipantDashboardPage = lazy(() => import('./pages/participant/ParticipantDashboardPage').then(m => ({ default: m.ParticipantDashboardPage })));
const JoinQuizPage             = lazy(() => import('./pages/participant/JoinQuizPage').then(m => ({ default: m.JoinQuizPage })));
const MyResultsPage            = lazy(() => import('./pages/participant/MyResultsPage').then(m => ({ default: m.MyResultsPage })));
const ParticipantAnalyticsPage = lazy(() => import('./pages/participant/ParticipantAnalyticsPage').then(m => ({ default: m.ParticipantAnalyticsPage })));
const WaitingRoomPage          = lazy(() => import('./pages/participant/WaitingRoomPage').then(m => ({ default: m.WaitingRoomPage })));
const QuestionPage             = lazy(() => import('./pages/participant/QuestionPage').then(m => ({ default: m.QuestionPage })));
const LeaderboardPage          = lazy(() => import('./pages/participant/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const ResultsPage              = lazy(() => import('./pages/participant/ResultsPage').then(m => ({ default: m.ResultsPage })));
const NotFoundPage             = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <div style={{ width: 40, height: 40, border: '4px solid #bfdbfe', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const { isAuthenticated, user, _hydrated, checkSessionExpiry, clearAuth } = useAuthStore();
  const { notifications, removeNotification } = useNotificationStore();

  // Check deployment version and session expiry
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch('/version.json?t=' + Date.now());
        const data = await response.json();
        const storedVersion = localStorage.getItem('appVersion');
        
        if (storedVersion && storedVersion !== data.version) {
          // New deployment detected
          toast.error('New version deployed. Please login again.', { duration: 5000 });
          clearAuth();
          localStorage.setItem('appVersion', data.version);
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
          return;
        }
        
        if (!storedVersion) {
          localStorage.setItem('appVersion', data.version);
        }
      } catch (error) {
        console.error('Failed to check version:', error);
      }
    };

    const checkExpiry = () => {
      if (checkSessionExpiry()) {
        toast.error('Session expired. Please login again.', { duration: 5000 });
        clearAuth();
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    };

    // Check version on mount
    checkVersion();
    
    // Check expiry immediately
    checkExpiry();

    // Check expiry every minute
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [checkSessionExpiry, clearAuth]);

  // Wait for localStorage rehydration before rendering any routes.
  // Without this, isAuthenticated() returns false on first render and
  // ProtectedRoute redirects to /login even for logged-in users.
  if (!_hydrated) return <Spinner />;

  const authed = isAuthenticated();

  return (
    <BrowserRouter>
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Root redirect based on role */}
          <Route
            path="/"
            element={
              !authed ? <Navigate to="/login" replace /> :
              user?.role === 'ROLE_HOST' ? <Navigate to="/dashboard" replace /> :
              <Navigate to="/participant/dashboard" replace />
            }
          />

          {/* ── Host pages with sidebar ── */}
          <Route
            element={
              <ProtectedRoute requiredRole="ROLE_HOST">
                <HostLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/quiz/create" element={<QuizBuilderPage />} />
            <Route path="/quiz/edit/:id" element={<QuizBuilderPage />} />
            <Route path="/analytics" element={<AnalyticsListPage />} />
            <Route path="/analytics/:sessionId" element={<AnalyticsPage />} />
            <Route path="/host/sessions" element={<SessionHistoryPage />} />
          </Route>

          {/* Host full-screen pages (no sidebar) */}
          <Route
            path="/host/session/create"
            element={
              <ProtectedRoute requiredRole="ROLE_HOST">
                <CreateSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/session/:roomCode"
            element={
              <ProtectedRoute requiredRole="ROLE_HOST">
                <HostPanelPage />
              </ProtectedRoute>
            }
          />

          {/* ── Participant pages with sidebar ── */}
          <Route element={<ParticipantLayout />}>
            <Route path="/participant/dashboard" element={<ParticipantDashboardPage />} />
            <Route path="/participant/join" element={<JoinQuizPage />} />
            <Route path="/participant/results" element={<MyResultsPage />} />
            <Route path="/participant/results/:sessionId" element={<ParticipantAnalyticsPage />} />
          </Route>

          {/* Participant game pages (full-screen, no sidebar) */}
          <Route path="/join" element={<JoinQuizPage />} />
          <Route path="/join/:roomCode" element={<JoinQuizPage />} />
          <Route path="/play/waiting/:roomCode" element={<WaitingRoomPage />} />
          <Route path="/play/question/:roomCode" element={<QuestionPage />} />
          <Route path="/play/leaderboard/:roomCode" element={<LeaderboardPage />} />
          <Route path="/results/:roomCode" element={<ResultsPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
