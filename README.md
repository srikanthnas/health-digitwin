Here's the refined version:

---

# 🧑‍⚕️ Health DigiTwin — AI-Powered Personal Health Forecaster

A full-stack AI health tracking application that learns your behavioral patterns and predicts future health metrics using deep learning.

> **Live Project:** [github.com/srikanthnas/health-digitwin](https://github.com/srikanthnas/health-digitwin)

---

## 🚀 Features

### 📊 Health Tracking
- **Manual Data Logging** — Log daily sleep, screen time, steps, and fatigue score
- **Natural Language Logging** — Type naturally ("slept 7 hours, walked 8000 steps") and AI extracts the data automatically
- **Behavioral History** — View and manage your last 7 days of health data

### 🔮 AI Predictions
- **Fatigue Prediction** — LSTM neural network predicts tomorrow's fatigue score
- **Stress Level** — Predicts stress based on your behavioral patterns
- **Sleep Quality Score** — Forecasts how well you'll sleep
- **Energy Level** — Predicts your energy for the next day
- **Burnout Risk** — Detects early signs of burnout
- **Weekly Health Trend** — Shows if your health is improving or declining

### 🩺 AI Doctor
- Chat with an AI health assistant powered by **Groq (LLaMA 3.3 70B)**
- Gets personalized advice based on your actual health data
- Maintains conversation context across messages
- Always recommends consulting a real doctor for serious issues

### 🔐 User Authentication
- Secure JWT-based login and registration
- Per-user data isolation
- Password hashing with bcrypt

### 📈 Dashboard
- Visual bar chart of fatigue scores over time
- Stats overview — sleep, screen time, steps, predicted fatigue
- Behavioral history table
- Clear history with confirmation dialog

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.14, FastAPI, SQLAlchemy, SQLite |
| ML Model | PyTorch (LSTM Neural Network) |
| Auth | JWT, bcrypt, passlib |
| AI Doctor | Groq API — LLaMA 3.3 70B |
| Frontend | React 18, Vite, Custom CSS |

---

## 🧠 How the AI Works

### LSTM Fatigue Prediction
The app uses a **Long Short-Term Memory (LSTM)** neural network that:
1. Takes 7 days of behavioral data as input (sleep, screen time, steps, fatigue)
2. Learns your personal patterns over time
3. Predicts next-day fatigue with personalized accuracy

Unlike simple rule-based formulas, LSTM has **memory** — it understands that one bad day can affect the next 2–3 days.

### AI Doctor
Powered by **Groq's LLaMA 3.3 70B**, the AI Doctor:
- Has access to your recent health metrics
- Gives context-aware, personalized advice
- Maintains full conversation history
- Always recommends professional medical consultation for serious concerns

---

## 📁 Project Structure

```
health-digitwin/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── auth.py              # JWT authentication
│   ├── .env                 # API keys (not committed)
│   ├── api/
│   │   └── routes.py        # All API endpoints
│   ├── db/
│   │   ├── database.py      # SQLAlchemy setup
│   │   └── models.py        # User, BehaviorLog, Prediction models
│   └── ml/
│       ├── lstm_model.py    # LSTM architecture
│       └── trainer.py       # Training & prediction logic
└── frontend/
    └── src/
        ├── App.jsx          # Root component + auth
        ├── App.css          # Global dark theme styles
        └── pages/
            ├── Dashboard.jsx
            ├── GenerateData.jsx
            ├── TrainModel.jsx
            ├── PredictFatigue.jsx
            └── AIDoctor.jsx
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key — free at [console.groq.com](https://console.groq.com)

### Backend Setup
```bash
cd backend
pip install fastapi uvicorn sqlalchemy pydantic passlib python-jose torch numpy groq python-dotenv bcrypt==4.0.1
```

Create a `.env` file in the `backend/` folder:
```
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_secret_key_here
```

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

Open **http://localhost:5173** in your browser.

---

## 📱 How to Use

1. **Register** — Create an account
2. **Log Data** — Enter your daily sleep, screen time, steps and fatigue score
3. **Generate Data** — Or generate 60 days of synthetic data instantly
4. **Train Model** — Train the LSTM on your data (needs 7+ days)
5. **Predict** — Get tomorrow's fatigue, stress, energy and burnout predictions
6. **AI Doctor** — Chat with the AI about any health questions

---

## 🔮 Upcoming Features
- 7-Day Forecast
- What-If Simulator ("What if I sleep 8 hours tonight?")
- Heatmap Calendar
- Streak & Habit Tracking System
- Personal Health Score

---

## ⚠️ Disclaimer
This app is for educational and personal tracking purposes only. The AI Doctor provides general health information and is **not a substitute for professional medical advice**. Always consult a qualified healthcare provider for medical decisions.

---

## 👨‍💻 Developer
Built by **Srikanth** | Department of Information Science & Engineering, Global Academy of Technology, Bengaluru

