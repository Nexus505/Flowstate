import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import StarField from './components/StarField';
import Sleep from './pages/Sleep';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import Expenses from './pages/Expenses';
import Work from './pages/Work';
import Habits from './pages/Habits';
import AIInsights from './pages/AIInsights';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

/* ── Ambient atmospheric orbs fixed in the bg ── */
const AmbientOrbs = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div style={{
      position: 'absolute', top: '-10%', left: '8%',
      width: 500, height: 500,
      background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
      filter: 'blur(2px)',
    }} />
    <div style={{
      position: 'absolute', top: '-5%', right: '5%',
      width: 400, height: 400,
      background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
      filter: 'blur(2px)',
    }} />
    <div style={{
      position: 'absolute', bottom: '-10%', left: '40%',
      width: 500, height: 400,
      background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)',
      filter: 'blur(2px)',
    }} />
  </div>
);

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex selection:bg-cyan/20 selection:text-white"
      style={{ background: '#080b12' }}>

      <svg className="noise-overlay" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilterGlobal">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilterGlobal)" />
      </svg>

      <StarField />

      <Sidebar user={user} />

      <main className="flex-1 md:ml-[248px] p-6 md:p-10 h-screen overflow-y-auto overflow-x-hidden relative z-10 scrollbar-hide pb-24 md:pb-10">
        {children}
      </main>
    </div>
  );
};

/* ── Protected Route ─────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080b12' }}>
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"     element={<Landing />} />
      <Route path="/auth"           element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route path="/app"           element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/app/sleep"     element={<ProtectedRoute><AppLayout><Sleep /></AppLayout></ProtectedRoute>} />
      <Route path="/app/workouts"  element={<ProtectedRoute><AppLayout><Workouts /></AppLayout></ProtectedRoute>} />
      <Route path="/app/nutrition" element={<ProtectedRoute><AppLayout><Nutrition /></AppLayout></ProtectedRoute>} />
      <Route path="/app/expenses"  element={<ProtectedRoute><AppLayout><Expenses /></AppLayout></ProtectedRoute>} />
      <Route path="/app/work"      element={<ProtectedRoute><AppLayout><Work /></AppLayout></ProtectedRoute>} />
      <Route path="/app/habits"    element={<ProtectedRoute><AppLayout><Habits /></AppLayout></ProtectedRoute>} />
      <Route path="/app/ai"        element={<ProtectedRoute><AppLayout><AIInsights /></AppLayout></ProtectedRoute>} />
      <Route path="/app/settings"  element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
