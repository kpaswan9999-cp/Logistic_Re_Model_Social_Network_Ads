# Social Predictor Pro - Development Plan

The social network advertisement purchase prediction application has been developed with a premium glassmorphic UI and a robust Flask backend.

## Project Structure
- `backend/app.py`: Main Flask server.
- `backend/templates/index.html`: Modern, responsive entry point.
- `backend/static/css/style.css`: Glassmorphic styling with animated background.
- `backend/static/js/script.js`: Asynchronous interaction logic.
- `model.pkl`: A scikit-learn pipeline (Scaler + Logistic Regression) used for inference.

## Key Features
- **Advanced UI**: Glassmorphism design with backdrop blur and vibrant background blobs.
- **Robust ML Pipeline**: Features are automatically scaled before prediction using a saved pre-trained pipeline.
- **Real-time Feedback**: Interactive form with loaders and dynamic state coloring.
- **Probability Scoring**: Displays the AI's confidence level for each purchase intent analysis.

## How to Run
1. Ensure the model is trained by running: `python train_model.py`
2. Start the web server: `python backend/app.py`
3. Open your browser at: `http://127.0.0.1:5000`
