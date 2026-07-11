# 🧑‍⚕️ Health DigiTwin — AI-Powered Personal Health Forecaster

A full-stack AI health tracking application that learns your behavioral patterns and predicts your future health metrics using deep learning.

## 🚀 Features

### 📊 Health Tracking
- **Manual Data Logging** — Log daily sleep, screen time, steps, and fatigue score
- **Natural Language Logging** — Type naturally ("slept 7 hours, walked 8000 steps") and AI extracts the data automatically
- **Behavioral History** — View and manage your health history

### 🔮 AI Predictions
- **Fatigue Prediction** — LSTM neural network predicts tomorrow's fatigue score
- **Stress Level** — Predicts stress based on your behavioral patterns
- **Sleep Quality Score** — Forecasts how well you'll sleep
- **Energy Level** — Predicts your energy for the next day
- **Burnout Risk** — Detects early signs of burnout
- **Weekly Health Trend** — Shows if your health is improving or declining

### 🩺 AI Doctor
- Chat with an AI health assistant powered by Groq (LLaMA 3.3)
- Get personalized advice based on your actual health data
- Ask anything from headaches to lifestyle questions
- Maintains conversation context across messages

### 🔐 User Authentication
- Secure JWT-based login and registration
- Per-user data isolation
- Password hashing with bcrypt

### 📈 Dashboard
- Visual bar chart of fatigue scores
- Stats overview (sleep, screen time, steps, predicted fatigue)
- Behavioral history table
- Clear history with confirmation

## 🛠️ Tech Stack

### Backend
- **Python 3.14** + **FastAPI** — REST API
- **PyTorch** — LSTM neural network for fatigue prediction
- **SQLAlchemy** + **SQLite** — Database
- **JWT** + **bcrypt** — Authentication
- **Groq API** (LLaMA 3.3 70B) — AI Doctor & Natural Language Processing

### Frontend
- **React** + **Vite** — UI framework
- **Custom CSS** — Dark theme UI

## 🧠 How the AI Works

### LSTM Fatigue Prediction
The app uses a Long Short-Term Memory (LSTM) neural network that:
1. Takes 7 days of behavioral data as input (sleep, screen time, steps, fatigue)
2. Learns your personal patterns over time
3. Predicts next-day fatigue with personalized accuracy

Unlike simple formulas, LSTM has **memory** — it knows that one bad day affects the next 2-3 days.

### AI Doctor
Powered by Groq's LLaMA 3.3 70B model, the AI Doctor:
- Has access to your recent health data
- Gives personalized health advice
- Maintains conversation context
- Always recommends consulting a real doctor for serious issues

## 📁 Project Structure

health-digitwin/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── auth.py              # JWT authentication
│   ├── api/
│   │   └── routes.py        # All API endpoints
│   ├── db/
│   │   ├── database.py      # SQLAlchemy setup
│   │   └── models.py        # User, BehaviorLog, Prediction tables
│   └── ml/
│       ├── lstm_model.py    # LSTM architecture
│       └── trainer.py       # Training & prediction logic
└── frontend/
└── src/
├── App.jsx          # Root component + auth
├── App.css          # Global styles
└── pages/
├── Dashboard.jsx
├── GenerateData.jsx
├── TrainModel.jsx
├── PredictFatigue.jsx
└── AIDoctor.jsx

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key (free at console.groq.com)

### Backend Setup
```bash
cd backend
pip install fastapi uvicorn sqlalchemy pydantic passlib python-jose torch numpy groq python-dotenv
```

Create a `.env` file in the backend folder:

Start the backend:
```bash
python -m uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access the App
Open `http://localhost:5173` in your browser.

## 📱 How to Use

1. **Register** — Create an account
2. **Log Data** — Enter your daily sleep, screen time, steps and fatigue
3. **Train Model** — Train the LSTM on your data (needs 7+ days)
4. **Predict** — Get tomorrow's fatigue + stress + energy predictions
5. **AI Doctor** — Chat with the AI about any health questions

## 🔮 Upcoming Features
- 7-Day Forecast
- What-If Simulator
- Heatmap Calendar
- Streak System
- Personal Health Score

## ⚠️ Disclaimer
This app is for educational and personal tracking purposes only. The AI Doctor provides general health information and is not a substitute for professional medical advice. Always consult a qualified healthcare provider for medical decisions.

## 👨‍💻 Developer
Built by Srikanth — AI Digital Twin Health Forecaster
