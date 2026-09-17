import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import CompanyDirectoryPage from "./pages/CompanyDirectoryPage";
import CompanyDetailsPage from "./pages/CompanyDetailsPage";
import ContactsListPage from "./pages/ContactsListPage";
import BulkUploadPage from "./pages/BulkUploadPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import EmailListPage from "./pages/EmailListPage";
import UserAccessPage from "./pages/UserAccessPage";
import UserLogsPage from "./pages/UserLogsPage";
import UsersPage from "./pages/UsersPage";
import { Outlet, useLocation } from "react-router-dom";
import { hasPermission, isAuthenticated, isAdmin } from "./services/authService";
import ManagePassword from "./pages/ManagePassword";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import EmployeePanel from "./pages/qrCodeGeneration/EmployeePanel";
import EmployeeCardView from "./pages/qrCodeGeneration/EmployeeCardView";
import PublicEmployeeView from "./pages/qrCodeGeneration/PublicEmployeeView";
import CompanySignature from "./pages/CompanySIgnature";
import EmployeeImageUpload from "./pages/EmployeeImageUpload";

function RequireAuth() {
  const location = useLocation();
  const navigate = useNavigate();

  // Listen for auth changes across tabs (logout/login)
  useEffect(() => {
    function handleStorageChange(e) {
      // If token or auth_session is removed, redirect to login
      if ((e.key === "token" || e.key === "auth_session") && !e.newValue) {
        navigate("/login", { replace: true });
      }
      // If token is added in another tab, refresh the page to update auth state
      if (e.key === "token" && e.newValue && !isAuthenticated()) {
        window.location.reload();
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

function PublicLogin() {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

function RequirePermission({ moduleKey }) {
  return hasPermission(moduleKey) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

function RequireAdmin() {
  return isAdmin() ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicLogin />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Public Employee Verification (QR Code Scan Destination) */}
        <Route path="/employee" element={<PublicEmployeeView />} />
        <Route path="/employee/:employeeId" element={<PublicEmployeeView />} />
         <Route path="/image-upload" element={<EmployeeImageUpload />} />

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/companies" element={<CompanyDirectoryPage />} />
            <Route path="/companies/:companyId" element={<CompanyDetailsPage />} />
            <Route path="/contacts" element={<ContactsListPage />} />
            <Route path="/emails" element={<EmailListPage />} />
            <Route path="/password" element={<ManagePassword />} />
            <Route path="/signature" element={<CompanySignature />} />
            {/* HR Management Module - Admin Only */}
          
            <Route path="/hr-management" element={<EmployeePanel />} />
            <Route path="/hr-management/card/:id" element={<EmployeeCardView />} />
           
            
            <Route element={<RequirePermission moduleKey="bulk_upload" />}>
              <Route path="/bulk-upload" element={<BulkUploadPage />} />
            </Route>
            
            {/* Admin-only routes */}
            <Route element={<RequireAdmin />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/user-access" element={<UserAccessPage />} />
              <Route path="/user-logs" element={<UserLogsPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}