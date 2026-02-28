# 🧠 AI Digital Twin — Personal Health Behavior Forecaster (Phase 1 MVP)

> Predict next-day fatigue using sleep, screen time, and steps — powered by an LSTM neural network.

---

## 1. 🏗️ Architecture Overview

```
User Browser (React)
      ↕ HTTP requests (fetch)
FastAPI Backend (Python)
      ↕ SQLAlchemy ORM
SQLite Database (digital_twin.db)
      ↕ numpy arrays
PyTorch LSTM Model (saved_model.pt)
```

**Data Flow:**
1. Frontend calls `/generate-data` → Backend creates 60 days of synthetic logs → Saved to SQLite
2. Frontend calls `/train-model` → Backend reads all logs → Normalizes → Trains LSTM → Saves model weights
3. Frontend calls `/predict` → Backend loads last 7 days from DB + loads saved model → Returns fatigue score
4. Frontend calls `/history` → Backend reads last 7 records → Displayed as bar chart

---

## 2. 📁 Folder Structure

```
ai-digital-twin/
│
├── backend/
│   ├── main.py                  ← FastAPI app entry point
│   ├── requirements.txt         ← Python dependencies
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py            ← All API endpoints (/generate-data, /train, /predict, etc.)
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py          ← SQLite connection + session setup
│   │   └── models.py            ← SQLAlchemy table definitions (BehaviorLog, Prediction)
│   │
│   └── ml/
│       ├── __init__.py
│       ├── lstm_model.py        ← PyTorch LSTM architecture
│       ├── trainer.py           ← Training loop + prediction logic
│       ├── saved_model.pt       ← Created after training (auto-generated)
│       └── scaler.pkl           ← MinMaxScaler saved after training (auto-generated)
│
├── frontend/
│   ├── index.html               ← Vite HTML entry point
│   ├── package.json             ← Node dependencies
│   ├── vite.config.js           ← Vite dev server config
│   │
│   └── src/
│       ├── main.jsx             ← React root mount
│       ├── App.jsx              ← Navigation + page router
│       ├── App.css              ← All styles (dark theme)
│       │
│       └── pages/
│           ├── Dashboard.jsx    ← Overview: stats + 7-day chart + history table
│           ├── GenerateData.jsx ← Controls for synthetic data generation
│           ├── TrainModel.jsx   ← Training trigger + results display
│           └── PredictFatigue.jsx ← Prediction result + recommendations
│
└── README.md
```

---

## 3. 🗃️ Database Schema

### Table: `behavior_logs`
| Column        | Type    | Description                      |
|--------------|---------|----------------------------------|
| id           | INTEGER | Primary key (auto)               |
| user_id      | TEXT    | User identifier                  |
| date         | TEXT    | Date (YYYY-MM-DD)                |
| sleep_hours  | FLOAT   | Hours of sleep                   |
| screen_time  | FLOAT   | Hours of screen use              |
| steps        | INTEGER | Daily step count                 |
| fatigue_score| FLOAT   | Actual fatigue 0–10              |
| created_at   | DATETIME| Auto timestamp                   |

### Table: `predictions`
| Column            | Type    | Description                  |
|------------------|---------|------------------------------|
| id               | INTEGER | Primary key (auto)           |
| user_id          | TEXT    | User identifier              |
| predicted_date   | TEXT    | Date being predicted         |
| predicted_fatigue| FLOAT   | Predicted fatigue 0–10       |
| created_at       | DATETIME| Auto timestamp               |

---

## 4. 🔌 API Endpoints

| Method | Endpoint        | Description                                |
|--------|-----------------|--------------------------------------------|
| GET    | `/`             | Health check                               |
| POST   | `/generate-data`| Generate N days of synthetic data          |
| POST   | `/train-model`  | Train LSTM on stored data                  |
| POST   | `/predict`      | Predict next-day fatigue                   |
| GET    | `/history`      | Get last 7 days of behavioral data         |
| GET    | `/predictions`  | Get 5 most recent predictions              |

Auto-generated API docs: **http://localhost:8000/docs**

---

## 5. ⚙️ Setup Instructions (Step by Step)

