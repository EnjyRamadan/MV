import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ContactProvider } from "./contexts/ContactContext";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import SearchPage from "./pages/SearchPage";
import UploadPage from "./pages/UploadPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import GoogleSuccess from "./pages/GoogleSuccess";

function AppRoutes() {
  const { user } = useAuth(); 

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Google OAuth success handler */}
      <Route path="/google-success" element={<GoogleSuccess />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <Navbar />
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Navbar />
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Navbar />
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <Navbar />
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ContactProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <AppRoutes />
          </div>
        </Router>
      </ContactProvider>
    </AuthProvider>
  );
}

export default App;
