
import './App.css'

import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Landing from '@/pages/Landing';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import AppLayout from '@/Layout';
import Accounts from '@/pages/Accounts';
import Transactions from '@/pages/Transactions';
import Loans from '@/pages/Loans';
import LoanApply from '@/pages/LoanApply';
import LoanDetails from '@/pages/LoanDetails';
import Settings from '@/pages/Settings';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminLoans from '@/pages/AdminLoans';

// Central configuration for all app pages and layout
const pagesConfig = {
  Pages: {
    Dashboard,
    Accounts,
    Transactions,
    Loans,
    LoanApply,
    LoanDetails,
    Settings,
    AdminDashboard,
    AdminUsers,
    AdminLoans,
  },
  Layout: AppLayout,
  mainPage: 'Dashboard',
};

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : null;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { user, isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          // if a user has already been authenticated, send them straight to
          // the dashboard instead of showing the landing page again. we use
          // the same casing as the protected route definition.
          user ? <Navigate to="/dashboard" replace /> : <Landing />
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Protected Routes */}
      {Object.entries(Pages).map(([path, PageComp]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            authError ? (
              authError.type === 'user_not_registered' ? (
                <UserNotRegisteredError />
              ) : (
                <Login />
              )
            ) : (
              <LayoutWrapper currentPageName={path}>
                <PageComp />
              </LayoutWrapper>
            )
          }
        />
      ))}

      {/* 404 Page */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AuthProvider>
          <NavigationTracker />
          <AuthenticatedApp />
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
