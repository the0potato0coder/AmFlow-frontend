import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import MarkAttendancePage from "./pages/MarkAttendancePage";
import UserStatsPage from "./pages/UserStatsPage";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ApplyLeavePage from "./pages/ApplyLeavePage";
import ApplyAttendanceAdjustmentPage from "./pages/ApplyAttendanceAdjustmentPage";
import UserProfile from "./pages/UserProfile.jsx";

// Main App component
function App() {
  // Initialize isAuthenticated and userRole directly from localStorage
  const initialToken = localStorage.getItem("token");
  const initialRole = localStorage.getItem("role");
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken);
  const [userRole, setUserRole] = useState(initialRole);

  // Function to update authentication state and user role
  const handleAuthChange = (authStatus, role) => {
    setIsAuthenticated(authStatus);
    setUserRole(role);
  };

  return (
    <div className="app-layout-container">
      <Navbar
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        onLogout={() => handleAuthChange(false, null)}
      />
      <div className="container mt-4 mb-5">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                userRole === "ADMIN" ? (
                  <Navigate to="/admin-dashboard" />
                ) : (
                  <Navigate to="/employee-dashboard" />
                )
              ) : (
                <LoginPage onAuthChange={handleAuthChange} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated && userRole === "ADMIN" ? (
                <RegistrationPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Protected routes for Employees and Admins */}
          <Route
            path="/mark-attendance"
            element={
              isAuthenticated ? (
                <MarkAttendancePage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/user-stats/:userId?"
            element={
              isAuthenticated ? <UserStatsPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/apply-leave"
            element={
              isAuthenticated ? <ApplyLeavePage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/apply-top-up"
            element={
              isAuthenticated ? (
                <ApplyAttendanceAdjustmentPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* User Profile Page */}
          <Route
            path="/profile/:userId?"
            element={
              isAuthenticated ? <UserProfile /> : <Navigate to="/login" />
            }
          />

          {/* Employee Dashboard */}
          <Route
            path="/employee-dashboard"
            element={
              isAuthenticated &&
              (userRole === "EMPLOYEE" || userRole === "ADMIN") ? (
                <EmployeeDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin-dashboard"
            element={
              isAuthenticated && userRole === "ADMIN" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Redirect to login if user tries to access protected route without authentication */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
