import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      const route =
        user.role === "citizen"
          ? "/citizen"
          : user.role === "worker"
            ? "/worker"
            : user.role === "dept_head"
              ? "/dept-head"
              : "/admin";
      navigate(route);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <div className="card">
        <h2 style={{ marginBottom: 20 }}>Login</h2>
        {error && (
          <p style={{ color: "#ef4444", marginBottom: 12, fontSize: 14 }}>
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn" style={{ width: "100%" }}>
            Login
          </button>
        </form>
        <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "#6366f1" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
