# trainer.py — Handles data prep, model training, and prediction logic

import torch
import torch.nn as nn
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib
import os
from ml.lstm_model import FatigueLSTM

# Where to save the trained model and scaler
MODEL_PATH = "ml/saved_model.pt"
SCALER_PATH = "ml/scaler.pkl"
SEQUENCE_LENGTH = 7  # How many past days the model looks at

def prepare_sequences(data: np.ndarray, seq_len: int):
    """
    Converts a flat array of daily rows into (X, y) sequences.
    Example: Days 1-7 → predict day 8's fatigue
    
    data shape: (n_days, 4) — columns: sleep, screen, steps, fatigue
    """
    X, y = [], []
    for i in range(len(data) - seq_len):
        # Input: seq_len days of ALL features (including past fatigue)
        X.append(data[i : i + seq_len, :3])      # Just behavioral features
        # Target: the fatigue score on the next day
        y.append(data[i + seq_len, 3])
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


def train_model(records: list) -> dict:
    """
    Train the LSTM model on the provided records.
    Each record: {sleep_hours, screen_time, steps, fatigue_score}
    Returns: dict with training loss history
    """
    # Step 1: Convert records to numpy array
    raw = np.array([
        [r.sleep_hours, r.screen_time, r.steps, r.fatigue_score]
        for r in records
    ], dtype=np.float32)

    # Step 2: Normalize data to [0, 1] range — helps LSTM learn faster
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(raw)

    # Step 3: Save scaler so we can use same normalization at prediction time
    os.makedirs("ml", exist_ok=True)
    joblib.dump(scaler, SCALER_PATH)

    # Step 4: Build sequences
    X, y = prepare_sequences(scaled, SEQUENCE_LENGTH)

    # Convert to PyTorch tensors
    X_tensor = torch.tensor(X)
    y_tensor = torch.tensor(y).unsqueeze(1)  # Shape: (n, 1)

    # Step 5: Create and train the model
    model = FatigueLSTM(input_size=3, hidden_size=64, num_layers=2)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    loss_fn = nn.MSELoss()  # Mean Squared Error for regression

    loss_history = []
    EPOCHS = 100

    model.train()
    for epoch in range(EPOCHS):
        optimizer.zero_grad()           # Clear old gradients
        output = model(X_tensor)        # Forward pass
        loss = loss_fn(output, y_tensor)  # Compute error
        loss.backward()                 # Backpropagate
        optimizer.step()                # Update weights

        if epoch % 10 == 0:
            loss_history.append(round(loss.item(), 4))

    # Step 6: Save model weights
    torch.save(model.state_dict(), MODEL_PATH)

    return {"epochs": EPOCHS, "final_loss": round(loss.item(), 4), "loss_history": loss_history}


def predict_fatigue(recent_records: list) -> float:
    """
    Given the last 7 days of behavior, predict tomorrow's fatigue score.
    Returns: predicted fatigue score (0–10 scale)
    """
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        raise FileNotFoundError("Model not trained yet. Please train first.")

    # Load scaler and model
    scaler = joblib.load(SCALER_PATH)
    model = FatigueLSTM(input_size=3, hidden_size=64, num_layers=2)
    model.load_state_dict(torch.load(MODEL_PATH))
    model.eval()

    # Prepare the last 7 days as input
    raw = np.array([
        [r.sleep_hours, r.screen_time, r.steps, r.fatigue_score]
        for r in recent_records[-SEQUENCE_LENGTH:]
    ], dtype=np.float32)

    # Normalize using the same scaler used during training
    scaled = scaler.transform(raw)
    features = scaled[:, :3]  # Only behavioral features (not fatigue)

    # Convert to tensor with batch dimension
    X_tensor = torch.tensor(features).unsqueeze(0)  # Shape: (1, 7, 3)

    with torch.no_grad():
        prediction_scaled = model(X_tensor).item()

    # Reverse the normalization for the fatigue score column (index 3)
    # We reconstruct a dummy row to inverse_transform only the fatigue column
    dummy = np.zeros((1, 4), dtype=np.float32)
    dummy[0, 3] = prediction_scaled
    prediction_real = scaler.inverse_transform(dummy)[0, 3]

    # Clamp to valid range [0, 10]
    return round(float(np.clip(prediction_real, 0, 10)), 2)
