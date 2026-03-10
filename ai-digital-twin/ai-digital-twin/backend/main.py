# main.py — Entry point for the FastAPI backend server

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine, Base
from api.routes import router


# Create all database tables on startup (if they don't exist yet)
Base.metadata.create_all(bind=engine)

# Initialize the FastAPI app
app = FastAPI(
    title="AI Digital Twin — Health Behavior Forecaster",
    description="Predicts next-day fatigue based on sleep, screen time, and steps.",
    version="1.0.0"
)

# Allow the React frontend (running on port 3000) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(router)

# Health check route
@app.get("/")
def root():
    return {"status": "AI Digital Twin backend is running ✅"}
