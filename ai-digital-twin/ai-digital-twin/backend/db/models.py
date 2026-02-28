# models.py — Defines the database tables using SQLAlchemy ORM

from sqlalchemy import Column, Integer, Float, DateTime, String
from sqlalchemy.sql import func
from db.database import Base

# Table 1: BehaviorLog — stores one row per day of behavioral data
class BehaviorLog(Base):
    __tablename__ = "behavior_logs"

    id = Column(Integer, primary_key=True, index=True)           # Auto-incremented row ID
    user_id = Column(String, default="user_1")                    # Which user this belongs to
    date = Column(String, nullable=False)                          # Date of the record (YYYY-MM-DD)
    sleep_hours = Column(Float, nullable=False)                    # Hours of sleep that night
    screen_time = Column(Float, nullable=False)                    # Hours of screen use that day
    steps = Column(Integer, nullable=False)                        # Step count for the day
    fatigue_score = Column(Float, nullable=False)                  # Actual fatigue score (0–10)
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Auto timestamp

# Table 2: Prediction — stores model predictions for next-day fatigue
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="user_1")
    predicted_date = Column(String, nullable=False)               # The day being predicted
    predicted_fatigue = Column(Float, nullable=False)             # Predicted fatigue score
    created_at = Column(DateTime(timezone=True), server_default=func.now())
