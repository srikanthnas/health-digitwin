import { useState, useEffect } from "react";

const API = "http://localhost:8000";

function fatigueColor(score) {
  if (score < 4) return "#4ade80";
  if (score < 7) return "#facc15";
  return "#f87171";
}

function fatigueLabel(score) {
  if (score < 4) return "Low — You should feel energized tomorrow! 🌟";
  if (score < 7) return "Moderate — Consider better sleep tonight 😐";
  return "High — Your body needs rest! 🛑";
}

export default function PredictFatigue({ token }) {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`${API}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setHistory(d.history || []))
      .catch(() => {});
  }, []);

  const handlePredict = async () => {
    setStatus("loading");
    setMessage("Predicting tomorrow's fatigue...");
    setPrediction(null);
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
      setStatus("success");
      setMessage("✅ Prediction complete!");
      console.log("Prediction data:", data);
      setPrediction(data);
      } else {
        setStatus("error");
        setMessage(`❌ ${data.detail || "Prediction failed"}`);
      }
    } catch (err) {
      setStatus("error");
      setMessage("❌ Could not connect to backend.");
    }
  };

  return (
    <div>
      <div className="page-title">🔮 Predict Fatigue</div>
      <div className="page-subtitle">Uses the last 7 days of your behavioral data to predict tomorrow's fatigue level.</div>

      {history.length > 0 && (
        <div className="card">
          <h2>📋 Last 7 Days — Used for Prediction</h2>
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Sleep (h)</th><th>Screen (h)</th><th>Steps</th><th>Fatigue</th></tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>{r.sleep_hours}</td>
                  <td>{r.screen_time}</td>
                  <td>{r.steps?.toLocaleString()}</td>
                  <td style={{ color: fatigueColor(r.fatigue_score) }}>{r.fatigue_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h2>🚀 Run Prediction</h2>
        <button className="btn btn-secondary" onClick={handlePredict} disabled={status === "loading"}>
          {status === "loading" ? "Predicting..." : "Predict Tomorrow's Fatigue"}
        </button>
        {status && (
          <div className={`status-box status-${status === "loading" ? "loading" : status}`}>
            {message}
          </div>
        )}
      </div>
{prediction && (
  <div>
    {/* ── Main Fatigue Score ── */}
    <div className="card" style={{ textAlign: "center" }}>
      <h2>📅 Prediction for {prediction.predicted_date}</h2>
      <div className="fatigue-score" style={{ color: fatigueColor(prediction.predicted_fatigue_score) }}>
        {prediction.predicted_fatigue_score} / 10
      </div>
      <div style={{ padding: "1rem", borderRadius: "8px", background: "#0f172a", color: fatigueColor(prediction.predicted_fatigue_score), fontSize: "1rem", fontWeight: "600" }}>
        {fatigueLabel(prediction.predicted_fatigue_score)}
      </div>
      <div style={{ marginTop: "1rem", textAlign: "left", background: "#1e2235", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid #7c3aed" }}>
        <h3 style={{ color: "#a78bfa", marginBottom: "0.5rem" }}>🧠 Why this score?</h3>
        <p style={{ color: "#94a3b8", lineHeight: "1.8" }}>{prediction.reason}</p>
      </div>
    </div>

    {/* ── All Predictions Grid ── */}
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value" style={{ color: prediction.stress_level > 6 ? "#f87171" : prediction.stress_level > 3 ? "#facc15" : "#4ade80" }}>
          {prediction.stress_level}/10
        </div>
        <div className="stat-label">😤 Stress Level</div>
      </div>
      <div className="stat-card">
        <div className="stat-value" style={{ color: prediction.sleep_quality > 6 ? "#4ade80" : prediction.sleep_quality > 3 ? "#facc15" : "#f87171" }}>
          {prediction.sleep_quality}/10
        </div>
        <div className="stat-label">😴 Sleep Quality</div>
      </div>
      <div className="stat-card">
        <div className="stat-value" style={{ color: prediction.energy_level > 6 ? "#4ade80" : prediction.energy_level > 3 ? "#facc15" : "#f87171" }}>
          {prediction.energy_level}/10
        </div>
        <div className="stat-label">⚡ Energy Level</div>
      </div>
      <div className="stat-card">
        <div className="stat-value" style={{ color: prediction.burnout_risk > 6 ? "#f87171" : prediction.burnout_risk > 3 ? "#facc15" : "#4ade80" }}>
          {prediction.burnout_risk}/10
        </div>
        <div className="stat-label">🔥 Burnout Risk</div>
      </div>
    </div>

    {/* ── Weekly Trend ── */}
    <div className="card">
      <h2>📊 Weekly Health Trend</h2>
      <p style={{ fontSize: "1.2rem", color: prediction.weekly_trend === "improving" ? "#4ade80" : prediction.weekly_trend === "declining" ? "#f87171" : "#facc15" }}>
        {prediction.weekly_trend_message}
      </p>
    </div>

    {/* ── Recommendations ── */}
    <div className="card">
      <h2>💡 Recommendations</h2>
      {prediction.predicted_fatigue_score >= 7 && (
        <ul style={{ color: "#94a3b8", paddingLeft: "1.5rem", lineHeight: "2" }}>
          <li>🛏️ Aim for 8+ hours of sleep tonight</li>
          <li>📱 Reduce screen time by 2+ hours</li>
          <li>🚶 Take a 20-minute walk to boost energy</li>
          <li>💧 Stay hydrated throughout the day</li>
        </ul>
      )}
      {prediction.predicted_fatigue_score >= 4 && prediction.predicted_fatigue_score < 7 && (
        <ul style={{ color: "#94a3b8", paddingLeft: "1.5rem", lineHeight: "2" }}>
          <li>😴 Try to sleep 30 minutes earlier</li>
          <li>🧘 Take short breaks from screens</li>
          <li>🚴 Light exercise recommended</li>
        </ul>
      )}
      {prediction.predicted_fatigue_score < 4 && (
        <ul style={{ color: "#94a3b8", paddingLeft: "1.5rem", lineHeight: "2" }}>
          <li>✅ Your habits look great — keep it up!</li>
          <li>🏃 Good day for a longer workout</li>
          <li>🌟 Take on challenging tasks while energy is high</li>
        </ul>
      )}
    </div>
  </div>
)}
  </div>
);
}