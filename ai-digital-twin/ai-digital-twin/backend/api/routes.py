# routes.py — All API endpoints for the Digital Twin backend

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import date, timedelta
from pydantic import BaseModel
import random
import numpy as np

from db.database import get_db
from db.models import BehaviorLog, Prediction, User
from ml.trainer import train_model, predict_fatigue
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


# ─────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


# ─────────────────────────────────────────────
# ENDPOINT 1: Register
# ─────────────────────────────────────────────
@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": f"User {user.name} registered successfully!"}


# ─────────────────────────────────────────────
# ENDPOINT 2: Login
# ─────────────────────────────────────────────
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "name": user.name}


# ─────────────────────────────────────────────
# ENDPOINT 3: Generate Synthetic Data
# ─────────────────────────────────────────────
@router.post("/generate-data")
def generate_data(days: int = 60, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(BehaviorLog).filter(BehaviorLog.user_id == current_user.id).delete()
    start_date = date.today() - timedelta(days=days)
    records = []
    for i in range(days):
        current_date = start_date + timedelta(days=i)
        sleep = round(random.uniform(4.5, 9.0), 1)
        screen = round(random.uniform(1.0, 10.0), 1)
        steps = random.randint(2000, 15000)
        fatigue = round(
            10 - (sleep * 0.7) + (screen * 0.3) - (steps / 10000) * 1.5 + random.uniform(-1, 1), 2
        )
        fatigue = float(np.clip(fatigue, 0, 10))
        records.append(BehaviorLog(
            user_id=current_user.id,
            date=str(current_date),
            sleep_hours=sleep,
            screen_time=screen,
            steps=steps,
            fatigue_score=fatigue
        ))
    db.add_all(records)
    db.commit()
    return {"message": f"Generated {days} days of synthetic data", "days": days}


# ─────────────────────────────────────────────
# ENDPOINT 4: Train the LSTM Model
# ─────────────────────────────────────────────
@router.post("/train-model")
def train(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(BehaviorLog).filter(BehaviorLog.user_id == current_user.id).order_by(BehaviorLog.date).all()
    if len(records) < 10:
        raise HTTPException(status_code=400, detail="Not enough data to train.")
    result = train_model(records)
    return {"message": "Model trained successfully", "training_info": result}


# ─────────────────────────────────────────────
# ENDPOINT 5: Predict Next-Day Fatigue
# ─────────────────────────────────────────────
@router.post("/predict")
def predict(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(BehaviorLog).filter(BehaviorLog.user_id == current_user.id).order_by(BehaviorLog.date.desc()).limit(7).all()
    records = list(reversed(records))
    if len(records) < 7:
        raise HTTPException(status_code=400, detail="Need at least 7 days of data.")
    try:
        score = predict_fatigue(records)
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    tomorrow = str(date.today() + timedelta(days=1))
    pred = Prediction(user_id=current_user.id, predicted_date=tomorrow, predicted_fatigue=score)
    db.add(pred)
    db.commit()
    return {"predicted_date": tomorrow, "predicted_fatigue_score": score}


# ─────────────────────────────────────────────
# ENDPOINT 6: Get History
# ─────────────────────────────────────────────
@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(BehaviorLog).filter(BehaviorLog.user_id == current_user.id).order_by(BehaviorLog.date.desc()).limit(7).all()
    records = list(reversed(records))
    return {"history": [{"date": r.date, "sleep_hours": r.sleep_hours, "screen_time": r.screen_time, "steps": r.steps, "fatigue_score": r.fatigue_score} for r in records]}


# ─────────────────────────────────────────────
# ENDPOINT 7: Get Predictions
# ─────────────────────────────────────────────
@router.get("/predictions")
def get_predictions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    preds = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.created_at.desc()).limit(5).all()
    return {"predictions": [{"date": p.predicted_date, "fatigue": p.predicted_fatigue} for p in preds]}