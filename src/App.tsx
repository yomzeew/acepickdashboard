import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './store';
import DashboardLayout from './component/containers';
import LoginForm from './component/auth/LoginForm';
import RegisterForm from './component/auth/RegisterForm';
import ProtectedRoute from './component/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import MarketplaceOversight from './pages/MarketplaceOversight';
import ServiceManagement from './pages/ServiceManagement';
import DeliveryManagement from './pages/DeliveryManagement';
import Communication from './pages/Communication';
import DisputeManagement from './pages/DisputeManagement';
import Analytics from './pages/Analytics';
import FinanceManagement from './pages/FinanceManagement';
import './App.css';
import ErrorBoundary from './component/ErrorBoundary';
import { communicationRoute, dashboardRoute, deliveryManagementRoute, disputesManagementRoute, financeManagementRoute, homeRoute, loginRoute, marketplaceRoute, registerRoute, reportAndAnalyticsRoute, serviceManagementRoute, userManagementRoute } from './config';
import Error404 from './pages/Error404';

const theme = {
  token: {
    colorPrimary: '#10b981',
  },
};

function App() {
  return (
   <ErrorBoundary>
      <Provider store={store}>
        <ConfigProvider theme={theme}>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path={loginRoute} element={<LoginForm />} />
              <Route path={registerRoute} element={<RegisterForm />} />
              
              {/* Protected Routes */}
              <Route path={homeRoute} element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Navigate to={dashboardRoute} replace />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path={dashboardRoute} element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path={userManagementRoute} element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <UserManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path={marketplaceRoute} element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MarketplaceOversight />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path={serviceManagementRoute} element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ServiceManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path={deliveryManagementRoute} element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DeliveryManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path={communicationRoute} element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Communication />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path={disputesManagementRoute} element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DisputeManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path={reportAndAnalyticsRoute} element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Analytics />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path={financeManagementRoute} element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <FinanceManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* 404 Route - Catch all unmatched routes */}
              <Route path="*" element={
                <Error404 />
              } />
            </Routes>
          </Router>
        </ConfigProvider>
      </Provider>
      </ErrorBoundary>
  
  );
}

export default App;
