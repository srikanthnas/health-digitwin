import { useState } from "react";

const API = "http://localhost:8000";

export default function LogData({ token }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    sleep_hours: "",
    screen_time: "",
    steps: "",
    fatigue_score: ""
  });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    // Validate
    if (!form.sleep_hours || !form.screen_time || !form.steps || !form.fatigue_score) {
      setStatus("error");
      setMessage("❌ Please fill in all fields!");
      return;
    }

    setStatus("loading");
    setMessage("Saving your data...");

    try {
      const res = await fetch(`${API}/log-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: form.date,
          sleep_hours: parseFloat(form.sleep_hours),
          screen_time: parseFloat(form.screen_time),
          steps: parseInt(form.steps),
          fatigue_score: parseFloat(form.fatigue_score)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("✅ Data logged successfully!");
        setForm({
          date: new Date().toISOString().slice(0, 10),
          sleep_hours: "",
          screen_time: "",
          steps: "",
          fatigue_score: ""
        });
      } else {
        setStatus("error");
        setMessage(`❌ ${data.detail || "Error saving data"}`);
      }
    } catch (err) {
      setStatus("error");
      setMessage("❌ Could not connect to backend.");
    }
  };

  const inputStyle = {
    width: "100%", padding: "0.6rem", marginBottom: "1rem",
    borderRadius: "8px", border: "1px solid #374151",
    background: "#111827", color: "white", fontSize: "1rem",
    boxSizing: "border-box"
  };

  return (
    <div>
      <div className="page-title">📝 Log Today's Data</div>
      <div className="page-subtitle">Enter your health data for the day manually.</div>

      <div className="card">
        <h2>📅 Date</h2>
        <input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          style={inputStyle}
        />

        <h2>😴 Sleep Hours</h2>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "0.5rem" }}>How many hours did you sleep last night? (e.g. 7.5)</p>
        <input
          type="number" min="0" max="24" step="0.5"
          placeholder="e.g. 7.5"
          value={form.sleep_hours}
          onChange={e => setForm({ ...form, sleep_hours: e.target.value })}
          style={inputStyle}
        />

        <h2>📱 Screen Time (hours)</h2>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Total hours on phone/computer today (e.g. 4)</p>
        <input
          type="number" min="0" max="24" step="0.5"
          placeholder="e.g. 4"
          value={form.screen_time}
          onChange={e => setForm({ ...form, screen_time: e.target.value })}
          style={inputStyle}
        />

        <h2>👣 Steps</h2>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "0.5rem" }}>How many steps did you walk today? (e.g. 8000)</p>
        <input
          type="number" min="0" max="100000" step="100"
          placeholder="e.g. 8000"
          value={form.steps}
          onChange={e => setForm({ ...form, steps: e.target.value })}
          style={inputStyle}
        />

        <h2>😩 Fatigue Score (0–10)</h2>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "0.5rem" }}>How tired do you feel right now? (0 = fresh, 10 = exhausted)</p>
        <input
          type="number" min="0" max="10" step="0.5"
          placeholder="e.g. 6"
          value={form.fatigue_score}
          onChange={e => setForm({ ...form, fatigue_score: e.target.value })}
          style={inputStyle}
        />

        <button className="btn" onClick={handleSubmit} disabled={status === "loading"}>
          {status === "loading" ? "Saving..." : "💾 Save Today's Data"}
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
            Data saved! Log at least <strong style={{ color: "#a78bfa" }}>7 days</strong> of data, then go to <strong style={{ color: "#a78bfa" }}>🏋️ Train Model</strong> to teach the AI your patterns.
          </p>
        </div>
      )}
    </div>
  );
}