import { useState } from "react";
import { signupUser } from "../api";

function Signup({ onSwitchToLogin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Username suggestions
  const suggestions =
    showSuggestions && username
      ? [`${username}_1`, `${username}_2`, `${username}_3`]
      : [];

  const handleSignup = async () => {
    setError("");
    setShowSuggestions(false);

    // ✅ Validation
    if (!firstName || !lastName || !username || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      // ✅ THIS IS THE FIX (snake_case keys)
      await signupUser({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      setShowSuccess(true);
    } catch (err) {
      if (err?.error) {
        setError(err.error);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Signup failed. Please try again.");
      }
    }

    // } catch (err) {
    //   if (err.username) {
    //     setError("Username already exists. Please choose another.");
    //     setShowSuggestions(true);
    //   } else if (err.email) {
    //     setError(err.email[0]);
    //   } else if (err.password) {
    //     setError(err.password[0]);
    //   } else if (err.detail) {
    //     setError(err.detail);
    //   } else {
    //     setError("Something went wrong. Please try again.");
    //   }
    // }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-brand">
          <h1>SkillMap AI</h1>
          <p>Create your free account and start learning.</p>
        </div>

        <div className="auth-card">
          <h2>Create Account 🚀</h2>
          <p className="subtitle">It’s free and takes a minute</p>

          {error && <p className="error-text">{error}</p>}

          {/* Username suggestions */}
          {suggestions.length > 0 && (
            <div className="username-suggestions-inline">
              <span className="label">Suggestions:</span>
              {suggestions.map((s, index) => (
                <span
                  key={s}
                  className="suggestion"
                  onClick={() => {
                    setUsername(s);
                    setShowSuggestions(false);
                    setError("");
                  }}
                >
                  {s}
                  {index < suggestions.length - 1 && " ·"}
                </span>
              ))}
            </div>
          )}

          <input
            className="form-input"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary" onClick={handleSignup}>Create Account</button>

          <p className="footer-text">
            Already have an account?{" "}
            <span onClick={onSwitchToLogin}>Sign in</span>
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Account Created 🎉</h3>
            <p>Your account has been created successfully.</p>

            <button
              onClick={() => {
                setShowSuccess(false);
                onSwitchToLogin();
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;
