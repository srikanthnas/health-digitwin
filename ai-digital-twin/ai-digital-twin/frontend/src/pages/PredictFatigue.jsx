// PredictFatigue.jsx — Page to predict tomorrow's fatigue score

import { useState, useEffect } from "react";

const API = "http://localhost:8000";

// Helper: get color class based on fatigue level
function fatigueColor(score) {
  if (score < 4) return "#4ade80";   // Green = good
  if (score < 7) return "#facc15";   // Yellow = moderate
  return "#f87171";                   // Red = high
}

// Helper: get label based on fatigue level
function fatigueLabel(score) {
  if (score < 4) return "Low — You should feel energized tomorrow! 🌟";
  if (score < 7) return "Moderate — Consider better sleep tonight 😐";
  return "High — Your body needs rest! 🛑";
}

export default function PredictFatigue() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);

  // Load recent history for context
  useEffect(() => {
    fetch(`${API}/history`)
      .then(r => r.json())
      .then(d => setHistory(d.history || []))
      .catch(() => {});
  }, []);

  const handlePredict = async () => {
    setStatus("loading");
    setMessage("Asking the AI Digital Twin to predict tomorrow's fatigue...");
    setPrediction(null);

    try {
      const res = await fetch(`${API}/predict`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("✅ Prediction complete!");
        setPrediction(data);
      } else {
        setStatus("error");
        setMessage(`❌ ${data.detail || "Prediction failed"}`);
      }
    } catch (err) {
      setStatus("error");
      setMessage("❌ Could not connect to backend. Is it running?");
    }
  };

  return (
    <div>
      <div className="page-title">🔮 Predict Fatigue</div>
      <div className="page-subtitle">
        Uses the last 7 days of your behavioral data to predict tomorrow's fatigue level.
      </div>

      {/* ── Recent behavior context ── */}
      {history.length > 0 && (
        <div className="card">
          <h2>📋 Last 7 Days — Used for Prediction</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>Sleep (h)</th><th>Screen (h)</th><th>Steps</th><th>Fatigue</th>
              </tr>
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

      {/* ── Predict button ── */}
      <div className="card">
        <h2>🚀 Run Prediction</h2>
        <button
          className="btn btn-secondary"
          onClick={handlePredict}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Predicting..." : "Predict Tomorrow's Fatigue"}
        </button>

        {status && (
          <div className={`status-box status-${status === "loading" ? "loading" : status}`}>
            {message}
          </div>
        )}
      </div>

      {/* ── Prediction result ── */}
      {prediction && (
        <div className="card" style={{ textAlign: "center" }}>
          <h2>📅 Prediction for {prediction.predicted_date}</h2>

          {/* Big fatigue number */}
          <div
            className="fatigue-score"
            style={{ color: fatigueColor(prediction.predicted_fatigue_score) }}
          >
            {prediction.predicted_fatigue_score} / 10
          </div>

          {/* Interpretation */}
          <div style={{
            padding: "1rem",
            borderRadius: "8px",
            background: "#0f172a",
            color: fatigueColor(prediction.predicted_fatigue_score),
            fontSize: "1rem",
            fontWeight: "600"
          }}>
            {fatigueLabel(prediction.predicted_fatigue_score)}
          </div>

          {/* Recommendations based on score */}
          <div style={{ marginTop: "1rem", textAlign: "left" }}>
            <h3 style={{ color: "#7c3aed", marginBottom: "0.5rem" }}>💡 Recommendations</h3>
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
