import { useEffect, useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import { getProfile, logoutUser } from "./api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");

  /* =========================
     BOOTSTRAP AUTH (ON LOAD)
  ========================= */
  const bootstrapAuth = async () => {
    const access = localStorage.getItem("access");

    if (!access) {
      setLoading(false);
      return;
    }

    try {
      const profile = await getProfile();
      setIsLoggedIn(true);
      setRole(profile.role);
    } catch {
      logoutUser();
      setIsLoggedIn(false);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrapAuth();
  }, []);

  /* =========================
     LOGIN SUCCESS HANDLER
  ========================= */
  const handleLoginSuccess = async () => {
    setLoading(true);
    await bootstrapAuth();
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setRole(null);
    setAuthMode("login");
  };

  /* =========================
     LOADING GUARD
  ========================= */
  if (loading) {
    return (
      <p style={{ padding: 30 }}>
        Loading application...
      </p>
    );
  }

  /* =========================
     AUTH SCREENS
  ========================= */
  if (!isLoggedIn) {
    return authMode === "login" ? (
      <Login
        onLogin={handleLoginSuccess}
        onSwitchToSignup={() => setAuthMode("signup")}
      />
    ) : (
      <Signup
        onSwitchToLogin={() => setAuthMode("login")}
      />
    );
  }

  /* =========================
     ROLE GUARD
  ========================= */
  if (!role) {
    return (
      <p style={{ padding: 30 }}>
        Loading user permissions...
      </p>
    );
  }

  /* =========================
     ROLE-BASED DASHBOARD
  ========================= */
  return role === "admin" ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <Dashboard onLogout={handleLogout} />
  );
}

export default App;
