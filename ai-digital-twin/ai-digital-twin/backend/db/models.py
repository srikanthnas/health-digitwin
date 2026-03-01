# models.py — Defines the database tables using SQLAlchemy ORM

from sqlalchemy import Column, Integer, Float, DateTime, String, Boolean, ForeignKey
from sqlalchemy.sql import func
from db.database import Base

# Table 1: User — stores registered users
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Table 2: BehaviorLog — stores one row per day of behavioral data
class BehaviorLog(Base):
    __tablename__ = "behavior_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    date = Column(String, nullable=False)
    sleep_hours = Column(Float, nullable=False)
    screen_time = Column(Float, nullable=False)
    steps = Column(Integer, nullable=False)
    fatigue_score = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Table 3: Prediction — stores model predictions for next-day fatigue
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    predicted_date = Column(String, nullable=False)
    predicted_fatigue = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())& "C:\Program Files\Git\cmd\git.exe" config --global core.autocrlf true