### Prerequisites
- Python 3.10 or 3.11 ([download](https://python.org))
- Node.js 18+ ([download](https://nodejs.org))
- A terminal (Mac: Terminal, Windows: PowerShell or Git Bash)

---

### Step 1: Clone / Download the project

If you have git:
```bash
git clone <your-repo-url>
cd ai-digital-twin
```

Or just download and unzip the folder.

---

### Step 2: Set up the Python Backend

Open a terminal window and navigate to the backend folder:

```bash
cd ai-digital-twin/backend
```

Create a virtual environment (keeps your Python packages organized):
```bash
# Mac/Linux:
python3 -m venv venv
source venv/bin/activate

# Windows:
python -m venv venv
venv\Scripts\activate
```

Install required packages:
```bash
pip install -r requirements.txt
```

> ⏳ PyTorch is large (~800MB). This may take a few minutes.

Start the backend server:
```bash
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

✅ Backend is running! Keep this terminal open.

---

### Step 3: Set up the React Frontend

Open a **second terminal window**:

```bash
cd ai-digital-twin/frontend
npm install
npm run dev
```

You should see:
```
  VITE v5.x  ready in 300ms
  ➜  Local:   http://localhost:3000/
```

✅ Frontend is running! Visit **http://localhost:3000** in your browser.

---

## 6. 🎮 How to Use the App

Follow these steps in order:

### Step 1: Generate Data
1. Click **"⚙️ Generate Data"** in the top nav
2. Slide the slider to choose how many days (60 is good)
3. Click **"Generate Data"**
4. You should see a success message

### Step 2: Train the Model
1. Click **"🏋️ Train Model"**
2. Click **"Train LSTM Model"**
3. Wait 10–30 seconds for training to complete
4. You'll see the loss chart showing the AI learning

### Step 3: Predict Fatigue
1. Click **"🔮 Predict"**
2. Review the last 7 days table
3. Click **"Predict Tomorrow's Fatigue"**
4. See the score (0–10) + personalized recommendations

### Step 4: View Dashboard
1. Click **"📊 Dashboard"** to see the full history chart and data table

---

## 7. 🚀 Future Upgrade Roadmap

### What is a "Digital Twin" exactly?

A **Digital Twin** is a real-time AI model of you — not a generic model, but *your specific model*. Instead of using population averages, it learns YOUR personal patterns:
- Your body's unique sleep response
- Your specific screen fatigue curve
- Your personal activity baseline

As more of YOUR data comes in, it improves its predictions of YOU specifically.

---

### Phase 2: More Input Signals

| Signal           | How to Add                                      | Why It Helps                        |
|------------------|-------------------------------------------------|--------------------------------------|
| **Typing rhythm** | Browser extension tracking WPM + error rate     | Cognitive fatigue indicator          |
| **Voice energy**  | Microphone amplitude analysis during calls      | Emotional + physical energy state    |
| **HRV / Heart rate**| Wearable API (Fitbit, Apple Watch, Oura)     | Most direct physiological signal     |
| **Mood journal**  | Daily 1-click mood rating in UI                 | Connects emotion to behavior         |

---

### Phase 3: Real User Data

Replace `/generate-data` with:
- A **manual data entry form** (enter yesterday's sleep/steps)
- **Wearable sync** (Fitbit/Garmin/Apple Health API integration)
- **Continuous logging** (background passive tracking via app)

---

### Phase 4: Reinforcement Learning

Instead of just predicting fatigue, the AI becomes an **active coach**:

```
Current Behavior → Predict Fatigue → Suggest Action → User Follows/Ignores 
                         ↑                                      ↓
              Update model based on outcome ←─────────────── Track result
```

The model learns which suggestions actually work for *you*.
Library: **Stable Baselines3** (wraps PyTorch RL algorithms)

---

### Phase 5: Personalized Medicine (Future)

- Integrate with lab results (blood work) via HL7 FHIR API
- Track medication timing vs. energy patterns
- Add clinician-facing dashboard (doctor sees twin summary)
- Federated learning so data never leaves your device

---

### Phase 6: Multi-User + Mobile

- Add JWT authentication (user accounts)
- React Native mobile app
- Push notifications: "You're predicted to have high fatigue tomorrow"
- Weekly twin report (PDF/email)

---

## 8. 📐 Architecture Upgrade Path

```
MVP (Now):
  React → FastAPI → SQLite → PyTorch LSTM

Production:
  React Native App
      ↓
  API Gateway (rate limiting, auth)
      ↓
  FastAPI (multiple workers, Docker)
      ↓
  PostgreSQL (persistent, scalable)
      ↓
  PyTorch serving (TorchServe or ONNX Runtime)
      ↓
  MLflow (experiment tracking, model versioning)
      ↓
  Redis (caching predictions)
```

---

## 9. ❓ Troubleshooting

**"CORS error" in browser:**
→ Make sure the backend is running on port 8000

**"Not enough data to train":**
→ Run Generate Data first

**"Model not trained yet":**
→ Run Train Model first

**PyTorch install fails:**
→ Try: `pip install torch --index-url https://download.pytorch.org/whl/cpu`

---

*Built with ❤️ — FastAPI + PyTorch + React*
