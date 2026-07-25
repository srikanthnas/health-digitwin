// App.jsx — Root component with navigation and auth

import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import GenerateData from "./pages/GenerateData";
import TrainModel from "./pages/TrainModel";
import PredictFatigue from "./pages/PredictFatigue";
import AIDoctor from "./pages/AIDoctor";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");

  const handleAuth = async () => {
    setAuthError("");
    const API_URL = "https://health-digitwin-1.onrender.com";

    const url = authMode === "login"
      ? `${API_URL}/login`
      : `${API_URL}/register`;

    try {
      if (authMode === "login") {
        const formData = new URLSearchParams();
        formData.append("username", form.email);
        formData.append("password", form.password);
        const res = await fetch(url, { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userName", data.name);
        setToken(data.access_token);
        setUserName(data.name);
      } else {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);
        setAuthMode("login");
        setAuthError("Registered! Please login.");
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setToken(null);
    setUserName("");
  };

  const NavItem = ({ id, label }) => (
    <button
      onClick={() => setActivePage(id)}
      className={`nav-btn ${activePage === id ? "active" : ""}`}
    >
      {label}
    </button>
  );

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":  return <Dashboard token={token} />;
      case "generate":   return <GenerateData token={token} />;
      case "train":      return <TrainModel token={token} />;
      case "predict":    return <PredictFatigue token={token} />;
      case "doctor":     return <AIDoctor token={token} />;
      default:           return <Dashboard token={token} />;
    }
  };

  // ── Show login/register if not authenticated ──
  if (!token) {
    return (
      <div className="app" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ background: "#1e2235", padding: "2rem", borderRadius: "12px", width: "360px" }}>
          <h2 style={{ color: "#a78bfa", textAlign: "center", marginBottom: "1.5rem" }}>
            🧑‍⚕️ DigiTwin {authMode === "login" ? "Login" : "Register"}
          </h2>

          {authMode === "register" && (
            <input
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />
          )}
          <input
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            style={inputStyle}
          />

          {authError && <p style={{ color: "#f87171", marginBottom: "1rem" }}>{authError}</p>}

          <button onClick={handleAuth} style={btnStyle}>
            {authMode === "login" ? "Login" : "Register"}
          </button>

          <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "1rem" }}>
            {authMode === "login" ? "No account? " : "Have an account? "}
            <span
              onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}
              style={{ color: "#a78bfa", cursor: "pointer" }}
            >
              {authMode === "login" ? "Register" : "Login"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">DigiTwin🧑‍⚕️</div>
        <div className="nav-links">
          <NavItem id="dashboard" label="Dashboard" />
          <NavItem id="generate"  label="Generate Data" />
          <NavItem id="train"     label="Train Model" />
          <NavItem id="predict"   label="Predict" />
        <NavItem id="doctor"    label="AI Doctor" />
          <span style={{ color: "#94a3b8", marginLeft: "1rem" }}>👋 {userName}</span>
          <button onClick={handleLogout} style={{ ...btnStyle, marginLeft: "0.5rem", padding: "0.4rem 1rem", background: "#ef4444" }}>
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "0.6rem", marginBottom: "1rem",
  borderRadius: "8px", border: "1px solid #374151",
  background: "#111827", color: "white", fontSize: "1rem",
  boxSizing: "border-box"
};

const btnStyle = {
  width: "100%", padding: "0.7rem",
  background: "#7c3aed", color: "white",
  border: "none", borderRadius: "8px",
  fontSize: "1rem", cursor: "pointer"
};