import { useState } from "react";

const API = "http://localhost:8000";

export default function GenerateData({ token }) {
  const [days, setDays] = useState(60);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    setStatus("loading");
    setMessage("Generating synthetic data...");
    try {
      const res = await fetch(`${API}/generate-data?days=${days}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
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
      <div className="page-subtitle">Creates synthetic behavioral data to simulate your history.</div>

      <div className="card">
        <h2>💡 How This Works</h2>
        <p style={{ color: "#94a3b8", lineHeight: "1.8" }}>
          We generate <strong>fake-but-realistic</strong> data for:
        </p>
        <ul style={{ color: "#94a3b8", marginTop: "0.8rem", paddingLeft: "1.5rem", lineHeight: "2" }}>
          <li>😴 <strong>Sleep hours</strong> (4.5 – 9 hours)</li>
          <li>📱 <strong>Screen time</strong> (1 – 10 hours)</li>
          <li>👣 <strong>Steps</strong> (2,000 – 15,000)</li>
          <li>😩 <strong>Fatigue score</strong> (calculated from the above)</li>
        </ul>
      </div>

      <div className="card">
        <h2>🎛️ Settings</h2>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "#94a3b8" }}>
          Number of days: <strong style={{ color: "#a78bfa" }}>{days}</strong>
        </label>
        <input
          type="range" min="14" max="180" value={days}
          onChange={e => setDays(Number(e.target.value))}
          style={{ width: "100%", marginBottom: "1.5rem", accentColor: "#7c3aed" }}
        />
        <button className="btn" onClick={handleGenerate} disabled={status === "loading"}>
          {status === "loading" ? "Generating..." : `Generate ${days} Days of Data`}
        </button>
        {status && (
          <div className={`status-box status-${status === "loading" ? "loading" : status}`}>
            {message}
          </div>
        )}
      </div>

      {status === "success" && (
        <div className="card">
          <h2>✅ What's Next?</h2>
          <p style={{ color: "#94a3b8" }}>
            Data generated! Now go to <strong style={{ color: "#a78bfa" }}>🏋️ Train Model</strong>.
          </p>
        </div>
      )}
    </div>
  );
}