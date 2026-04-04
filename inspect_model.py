import pickle
import os

model_path = r'c:\Users\kpasw\ML Prect\Models\LOR\model.pkl'
if os.path.exists(model_path):
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        print(f"Model type: {type(model)}")
        if hasattr(model, 'feature_names_in_'):
            print(f"Features: {model.feature_names_in_}")
        elif hasattr(model, 'n_features_in_'):
            print(f"Number of features: {model.n_features_in_}")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print("Model file not found.")
