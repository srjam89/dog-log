import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell, LoadingScreen } from './components';
import { useAuthSession } from './hooks';

const AnalyticsScreen = lazy(() => import('./screens/AnalyticsScreen'));
const DashboardScreen = lazy(() => import('./screens/DashboardScreen'));
const DiaryScreen = lazy(() => import('./screens/DiaryScreen'));
const DogFormScreen = lazy(() => import('./screens/DogFormScreen'));
const DogProfileScreen = lazy(() => import('./screens/DogProfileScreen'));
const DogsScreen = lazy(() => import('./screens/DogsScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const TrainingFormScreen = lazy(() => import('./screens/TrainingFormScreen'));
const WalkFormScreen = lazy(() => import('./screens/WalkFormScreen'));
const ForgotPasswordScreen = lazy(() => import('./screens/auth/ForgotPasswordScreen'));
const LoginScreen = lazy(() => import('./screens/auth/LoginScreen'));
const RegisterScreen = lazy(() => import('./screens/auth/RegisterScreen'));
const ResetPasswordScreen = lazy(() => import('./screens/auth/ResetPasswordScreen'));

function ProtectedRoute({ session }) {
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestRoute({ session }) {
  return session ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  const { session, isAuthLoading } = useAuthSession();

  if (isAuthLoading) return <LoadingScreen label="Opening DogLog…" fullPage />;

  return (
    <Suspense fallback={<LoadingScreen label="Loading page…" fullPage />}>
    <Routes>
      <Route path="/reset-password" element={<ResetPasswordScreen />} />
      <Route element={<GuestRoute session={session} />}>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      </Route>

      <Route element={<ProtectedRoute session={session} />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardScreen />} />
          <Route path="/dogs" element={<DogsScreen />} />
          <Route path="/dogs/new" element={<DogFormScreen />} />
          <Route path="/dogs/:dogId" element={<DogProfileScreen />} />
          <Route path="/dogs/:dogId/edit" element={<DogFormScreen />} />
          <Route path="/walks/new" element={<WalkFormScreen />} />
          <Route path="/walks/:activityId/edit" element={<WalkFormScreen />} />
          <Route path="/training/new" element={<TrainingFormScreen />} />
          <Route path="/training/:activityId/edit" element={<TrainingFormScreen />} />
          <Route path="/diary" element={<DiaryScreen />} />
          <Route path="/analytics" element={<AnalyticsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
