# SocialFlow - Neural Engagement Predictor

# Live Link: https://logistic-re-model-social-network-ad.vercel.app

SocialFlow is an advanced, high-performance web application designed to predict consumer purchase behavior based on demographic data (Age and Estimated Salary) from Social Network Advertisements. 

This project utilizes a custom-trained **Logistic Regression** model and features a stunning, high-fidelity **"Deep Intelligence" Cybernetic UI** built with native Three.js 3D celestial animations.

## Architectural Architecture

The application has been decoupled into a modern two-tier architecture optimized for cloud deployment:

### 1. Static Frontend (Vercel)
Located in the `/frontend` directory, the UI is a premium, highly responsive static site.
- **Tech Stack:** Vanilla HTML5, CSS3, JavaScript.
- **Visual Engine:** Three.js for procedural 3D multi-universe particle backgrounds and Chart.js for data visualization.
- **Deployment:** Zero-config Vercel deployment. Serve statically from the `frontend` root.

### 2. REST API Backend (Render)
Located in the project root (`app.py`), the backend is a lightweight inference engine.
- **Tech Stack:** Python 3, Flask, Scikit-Learn, Pandas.
- **Security:** Fully configured with `Flask-CORS` for cross-origin security.
- **Deployment:** Render web service. Run using `gunicorn app:app`.

## Local Development

If you wish to run the decoupled architecture on your local machine:

**1. Start the Neural Backend:**
```bash
# Install dependencies
pip install -r requirements.txt

# Start the Flask API on port 5000
python app.py
```

**2. Start the Frontend:**
Open a separate terminal, start a static server, and view the interface.
```bash
# Start an HTTP server on port 8000
python -m http.server 8000 --directory frontend
```
Navigate to `http://localhost:8000/index.html` in your browser.

## Features
*   **3D Celestial Engine:** Custom procedurally generated galaxies orbiting in a three-dimensional view space.
*   **Neural Analytics Archive:** Cloud-synced inference history featuring "Age vs. Salary" scatter plotting to visualize the logistic boundary.
*   **Premium Micro-Animations:** Scroll-triggered Intersection Observer animations, glassmorphism, pulse indicators, and CSS ripple effects.
