import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fromState = (location.state as { from?: string } | null)?.from;
  const redirectTo =
    fromState && fromState.startsWith("/kitchen")
      ? fromState
      : fromState === "/admin"
        ? "/kitchen"
        : "/kitchen";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const success = await login(username, password);

    setSubmitting(false);

    if (success) {
      setError("");
      navigate(redirectTo, { replace: true });
    } else {
      setError("Incorrect username or password.");
    }
  };

  return (
    <div className="login-page kitchen-login">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="kitchen-badge">Staff only</p>
        <h2>Kitchen Login</h2>
        <p className="login-subtitle">
          Manage live orders for Bite &amp; Sips.
        </p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Enter kitchen"}
        </button>
      </form>
    </div>
  );
}

export default Login;
