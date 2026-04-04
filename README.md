# ConvergeAI: Predictive Social Network Intelligence 🚀

This repository contains a full-stack machine learning application that predicts social network user conversion behavior using an optimized **Logistic Regression** model. 

The project follows a "Decoupled Architecture," with a Flask-based inference engine and a high-fidelity, glassmorphic frontend tailored for a premium user experience.

---

## 🎨 Premium UI/UX Design

The frontend is designed with a **Deep Midnight tech aesthetic**, featuring:
- **Glassmorphism**: Translucent cards with deep backdrop blurring (`20px+`).
- **Futuristic Typography**: Using Google Fonts **Outfit** and **Space Grotesk**.
- **Interactive States**: Dynamic "Inference Orbs" with radial glowing pulses.
- **High-Fidelity Animations**: Particle background systems and probability transition bars.

---

## 🏗️ Deployment Architecture

### 1. 🤖 Backend: Render Deployment
The inference engine is built with **Flask** and **Gunicorn**.
- **Location**: `/backend`
- **Build Strategy**: `pip install -r requirements.txt`
- **Inference Strategy**: Features are scaled via `StandardScaler` (pre-trained) before being passed to the `GridSearchCV` optimized Logistic Regression model.

### 2. 💎 Frontend: Vercel Deployment
The UI is a static system designed for extreme performance.
- **Location**: `/frontend`
- **Integration**: Communication with the backend is handled via asynchronous `fetch` calls to the `/predict` endpoint.

---

## 🎯 Accuracy Benchmark
The model achieved an accuracy of **83.75%** on the hold-out test set after hyperparameter tuning for the `C` parameter and `solver` configurations.

---

### 🔧 Local Development
1. **Backend**: 
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
2. **Frontend**: Simply open `frontend/index.html` in a browser or serve with Live Server.

---
© 2026 CONVERGE ANALYTICS CORE. ALL RIGHTS RESERVED.
