# 🧑‍⚕️ Health DigiTwin — AI-Powered Personal Health Forecaster

An AI-powered full-stack health monitoring application that learns a user's behavioral patterns and predicts future health metrics using deep learning.

🔗 **Live Demo:** https://health-digitwin-bm7p.vercel.app  
🔗 **Backend API:** https://health-digitwin-1.onrender.com/docs  
🔗 **Repository:** https://github.com/srikanthnas/health-digitwin

---

# 🚀 Overview

Health DigiTwin helps users track their daily health habits, analyze behavioral trends, and predict future fatigue levels using an LSTM neural network.

The application combines modern web technologies, deep learning, and conversational AI to provide personalized health insights through an intuitive dashboard.

---

# ✨ Features

## 📊 Health Tracking

- Manual daily health logging
  - Sleep duration
  - Screen time
  - Step count
  - Fatigue score

- Natural Language Health Logging
  - Example:
    ```
    Slept 7 hours, walked 8000 steps, used phone for 5 hours.
    ```
  - AI automatically extracts and stores the data.

- Behavioral History
  - View the last seven days of health records
  - Edit or clear history whenever needed

---

## 🔮 AI Predictions

Using historical behavioral data, the application predicts:

- Tomorrow's fatigue score
- Stress level
- Sleep quality
- Energy level
- Burnout risk
- Weekly health trend

Predictions become personalized after training on user-specific data.

---

## 🩺 AI Doctor

Powered by **Groq's LLaMA 3.3 70B**

Features include:

- Personalized health advice
- Context-aware conversations
- Uses actual user health history
- Maintains chat history
- Encourages consultation with healthcare professionals when appropriate

---

## 🔐 Authentication

- JWT Authentication
- Secure password hashing with bcrypt
- User-specific health records
- Protected API endpoints

---

## 📈 Interactive Dashboard

- Fatigue trend visualization
- Weekly health statistics
- Behavioral history table
- Prediction summary cards
- One-click history reset

---

# 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, Vite, JavaScript, CSS |
| Backend | FastAPI, Python, SQLAlchemy |
| Database | SQLite |
| Authentication | JWT, Passlib, bcrypt |
| Machine Learning | PyTorch (LSTM Neural Network) |
| AI Assistant | Groq API (LLaMA 3.3 70B) |
| Deployment | Vercel, Render |

---

# 🧠 Machine Learning Pipeline

## LSTM Fatigue Prediction

The model learns behavioral patterns using:

- Sleep duration
- Screen time
- Daily step count
- Historical fatigue scores

### Workflow

1. Collect the previous seven days of behavioral data
2. Train an LSTM neural network
3. Learn temporal health patterns
4. Predict tomorrow's fatigue score
5. Generate additional wellness metrics

Unlike rule-based systems, the LSTM understands temporal dependencies, allowing previous behaviors to influence future predictions.

---

# 🤖 AI Doctor

The AI Doctor is powered by **Groq's LLaMA 3.3 70B**.

It receives summarized health information including:

- Average sleep
- Average screen time
- Step count
- Fatigue trend
- Weekly health pattern

This enables personalized responses instead of generic health advice.

---

# 📁 Project Structure

```text
health-digitwin/
│
├── backend/
│   ├── api/
│   │   └── routes.py
│   │
│   ├── db/
│   │   ├── database.py
│   │   └── models.py
│   │
│   ├── ml/
│   │   ├── lstm_model.py
│   │   └── trainer.py
│   │
│   ├── auth.py
│   ├── main.py
│   └── .env
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── GenerateData.jsx
        │   ├── TrainModel.jsx
        │   ├── PredictFatigue.jsx
        │   └── AIDoctor.jsx
        │
        ├── App.jsx
        └── App.css
```

---

# ⚙️ Installation

## Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API Key

---

## Backend

```bash
cd backend

pip install fastapi uvicorn sqlalchemy pydantic passlib python-jose torch numpy groq python-dotenv bcrypt==4.0.1
```

Create a `.env` file:

```env
GROQ_API_KEY=your_api_key
SECRET_KEY=your_secret_key
```

Run:

```bash
python -m uvicorn main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Visit:

```
http://localhost:5173
```

---

# 📖 Usage

1. Register a new account
2. Log your daily health data
3. (Optional) Generate synthetic data
4. Train the LSTM model
5. Predict tomorrow's fatigue
6. View dashboard analytics
7. Chat with the AI Doctor

---

# 📌 Future Enhancements

- Seven-day health forecasting
- What-if health simulator
- Calendar heatmap
- Habit streak tracking
- Overall wellness score
- Export reports as PDF
- Wearable device integration

---

# 📷 Screenshots

> Add screenshots of:

- Login
- Dashboard
- Data Logging
- Fatigue Prediction
- AI Doctor
- Charts

---

# ⚠️ Disclaimer

Health DigiTwin is intended for educational and personal wellness tracking purposes only.

The AI Doctor does **not** replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns.

---

# 👨‍💻 Developer

**Srikanth N A S**

Information Science & Engineering  
Global Academy of Technology, Bengaluru

### Connect

- GitHub: https://github.com/srikanthnas
- LinkedIn: *(Add your LinkedIn profile URL here)*

---

⭐ If you found this project useful, consider giving it a star on GitHub.
