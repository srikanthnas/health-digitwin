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
        <div className="card" style={{ textAlign: "center" }}>
          <h2>📅 Prediction for {prediction.predicted_date}</h2>
          <div className="fatigue-score" style={{ color: fatigueColor(prediction.predicted_fatigue_score) }}>
            {prediction.predicted_fatigue_score} / 10
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", background: "#0f172a", color: fatigueColor(prediction.predicted_fatigue_score), fontSize: "1rem", fontWeight: "600" }}>
            {fatigueLabel(prediction.predicted_fatigue_score)}
          </div>
        </div>
      )}
    </div>
  );
}