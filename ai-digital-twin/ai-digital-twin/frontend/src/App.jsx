// App.jsx — Root component with navigation between pages

import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import GenerateData from "./pages/GenerateData";
import TrainModel from "./pages/TrainModel";
import PredictFatigue from "./pages/PredictFatigue";
import "./App.css";

export default function App() {
  // Track which page the user is on
  const [activePage, setActivePage] = useState("dashboard");

  // Simple nav item component
  const NavItem = ({ id, label, emoji }) => (
    <button
      onClick={() => setActivePage(id)}
      className={`nav-btn ${activePage === id ? "active" : ""}`}
    >
      {emoji} {label}
    </button>
  );

  // Render the correct page based on activePage
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":    return <Dashboard />;
      case "generate":     return <GenerateData />;
      case "train":        return <TrainModel />;
      case "predict":      return <PredictFatigue />;
      default:             return <Dashboard />;
    }
  };

  return (
    <div className="app">
      {/* ── Top navigation bar ── */}
      <nav className="navbar">
        <div className="brand">DigiTwin🧑‍⚕️</div>
        <div className="nav-links">
          <NavItem id="dashboard" label="Dashboard"     emoji="📊" />
          <NavItem id="generate"  label="Generate Data" emoji="⚙️" />
          <NavItem id="train"     label="Train Model"   emoji="🏋️" />
          <NavItem id="predict"   label="Predict"       emoji="🔮" />
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
