import { useState } from "react";
import { loginUser } from "../api";

function Login({ onLogin, onSwitchToSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    try {
      const data = await loginUser({ username, password });

      if (data.access && data.refresh) {
        // ✅ STORE TOKENS ONLY
        sessionStorage.setItem("access", data.access);
        sessionStorage.setItem("refresh", data.refresh);

        // ❌ DO NOT STORE ROLE
        // localStorage.setItem("role", data.role);

        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          onLogin(); // App.jsx will fetch profile & role
        }, 800);
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-brand">
          <h1>SkillMap AI</h1>
          <p>Personalized learning roadmaps powered by AI.</p>
        </div>

        <div className="auth-card">
          <h2>Welcome Back 👋</h2>
          <p className="subtitle">Sign in to your account</p>

          {error && <p className="error-text">{error}</p>}

          <input
            type="text"
            placeholder="Username"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary" onClick={handleLogin}>Login</button>

          <p className="footer-text">
            New to SkillMap?{" "}
            <span onClick={onSwitchToSignup}>
              Create account for free
            </span>
          </p>
        </div>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Login Successful 👋</h3>
            <p>Redirecting to your dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
