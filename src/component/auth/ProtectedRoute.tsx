import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { checkAuth } from '../../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, loading } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthChecked(true);
        setIsInitialized(true);
      }
    };

    verifyAuth();
  }, [dispatch, location.pathname]);

  // Show loading spinner while initializing
  if (!isInitialized || loading || !authChecked) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // If no token or not authenticated, redirect to login
  if (!token || !isAuthenticated) {
    // Don't redirect if we're already on the login page
    if (location.pathname !== '/login') {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
  }

  // If authenticated but on login page, redirect to dashboard
  if (token && isAuthenticated && location.pathname === '/login') {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
