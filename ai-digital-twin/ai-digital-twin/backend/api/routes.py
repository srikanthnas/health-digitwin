# routes.py — All API endpoints for the Digital Twin backend
from dotenv import load_dotenv
load_dotenv()
import os
from groq import Groq
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

groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def ask_ai_doctor(question: str, user_health_context: dict, history=[]) -> str:
    context = f"You are an AI Health Assistant in DigiTwin app. User health data: Sleep={user_health_context.get('avg_sleep')}h, Screen={user_health_context.get('avg_screen')}h, Steps={user_health_context.get('avg_steps')}, Fatigue={user_health_context.get('avg_fatigue')}/10, Trend={user_health_context.get('trend')}. Be empathetic and helpful. For serious symptoms suggest seeing a real doctor. Always end with: I am an AI assistant, not a real doctor. Please consult a medical professional for serious health concerns."
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": context},
            *[{"role": "user" if m.role == "user" else "assistant", "content": m.text} for m in history],
            {"role": "user", "content": question}
        ],
        max_tokens=1024
    )
    return response.choices[0].message.content

router = APIRouter()

# ─────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LogDataRequest(BaseModel):
    date: str
    sleep_hours: float
    screen_time: float
    steps: int
    fatigue_score: float

class ChatMessage(BaseModel):
    role: str
    text: str

class DoctorQuestion(BaseModel):
    question: str
    history: list[ChatMessage] = []

# ─────────────────────────────────────────────
# ENDPOINT 1: Register
# ─────────────────────────────────────────────
@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=data.name, email=data.email, hashed_password=hash_password(data.password))
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
# ENDPOINT 3: Log User Data Manually
# ─────────────────────────────────────────────
@router.post("/log-data")
def log_data(data: LogDataRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(BehaviorLog).filter(BehaviorLog.user_id == current_user.id, BehaviorLog.date == data.date).first()
    if existing:
        existing.sleep_hours = data.sleep_hours
        existing.screen_time = data.screen_time
        existing.steps = data.steps
        existing.fatigue_score = data.fatigue_score
        db.commit()
        return {"message": f"Data updated for {data.date}"}
    record = BehaviorLog(user_id=current_user.id, date=data.date, sleep_hours=data.sleep_hours, screen_time=data.screen_time, steps=data.steps, fatigue_score=data.fatigue_score)
    db.add(record)
    db.commit()
    return {"message": f"Data logged for {data.date}"}

# ─────────────────────────────────────────────
# ENDPOINT 4: Generate Synthetic Data
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
        fatigue = round(10 - (sleep * 0.7) + (screen * 0.3) - (steps / 10000) * 1.5 + random.uniform(-1, 1), 2)
        fatigue = float(np.clip(fatigue, 0, 10))
        records.append(BehaviorLog(user_id=current_user.id, date=str(current_date), sleep_hours=sleep, screen_time=screen, steps=steps, fatigue_score=fatigue))
    db.add_all(records)
    db.commit()
    return {"message": f"Generated {days} days of synthetic data", "days": days}

# ─────────────────────────────────────────────
# ENDPOINT 5: Train the LSTM Model
# ─────────────────────────────────────────────
@router.post("/train-model")
def train(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(BehaviorLog).filter(BehaviorLog.user_id == current_user.id).order_by(BehaviorLog.date).all()
    if len(records) < 7:
        raise HTTPException(status_code=400, detail="Need at least 7 days of data to train.")
    result = train_model(records)
    return {"message": "Model trained successfully", "training_info": result}

# ─────────────────────────────────────────────
# ENDPOINT 6: Predict Next-Day Fatigue
# ─────────────────────────────────────────────
@router.post("/predict")
def predict(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(BehaviorLog).filter(BehaviorLog.user_id == current_user.id).order_by(BehaviorLog.date.desc()).limit(7).all()
    records = list(reversed(records))
    if len(records) < 7:
        raise HTTPException(status_code=400, detail="Need at least 7 days of data.")
    try:
        fatigue_score = predict_fatigue(records)
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))

    last = records[-1]
    prev = records[-2]
    avg_sleep = sum(r.sleep_hours for r in records) / len(records)
    avg_screen = sum(r.screen_time for r in records) / len(records)
    avg_steps = sum(r.steps for r in records) / len(records)
    avg_fatigue = sum(r.fatigue_score for r in records) / len(records)

    stress = float(np.clip(round((last.screen_time * 0.4) + ((8 - last.sleep_hours) * 0.4) + ((10000 - last.steps) / 10000 * 2) + (avg_fatigue * 0.2), 1), 0, 10))
    sleep_quality = float(np.clip(round((last.sleep_hours / 9 * 5) + ((10 - last.screen_time) / 10 * 3) + (last.steps / 15000 * 2), 1), 0, 10))
    energy = float(np.clip(round((last.sleep_hours * 0.5) + (last.steps / 10000 * 3) + ((10 - last.screen_time) * 0.2) + ((10 - avg_fatigue) * 0.3), 1), 0, 10))
    burnout = float(np.clip(round((avg_fatigue * 0.4) + (avg_screen * 0.3) + ((8 - avg_sleep) * 0.3), 1), 0, 10))

    first_half_fatigue = sum(r.fatigue_score for r in records[:3]) / 3
    second_half_fatigue = sum(r.fatigue_score for r in records[4:]) / 3
    if second_half_fatigue < first_half_fatigue - 0.5:
        trend = "improving"
        trend_msg = "Your health is improving this week!"
    elif second_half_fatigue > first_half_fatigue + 0.5:
        trend = "declining"
        trend_msg = "Your health is declining this week — take rest."
    else:
        trend = "stable"
        trend_msg = "Your health is stable this week."

    reasons = []
    if last.sleep_hours < 6:
        reasons.append(f"You only slept {last.sleep_hours}h yesterday — below healthy range.")
    elif last.sleep_hours >= 8:
        reasons.append(f"You got a solid {last.sleep_hours}h of sleep yesterday.")
    else:
        reasons.append(f"Your sleep was average at {last.sleep_hours}h yesterday.")
    if last.screen_time > 6:
        reasons.append(f"High screen time ({last.screen_time}h) disrupts recovery.")
    elif last.screen_time < 3:
        reasons.append(f"Low screen time ({last.screen_time}h) is great for recovery.")
    if last.steps < 3000:
        reasons.append(f"Very low activity ({last.steps:,} steps) increases fatigue.")
    elif last.steps > 10000:
        reasons.append(f"Great activity ({last.steps:,} steps) boosts energy.")
    if prev.fatigue_score >= 7:
        reasons.append(f"Your body is still recovering from high fatigue ({prev.fatigue_score}/10) two days ago.")
    if avg_fatigue > 6:
        reasons.append(f"Your weekly average fatigue is high ({avg_fatigue:.1f}/10).")
    elif avg_fatigue < 4:
        reasons.append(f"Your weekly fatigue average is great ({avg_fatigue:.1f}/10)!")

    tomorrow = str(date.today() + timedelta(days=1))
    pred = Prediction(user_id=current_user.id, predicted_date=tomorrow, predicted_fatigue=fatigue_score)
    db.add(pred)
    db.commit()

    return {
        "predicted_date": tomorrow,
        "predicted_fatigue_score": fatigue_score,
        "stress_level": stress,
        "sleep_quality": sleep_quality,
        "energy_level": energy,
        "burnout_risk": burnout,
        "weekly_trend": trend,
        "weekly_trend_message": trend_msg,
        "reason": " ".join(reasons)
    }

# ─────────────────────────────────────────────
# ENDPOINT 7: Get History
# ─────────────────────────────────────────────
@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(BehaviorLog).filter(BehaviorLog.user_id == current_user.id).order_by(BehaviorLog.date.desc()).limit(7).all()
    records = list(reversed(records))
    return {"history": [{"date": r.date, "sleep_hours": r.sleep_hours, "screen_time": r.screen_time, "steps": r.steps, "fatigue_score": r.fatigue_score} for r in records]}

# ─────────────────────────────────────────────
# ENDPOINT 8: Get Predictions
# ─────────────────────────────────────────────
@router.get("/predictions")
def get_predictions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    preds = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.created_at.desc()).limit(5).all()
    return {"predictions": [{"date": p.predicted_date, "fatigue": p.predicted_fatigue} for p in preds]}

