// GenerateData.jsx — Page to create synthetic behavioral data for training

import { useState } from "react";

const API = "http://localhost:8000";

export default function GenerateData() {
  const [days, setDays] = useState(60);      // How many days to generate
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    setStatus("loading");
    setMessage("Generating synthetic data...");

    try {
      const res = await fetch(`${API}/generate-data?days=${days}`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(`✅ ${data.message}`);
      } else {
        setStatus("error");
        setMessage(`❌ ${data.detail || "Error generating data"}`);
      }
    } catch (err) {
      setStatus("error");
      setMessage("❌ Could not connect to backend. Is it running?");
    }
  };

  return (
    <div>
      <div className="page-title">⚙️ Generate Data</div>
      <div className="page-subtitle">
        Creates synthetic behavioral data to simulate your history. Perfect for testing the AI.
      </div>

      {/* ── How it works ── */}
      <div className="card">
        <h2>💡 How This Works</h2>
        <p style={{ color: "#94a3b8", lineHeight: "1.8" }}>
          Since this is a demo, we generate <strong>fake-but-realistic</strong> data to simulate
          a user's behavioral history. Each day gets random values for:
        </p>
        <ul style={{ color: "#94a3b8", marginTop: "0.8rem", paddingLeft: "1.5rem", lineHeight: "2" }}>
          <li>😴 <strong>Sleep hours</strong> (4.5 – 9 hours)</li>
          <li>📱 <strong>Screen time</strong> (1 – 10 hours)</li>
          <li>👣 <strong>Steps</strong> (2,000 – 15,000)</li>
          <li>😩 <strong>Fatigue score</strong> (calculated from the above, with noise)</li>
        </ul>
        <p style={{ color: "#64748b", marginTop: "0.8rem", fontSize: "0.85rem" }}>
          The LSTM learns the relationship between these behaviors and fatigue over time.
        </p>
      </div>

      {/* ── Controls ── */}
      <div className="card">
        <h2>🎛️ Settings</h2>

        <label style={{ display: "block", marginBottom: "0.5rem", color: "#94a3b8" }}>
          Number of days to generate: <strong style={{ color: "#a78bfa" }}>{days}</strong>
        </label>

        <input
          type="range"
          min="14"
          max="180"
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          style={{ width: "100%", marginBottom: "1.5rem", accentColor: "#7c3aed" }}
        />

        <button
          className="btn"
          onClick={handleGenerate}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Generating..." : `Generate ${days} Days of Data`}
        </button>

        {/* Status message */}
        {status && (
          <div className={`status-box status-${status === "loading" ? "loading" : status}`}>
            {message}
          </div>
        )}
      </div>

      {/* ── Next step hint ── */}
      {status === "success" && (
        <div className="card">
          <h2>✅ What's Next?</h2>
          <p style={{ color: "#94a3b8" }}>
            Data generated! Now go to <strong style={{ color: "#a78bfa" }}>🏋️ Train Model</strong> to
            teach the AI to recognize patterns in your behavioral data.
          </p>
        </div>
      )}
    </div>
  );
}
