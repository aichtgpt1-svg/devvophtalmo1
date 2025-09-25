import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import DevicesPage from "@/pages/DevicesPage";
import DeviceFormPage from "@/pages/DeviceFormPage";
import DeviceDetailsPage from "@/pages/DeviceDetailsPage";
import MaintenancePage from "@/pages/MaintenancePage";
import ServiceRequestPage from "@/pages/ServiceRequestPage";
import ServiceAnalyticsPage from "@/pages/ServiceAnalyticsPage";
import MonitoringPage from "@/pages/MonitoringPage";
import PredictiveMaintenancePage from "@/pages/PredictiveMaintenancePage";
import CompliancePage from "@/pages/CompliancePage";
import UserManagementPage from "@/pages/UserManagementPage";
import ReportsPage from "@/pages/ReportsPage";
import ReportBuilderPage from "@/pages/ReportBuilderPage";
import DeviceAnalysisPage from "@/pages/DeviceAnalysisPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import InventoryPage from "@/pages/InventoryPage";
import FacilityManagementPage from "@/pages/FacilityManagementPage";
import NotificationManagementPage from "@/pages/NotificationManagementPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/auth-store";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from 'react';
import { Activity, Menu, X, Home, Wrench, AlertCircle, BarChart3, Settings, LogOut, FileText, Brain, Monitor, Zap, Shield, Users, Plug, Package, Building2, Bell } from 'lucide-react';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show sidebar on public pages
  if (location.pathname === '/' || location.pathname === '/auth/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">OphthalmoTech</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-4 space-y-2">
          <Link to="/dashboard" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/dashboard' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Home className="mr-3 h-4 w-4" />
            Dashboard
          </Link>
          <Link to="/devices" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname.startsWith('/devices') 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Settings className="mr-3 h-4 w-4" />
            Devices
          </Link>
          <Link to="/maintenance" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/maintenance' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Wrench className="mr-3 h-4 w-4" />
            Maintenance
          </Link>
          <Link to="/service-requests" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname.startsWith('/service') 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <AlertCircle className="mr-3 h-4 w-4" />
            Service Requests
          </Link>
          <Link to="/monitoring" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/monitoring' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Monitor className="mr-3 h-4 w-4" />
            Real-time Monitoring
          </Link>
          <Link to="/predictive" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/predictive' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Zap className="mr-3 h-4 w-4" />
            Predictive Maintenance
          </Link>
          <Link to="/compliance" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/compliance' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Shield className="mr-3 h-4 w-4" />
            Compliance
          </Link>
          <Link to="/users" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/users' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Users className="mr-3 h-4 w-4" />
            User Management
          </Link>
          <Link to="/reports" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/reports' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <BarChart3 className="mr-3 h-4 w-4" />
            Reports
          </Link>
          <Link to="/report-builder" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/report-builder' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <FileText className="mr-3 h-4 w-4" />
            Report Builder
          </Link>
          <Link to="/device/analysis" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/device/analysis' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Brain className="mr-3 h-4 w-4" />
            AI Analysis
          </Link>
          <Link to="/service-analytics" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/service-analytics' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <FileText className="mr-3 h-4 w-4" />
            Service Analytics
          </Link>
          <Link to="/integrations" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/integrations' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Plug className="mr-3 h-4 w-4" />
            Integrations
          </Link>
          <Link to="/inventory" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/inventory' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Package className="mr-3 h-4 w-4" />
            Inventory
          </Link>
          <Link to="/facilities" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/facilities' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Building2 className="mr-3 h-4 w-4" />
            Multi-Facility
          </Link>
          <Link to="/notifications" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/notifications' 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Bell className="mr-3 h-4 w-4" />
            Notifications
          </Link>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome back, {user?.email?.split('@')[0]}
              </span>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <TooltipProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/auth/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Device Management Routes */}
          <Route 
            path="/devices" 
            element={
              <ProtectedRoute>
                <DevicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/devices/new" 
            element={
              <ProtectedRoute>
                <DeviceFormPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/devices/:id/edit" 
            element={
              <ProtectedRoute>
                <DeviceFormPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/devices/:id" 
            element={
              <ProtectedRoute>
                <DeviceDetailsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Maintenance Routes */}
          <Route 
            path="/maintenance" 
            element={
              <ProtectedRoute>
                <MaintenancePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Service Request Routes */}
          <Route 
            path="/service-requests" 
            element={
              <ProtectedRoute>
                <ServiceRequestPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/service-analytics" 
            element={
              <ProtectedRoute>
                <ServiceAnalyticsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Advanced Features Routes */}
          <Route 
            path="/monitoring" 
            element={
              <ProtectedRoute>
                <MonitoringPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/predictive" 
            element={
              <ProtectedRoute>
                <PredictiveMaintenancePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/compliance" 
            element={
              <ProtectedRoute>
                <CompliancePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/report-builder" 
            element={
              <ProtectedRoute>
                <ReportBuilderPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/device/analysis" 
            element={
              <ProtectedRoute>
                <DeviceAnalysisPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/integrations" 
            element={
              <ProtectedRoute>
                <IntegrationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/facilities" 
            element={
              <ProtectedRoute>
                <FacilityManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <NotificationManagementPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback Routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </AppLayout>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
