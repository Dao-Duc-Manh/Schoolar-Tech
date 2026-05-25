import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { MainLayout } from '@/components/Layout';

// Pages
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { DashboardPage } from '@/pages/Dashboard';
import { ClassesPage } from '@/pages/Classes';
import { StudentsPage } from '@/pages/Students';
import { GradesPage } from '@/pages/Grades';
import { MaterialsPage } from '@/pages/Materials';
import { SettingsPage } from '@/pages/Settings';
import { ProfilePage } from '@/pages/Profile';
import { StudentCareerProfilePage } from '@/pages/StudentCareerProfile';
import { CareerCenterDashboardPage } from '@/pages/CareerCenter';
import { NotFoundPage } from '@/pages/NotFound';
import { TwoFactorVerifyPage } from '@/pages/TwoFactorVerify';
import LeaderboardPage from '@/pages/Leaderboard';
import StudentDashboardPage from '@/pages/StudentDashboard';
import TeacherDashboardPage from '@/pages/TeacherDashboard';
import SemesterReportPage from '@/pages/SemesterReport';
import OfflineCenterPage from '@/pages/OfflineCenter';
import ClassManagementPage from '@/pages/ClassManagement';
import AIReportSettingsPage from '@/pages/AIReportSettings';
import StudentDashboardV2Page from '@/pages/StudentDashboardV2';
import TwoFactorAuthPage from '@/pages/TwoFactorAuth';
import TeacherDashboardV2Page from '@/pages/TeacherDashboardV2';
import TeacherComprehensivePage from '@/pages/TeacherComprehensive';
import AIReportSettingsV2Page from '@/pages/AIReportSettingsV2';
import AdminPage from '@/pages/AdminPage';
import RoadmapCurrentPage from '@/pages/RoadmapCurrent';
import { DaiNamStudentLearningPage } from '@/pages/DaiNamStudentLearning';
import { DaiNamTeacherCenterPage } from '@/pages/DaiNamTeacherCenter';
import { DaiNamAdminCenterPage } from '@/pages/DaiNamAdminCenter';

type UserRole = 'admin' | 'super_admin' | 'lecturer' | 'teacher' | 'student' | 'career_officer';

const getHomePath = (role?: UserRole | null) => {
  if (role === 'admin' || role === 'super_admin') return '/admin/dashboard';
  if (role === 'career_officer') return '/career/dashboard';
  if (role === 'lecturer' || role === 'teacher') return '/lecturer/dashboard';
  return '/student/dashboard';
};

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return <MainLayout>{children}</MainLayout>;
}

// Public Route Component (redirect if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePath(user?.role)} replace />;
  }

  return <>{children}</>;
}

function IndexRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? getHomePath(user?.role) : '/login'} replace />;
}

function App() {
  const { initializeAuth } = useAuthStore();

  // Initialize auth on app load (check if token exists in localStorage)
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-2fa"
          element={
            <PublicRoute>
              <TwoFactorVerifyPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmap/current"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RoadmapCurrentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/career-profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentCareerProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/learning"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DaiNamStudentLearningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['lecturer', 'teacher']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/lms"
          element={
            <ProtectedRoute allowedRoles={['lecturer', 'teacher']}>
              <DaiNamTeacherCenterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={<IndexRoute />}
        />
        <Route
          path="/classes"
          element={
            <ProtectedRoute allowedRoles={['lecturer', 'teacher']}>
              <ClassesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes/:id"
          element={
            <ProtectedRoute allowedRoles={['lecturer', 'teacher']}>
              <ClassesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['lecturer', 'teacher']}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <GradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <ProtectedRoute allowedRoles={['student', 'lecturer']}>
              <MaterialsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/career-center"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <CareerCenterDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/lms"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DaiNamAdminCenterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/career-center/:section"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <CareerCenterDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career/dashboard"
          element={
            <ProtectedRoute allowedRoles={['career_officer']}>
              <CareerCenterDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career/:section"
          element={
            <ProtectedRoute allowedRoles={['career_officer']}>
              <CareerCenterDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={['lecturer', 'teacher']}>
              <TeacherDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/semester-report"
          element={
            <ProtectedRoute allowedRoles={['lecturer', 'teacher']}>
              <SemesterReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/offline-center"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <OfflineCenterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/class-management"
          element={
            <ProtectedRoute allowedRoles={['lecturer', 'teacher']}>
              <ClassManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-report-settings"
          element={
            <ProtectedRoute>
              <AIReportSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard-v2"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboardV2Page />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-dashboard-v2"
          element={
            <ProtectedRoute allowedRoles={['lecturer', 'teacher']}>
              <TeacherDashboardV2Page />
            </ProtectedRoute>
          }
        />
        <Route
          path="/2fa-auth"
          element={
            <PublicRoute>
              <TwoFactorAuthPage />
            </PublicRoute>
          }
        />
        <Route
          path="/teacher-comprehensive"
          element={
            <ProtectedRoute allowedRoles={['lecturer', 'teacher']}>
              <TeacherComprehensivePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-report-settings-v2"
          element={
            <ProtectedRoute>
              <AIReportSettingsV2Page />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<IndexRoute />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
