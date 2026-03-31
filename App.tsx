import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Layout } from './components/Layout';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Details from './pages/Details';
import Payment from './pages/Payment';
import Credits from './pages/Credits';
import Confirmation from './pages/Confirmation';
import Earn from './pages/Earn';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Cart from './pages/Cart';
import Membership from './pages/Membership';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="details" element={<Details />} />
        <Route path="payment" element={<Payment />} />
        <Route path="credits" element={<Credits />} />
        <Route path="success" element={<Confirmation />} />
        <Route path="earn" element={<Earn />} />
        <Route path="admin" element={<Admin />} />
        <Route path="login" element={<Login />} />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route path="cart" element={<Cart />} />
        <Route path="membership" element={<Membership />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Toaster position="top-center" richColors theme="light" />
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
