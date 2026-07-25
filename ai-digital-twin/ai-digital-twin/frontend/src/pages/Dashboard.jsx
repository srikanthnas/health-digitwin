import { useState, useEffect } from "react";

const API = "https://health-digitwin-1.onrender.com";

function BarChart({ data }) {
  if (!data || data.length === 0) return <p style={{ color: "#64748b" }}>No data yet.</p>;
  const maxFatigue = 10;
  return (
    <div>
      <div className="chart-container">
        {data.map((d, i) => {
          const heightPct = (d.fatigue_score / maxFatigue) * 100;
          const color = d.fatigue_score < 4 ? "#4ade80" : d.fatigue_score < 7 ? "#facc15" : "#f87171";
          return (
            <div className="bar-wrapper" key={i}>
              <div className="bar" style={{ height: `${heightPct}%`, background: color }} title={`Fatigue: ${d.fatigue_score}`} />
              <div className="bar-label">{d.date?.slice(5)}</div>
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

export default function Dashboard({ token }) {
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  useEffect(() => {
    Promise.all([
      fetch(`${API}/history`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ history: [] })),
      fetch(`${API}/predictions`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ predictions: [] }))
    ]).then(([histData, predData]) => {
      setHistory(histData.history || []);
      setPredictions(predData.predictions || []);
      setLoading(false);
    });
  }, []);

  const latest = predictions[0];

  const handleClear = async () => {
  try {
    await fetch(`${API}/clear-history`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setHistory([]);
    setPredictions([]);
    setShowConfirm(false);
  } catch (err) {
    setShowConfirm(false);
  }
};

return (
  <div>
    {showConfirm && (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center",
        alignItems: "center", zIndex: 1000
      }}>
        <div style={{ background: "#1e2235", padding: "2rem", borderRadius: "12px", textAlign: "center", width: "320px" }}>
          <h2 style={{ color: "#f87171", marginBottom: "1rem" }}>⚠️ Are you sure?</h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>This will permanently delete all your health data and predictions!</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button
              onClick={handleClear}
              style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "0.6rem 1.5rem", cursor: "pointer", fontSize: "1rem" }}
            >
              Yes, delete
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              style={{ background: "#374151", color: "white", border: "none", borderRadius: "8px", padding: "0.6rem 1.5rem", cursor: "pointer", fontSize: "1rem" }}
            >
              No, cancel
            </button>
          </div>
        </div>
      </div>
    )}
     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <div className="page-title">📊 Dashboard</div>
  <button
    onClick={() => setShowConfirm(true)}
    style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.9rem" }}
  >
    🗑️ Clear History
  </button>
</div>
<div className="page-subtitle">Your AI Digital Twin — behavioral health overview</div>

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

      <div className="card">
        <h2>📈 Fatigue Score — Last 7 Days</h2>
        {loading ? <p style={{ color: "#64748b" }}>Loading...</p> : <BarChart data={history} />}
      </div>

      <div className="card">
        <h2>🗓️ Behavioral History</h2>
        {history.length === 0 ? (
          <p style={{ color: "#64748b" }}>No data yet. Go to "Generate Data" to create some.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Sleep (h)</th><th>Screen (h)</th><th>Steps</th><th>Fatigue</th></tr>
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