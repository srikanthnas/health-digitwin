// TrainModel.jsx — Page to trigger LSTM model training

import { useState } from "react";

const API = "http://localhost:8000";

export default function TrainModel() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [trainingInfo, setTrainingInfo] = useState(null);

  const handleTrain = async () => {
    setStatus("loading");
    setMessage("Training LSTM model... this may take 10–30 seconds ⏳");
    setTrainingInfo(null);

    try {
      const res = await fetch(`${API}/train-model`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("✅ Model trained successfully!");
        setTrainingInfo(data.training_info);
      } else {
        setStatus("error");
        setMessage(`❌ ${data.detail || "Training failed"}`);
      }
    } catch (err) {
      setStatus("error");
      setMessage("❌ Could not connect to backend. Is it running?");
    }
  };

  return (
    <div>
      <div className="page-title">🏋️ Train Model</div>
      <div className="page-subtitle">
        This trains the LSTM neural network to learn your behavioral patterns.
      </div>

      {/* ── Model explanation ── */}
      <div className="card">
        <h2>🧠 What is LSTM?</h2>
        <p style={{ color: "#94a3b8", lineHeight: "1.8" }}>
          <strong>LSTM (Long Short-Term Memory)</strong> is a type of AI that's great at
          learning patterns in sequences — like your behavior over multiple days.
        </p>
        <p style={{ color: "#94a3b8", lineHeight: "1.8", marginTop: "0.8rem" }}>
          It looks at <strong>7 days at a time</strong> (like a sliding window) and asks:
          <em style={{ color: "#a78bfa" }}> "Given this week's behavior, what will tomorrow's fatigue be?"</em>
        </p>
        <div style={{ marginTop: "1rem", padding: "1rem", background: "#0f172a", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.85rem", color: "#a78bfa" }}>
          Day 1–7 behavior → LSTM → Predicted Day 8 fatigue score
        </div>
      </div>

      {/* ── Train button ── */}
      <div className="card">
        <h2>🚀 Start Training</h2>
        <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
          Make sure you've generated data first. Training runs 100 epochs on your data.
        </p>

        <button
          className="btn"
          onClick={handleTrain}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Training... please wait" : "Train LSTM Model"}
        </button>

        {status && (
          <div className={`status-box status-${status === "loading" ? "loading" : status}`}>
            {message}
          </div>
        )}
      </div>

      {/* ── Training results ── */}
      {trainingInfo && (
        <div className="card">
          <h2>📊 Training Results</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{trainingInfo.epochs}</div>
              <div className="stat-label">Epochs Trained</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{trainingInfo.final_loss}</div>
              <div className="stat-label">Final Loss (MSE)</div>
            </div>
          </div>

          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
            <strong>Loss</strong> measures how wrong the model is. A lower value means better predictions.
          </p>

          {/* Mini loss chart */}
          {trainingInfo.loss_history && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ color: "#94a3b8", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Loss over training:</p>
              <div className="chart-container" style={{ height: "100px" }}>
                {trainingInfo.loss_history.map((l, i) => {
                  const maxLoss = Math.max(...trainingInfo.loss_history);
                  const pct = (l / maxLoss) * 100;
                  return (
                    <div className="bar-wrapper" key={i}>
                      <div className="bar" style={{ height: `${pct}%`, background: "#7c3aed" }} title={l} />
                      <div className="bar-label">{i * 10}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ marginTop: "1rem", padding: "0.8rem", background: "#064e3b", borderRadius: "8px", color: "#6ee7b7" }}>
            ✅ Model saved! Now go to <strong>🔮 Predict</strong> to see next-day fatigue.
          </div>
        </div>
      )}
    </div>
  );
}
