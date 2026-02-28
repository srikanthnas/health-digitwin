# routes.py — All API endpoints for the Digital Twin backend

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
import random
import numpy as np

from db.database import get_db
from db.models import BehaviorLog, Prediction
from ml.trainer import train_model, predict_fatigue

router = APIRouter()


# ─────────────────────────────────────────────
# ENDPOINT 1: Generate Synthetic Data
# ─────────────────────────────────────────────
@router.post("/generate-data")
def generate_data(days: int = 60, db: Session = Depends(get_db)):
    """
    Creates synthetic behavioral data for the past `days` days.
    This simulates a real user's history so we can immediately train + test.
    """
    # Clear old data so we start fresh
    db.query(BehaviorLog).delete()

    start_date = date.today() - timedelta(days=days)
    records = []

    for i in range(days):
        current_date = start_date + timedelta(days=i)

        # Simulate realistic-ish behavioral data with some randomness
        sleep = round(random.uniform(4.5, 9.0), 1)          # Sleep hours
        screen = round(random.uniform(1.0, 10.0), 1)        # Screen time hours
        steps = random.randint(2000, 15000)                  # Daily steps

        # Simple fatigue formula — more sleep = less fatigue, more screen = more fatigue
        # This creates a learnable pattern for the LSTM
        fatigue = round(
            10 - (sleep * 0.7) + (screen * 0.3) - (steps / 10000) * 1.5 + random.uniform(-1, 1),
            2
        )
        fatigue = float(np.clip(fatigue, 0, 10))  # Keep within [0, 10]

        record = BehaviorLog(
            user_id="user_1",
            date=str(current_date),
            sleep_hours=sleep,
            screen_time=screen,
            steps=steps,
            fatigue_score=fatigue
        )
        records.append(record)

    db.add_all(records)
    db.commit()

    return {"message": f"Generated {days} days of synthetic data", "days": days}


# ─────────────────────────────────────────────
# ENDPOINT 2: Train the LSTM Model
# ─────────────────────────────────────────────
@router.post("/train-model")
def train(db: Session = Depends(get_db)):
    """
    Fetches all behavior logs and trains the LSTM model.
    Returns training stats like final loss.
    """
    records = db.query(BehaviorLog).order_by(BehaviorLog.date).all()

    if len(records) < 10:
        raise HTTPException(
            status_code=400,
            detail="Not enough data to train. Please generate at least 10 days first."
        )

    result = train_model(records)
    return {"message": "Model trained successfully", "training_info": result}


# ─────────────────────────────────────────────
# ENDPOINT 3: Predict Next-Day Fatigue
# ─────────────────────────────────────────────
@router.post("/predict")
def predict(db: Session = Depends(get_db)):
    """
    Uses the last 7 days of behavior to predict tomorrow's fatigue score.
    Saves the prediction to the database.
    """
    # Get the most recent 7 days
    records = db.query(BehaviorLog).order_by(BehaviorLog.date.desc()).limit(7).all()
    records = list(reversed(records))  # Chronological order

    if len(records) < 7:
        raise HTTPException(
            status_code=400,
            detail="Need at least 7 days of data to predict."
        )

    try:
        score = predict_fatigue(records)
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Save prediction to DB
    tomorrow = str(date.today() + timedelta(days=1))
    pred = Prediction(user_id="user_1", predicted_date=tomorrow, predicted_fatigue=score)
    db.add(pred)
    db.commit()

    return {
        "predicted_date": tomorrow,
        "predicted_fatigue_score": score,
        "message": f"Predicted fatigue for {tomorrow}: {score}/10"
    }


# ─────────────────────────────────────────────
# ENDPOINT 4: Get Last 7 Days of Data (for graph)
# ─────────────────────────────────────────────
@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    """
    Returns the last 7 days of behavioral data + fatigue scores for the frontend chart.
    """
    records = db.query(BehaviorLog).order_by(BehaviorLog.date.desc()).limit(7).all()
    records = list(reversed(records))

    return {
        "history": [
            {
                "date": r.date,
                "sleep_hours": r.sleep_hours,
                "screen_time": r.screen_time,
                "steps": r.steps,
                "fatigue_score": r.fatigue_score
            }
            for r in records
        ]
    }


# ─────────────────────────────────────────────
# ENDPOINT 5: Get Recent Predictions
# ─────────────────────────────────────────────
@router.get("/predictions")
def get_predictions(db: Session = Depends(get_db)):
    """Returns the 5 most recent fatigue predictions."""
    preds = db.query(Prediction).order_by(Prediction.created_at.desc()).limit(5).all()
    return {
        "predictions": [
            {"date": p.predicted_date, "fatigue": p.predicted_fatigue}
            for p in preds
        ]
    }