# ─────────────────────────────────────────────
# ENDPOINT 9: Clear History
# ─────────────────────────────────────────────
@router.delete("/clear-history")
def clear_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(BehaviorLog).filter(BehaviorLog.user_id == current_user.id).delete()
    db.query(Prediction).filter(Prediction.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All history cleared successfully"}

# ─────────────────────────────────────────────
# ENDPOINT 10: AI Doctor
# ─────────────────────────────────────────────
@router.post("/ask-doctor")
def ask_doctor(data: DoctorQuestion, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(BehaviorLog).filter(BehaviorLog.user_id == current_user.id).order_by(BehaviorLog.date.desc()).limit(7).all()
    if records:
        avg_sleep = round(sum(r.sleep_hours for r in records) / len(records), 1)
        avg_screen = round(sum(r.screen_time for r in records) / len(records), 1)
        avg_steps = round(sum(r.steps for r in records) / len(records))
        avg_fatigue = round(sum(r.fatigue_score for r in records) / len(records), 1)
        first_half = sum(r.fatigue_score for r in records[:3]) / 3
        second_half = sum(r.fatigue_score for r in records[4:]) / 3
        trend = "improving" if second_half < first_half - 0.5 else "declining" if second_half > first_half + 0.5 else "stable"
    else:
        avg_sleep = avg_screen = avg_steps = avg_fatigue = "N/A"
        trend = "N/A"

    context = {"avg_sleep": avg_sleep, "avg_screen": avg_screen, "avg_steps": avg_steps, "avg_fatigue": avg_fatigue, "trend": trend}
    answer = ask_ai_doctor(data.question, context, data.history)
    return {"answer": answer}