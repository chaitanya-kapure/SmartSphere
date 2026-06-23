import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "citizen" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(form.name, form.email, form.password, form.role);
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
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <div className="card">
        <h2 style={{ marginBottom: 20 }}>Register</h2>
        {error && (
          <p style={{ color: "#ef4444", marginBottom: 12, fontSize: 14 }}>
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            className="input"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={handleChange}
          />
          <select
            className="input"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="citizen">Citizen</option>
            <option value="worker">Worker</option>
            <option value="dept_head">Department Head</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <button type="submit" className="btn" style={{ width: "100%" }}>
            Register
          </button>
        </form>
        <p style={{ marginTop: 12, fontSize: 13, color: "#94a3b8" }}>
          Already registered?{" "}
          <Link to="/login" style={{ color: "#6366f1" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
