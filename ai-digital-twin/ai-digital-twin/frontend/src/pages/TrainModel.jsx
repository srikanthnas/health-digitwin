import { useState } from "react";



const API = "https://health-digitwin-1.onrender.com";

export default function TrainModel({ token }) {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [trainingInfo, setTrainingInfo] = useState(null);

  const handleTrain = async () => {
    setStatus("loading");
    setMessage("Training LSTM model... this may take 10–30 seconds ⏳");
    setTrainingInfo(null);
    try {
      const res = await fetch(`${API}/train-model`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
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
      <div className="page-subtitle">This trains the LSTM neural network to learn your behavioral patterns.</div>

      <div className="card">
        <h2>🧠 What is LSTM?</h2>
        <p style={{ color: "#94a3b8", lineHeight: "1.8" }}>
          <strong>LSTM (Long Short-Term Memory)</strong> is a type of AI great at learning patterns in sequences.
        </p>
        <div style={{ marginTop: "1rem", padding: "1rem", background: "#0f172a", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.85rem", color: "#a78bfa" }}>
          Day 1–7 behavior → LSTM → Predicted Day 8 fatigue score
        </div>
      </div>

      <div className="card">
        <h2>🚀 Start Training</h2>
        <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
          Make sure you've generated data first. Training runs 100 epochs.
        </p>
        <button className="btn" onClick={handleTrain} disabled={status === "loading"}>
          {status === "loading" ? "Training... please wait" : "Train LSTM Model"}
        </button>
        {status && (
          <div className={`status-box status-${status === "loading" ? "loading" : status}`}>
            {message}
          </div>
        )}
      </div>

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
          <div style={{ marginTop: "1rem", padding: "0.8rem", background: "#064e3b", borderRadius: "8px", color: "#6ee7b7" }}>
            ✅ Model saved! Now go to <strong>🔮 Predict</strong> to see next-day fatigue.
          </div>
        </div>
      )}
    </div>
  );
}