// Dashboard.jsx — Main overview page showing history and recent predictions

import { useState, useEffect } from "react";

const API = "http://localhost:8000";  // Backend URL

// Simple bar chart component built without any library
function BarChart({ data }) {
  if (!data || data.length === 0) return <p style={{ color: "#64748b" }}>No data yet.</p>;

  const maxFatigue = 10; // Fatigue is on a 0–10 scale

  return (
    <div>
      <div className="chart-container">
        {data.map((d, i) => {
          const heightPct = (d.fatigue_score / maxFatigue) * 100;
          // Color based on fatigue level
          const color = d.fatigue_score < 4 ? "#4ade80" : d.fatigue_score < 7 ? "#facc15" : "#f87171";
          return (
            <div className="bar-wrapper" key={i}>
              <div
                className="bar"
                style={{ height: `${heightPct}%`, background: color }}
                title={`Fatigue: ${d.fatigue_score}`}
              />
              <div className="bar-label">{d.date?.slice(5)}</div>  {/* Show MM-DD */}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.8rem" }}>
        <span style={{ color: "#4ade80" }}>● Low (0–3)</span>
        <span style={{ color: "#facc15" }}>● Moderate (4–6)</span>
        <span style={{ color: "#f87171" }}>● High (7–10)</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data when the page opens
  useEffect(() => {
    Promise.all([
      fetch(`${API}/history`).then(r => r.json()).catch(() => ({ history: [] })),
      fetch(`${API}/predictions`).then(r => r.json()).catch(() => ({ predictions: [] }))
    ]).then(([histData, predData]) => {
      setHistory(histData.history || []);
      setPredictions(predData.predictions || []);
      setLoading(false);
    });
  }, []);

  const latest = predictions[0];

  return (
    <div>
      <div className="page-title">📊 Dashboard</div>
      <div className="page-subtitle">Your AI Digital Twin — behavioral health overview</div>

      {/* ── Key stats from last record ── */}
      {history.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{history[history.length - 1]?.sleep_hours}h</div>
            <div className="stat-label">😴 Last Sleep</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{history[history.length - 1]?.screen_time}h</div>
            <div className="stat-label">📱 Screen Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{history[history.length - 1]?.steps?.toLocaleString()}</div>
            <div className="stat-label">👣 Steps</div>
          </div>
          {latest && (
            <div className="stat-card">
              <div className="stat-value" style={{ color: latest.fatigue < 4 ? "#4ade80" : latest.fatigue < 7 ? "#facc15" : "#f87171" }}>
                {latest.fatigue}/10
              </div>
              <div className="stat-label">🔮 Predicted Fatigue</div>
            </div>
          )}
        </div>
      )}

      {/* ── 7-day fatigue chart ── */}
      <div className="card">
        <h2>📈 Fatigue Score — Last 7 Days</h2>
        {loading ? <p style={{ color: "#64748b" }}>Loading...</p> : <BarChart data={history} />}
      </div>

      {/* ── History table ── */}
      <div className="card">
        <h2>🗓️ Behavioral History</h2>
        {history.length === 0 ? (
          <p style={{ color: "#64748b" }}>No data yet. Go to "Generate Data" to create some.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>Sleep (h)</th><th>Screen (h)</th><th>Steps</th><th>Fatigue</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>{r.sleep_hours}</td>
                  <td>{r.screen_time}</td>
                  <td>{r.steps?.toLocaleString()}</td>
                  <td style={{ color: r.fatigue_score < 4 ? "#4ade80" : r.fatigue_score < 7 ? "#facc15" : "#f87171" }}>
                    {r.fatigue_score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
