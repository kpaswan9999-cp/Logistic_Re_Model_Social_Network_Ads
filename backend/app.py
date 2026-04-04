from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import pandas as pd
import json
from datetime import datetime
import uuid

app = Flask(__name__)
# Enable CORS for all domains so Vercel can fetch securely
CORS(app)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.pkl')
HISTORY_FILE = os.path.join(BASE_DIR, 'history.json')

# Load the trained model pipeline
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Helper to manage history
def get_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, 'r') as f:
            history = json.load(f)
            # Ensure all entries have an ID
            updated = False
            for entry in history:
                if 'id' not in entry:
                    entry['id'] = str(uuid.uuid4())
                    updated = True
            if updated:
                with open(HISTORY_FILE, 'w') as f:
                    json.dump(history, f)
            return history
    except:
        return []

def add_to_history(age, salary, prediction, probability):
    history = get_history()
    entry = {
        'id': str(uuid.uuid4()),
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'age': age,
        'salary': salary,
        'prediction': int(prediction),
        'probability': round(float(probability) * 100, 2),
        'status': 'Purchased' if prediction == 1 else 'Not Purchased'
    }
    history.append(entry)
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history[-50:], f) # Keep last 50 entries
    return entry

def delete_entry(entry_id):
    history = get_history()
    initial_len = len(history)
    updated_history = [e for e in history if e.get('id') != entry_id]
    with open(HISTORY_FILE, 'w') as f:
        json.dump(updated_history, f)
    return len(updated_history) < initial_len

# --- REST API Endpoints ---

@app.route('/health', methods=['GET'])
def health_check():
    """Simple status check for Render."""
    return jsonify({"status": "Systems Online", "model_loaded": model is not None}), 200

@app.route('/api/history', methods=['GET'])
def get_history_route():
    history = get_history()
    return jsonify(history), 200

@app.route('/api/history/<entry_id>', methods=['DELETE'])
def delete_history_entry(entry_id):
    success = delete_entry(entry_id)
    if success:
        return jsonify({'success': True}), 200
    else:
        return jsonify({'error': 'Entry not found'}), 404

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.get_json()
        age = float(data.get('age'))
        salary = float(data.get('salary'))
        
        # Prepare input for pipeline
        X_new = pd.DataFrame([[age, salary]], columns=['Age', 'EstimatedSalary'])
        
        # Predict
        prediction = model.predict(X_new)[0]
        probability = model.predict_proba(X_new)[0][1] # Probability of Purchase (1)
        
        # Add to History
        entry = add_to_history(age, salary, prediction, probability)
        
        return jsonify({
            'success': True,
            'prediction': entry['prediction'],
            'probability': entry['probability'],
            'age': entry['age'],
            'salary': entry['salary'],
            'timestamp': entry['timestamp'],
            'status': entry['status']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
