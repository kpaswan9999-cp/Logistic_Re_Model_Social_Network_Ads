import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Load the model and scaler
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    print("Model and Scaler loaded successfully.")
except Exception as e:
    print(f"Error loading model/scaler: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        age = float(data.get('age'))
        salary = float(data.get('salary'))
        
        # Pre-process inputs
        features = np.array([[age, salary]])
        features_scaled = scaler.transform(features)
        
        # Predict
        prediction = model.predict(features_scaled)[0]
        probability = model.predict_proba(features_scaled)[0].tolist()
        
        return jsonify({
            'success': True,
            'prediction': int(prediction),
            'probability': probability,
            'message': 'Prediction successful'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/status', methods=['GET'])
def status():
    return jsonify({'status': 'SYSTEM ONLINE', 'model': 'Logistic Regression v1.0'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
