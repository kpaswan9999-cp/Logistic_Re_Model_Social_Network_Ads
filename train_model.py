import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

def improve_train():
    try:
        df = pd.read_csv('Social_Network_Ads.csv')
        df['Age'] = df['Age'].fillna(df['Age'].median())
        df['EstimatedSalary'] = df['EstimatedSalary'].fillna(df['EstimatedSalary'].median())
        
        X = df[['Age', 'EstimatedSalary']]
        y = df['Purchased']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        sc = StandardScaler()
        X_train_scaled = sc.fit_transform(X_train)
        X_test_scaled = sc.transform(X_test)
        
        # Hyperparameter Tuning
        param_grid = {'C': [0.01, 0.1, 1, 10, 100], 'solver': ['liblinear', 'lbfgs']}
        grid = GridSearchCV(LogisticRegression(random_state=42), param_grid, cv=5, scoring='accuracy')
        grid.fit(X_train_scaled, y_train)
        
        best_model = grid.best_estimator_
        y_pred = best_model.predict(X_test_scaled)
        
        print(f"Best Accuracy: {accuracy_score(y_test, y_pred):.4f}")
        print(f"Best Params: {grid.best_params_}")
        
        with open('model.pkl', 'wb') as f:
            pickle.dump(best_model, f)
        with open('scaler.pkl', 'wb') as f:
            pickle.dump(sc, f)
        
        # Also copy to backend folder
        with open('backend/model.pkl', 'wb') as f:
            pickle.dump(best_model, f)
        with open('backend/scaler.pkl', 'wb') as f:
            pickle.dump(sc, f)
            
        print("Improved Model and Scaler saved.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    improve_train()
