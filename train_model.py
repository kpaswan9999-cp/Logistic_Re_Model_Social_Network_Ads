import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Load the dataset
data_path = 'Social_Network_Ads.csv'
df = pd.read_csv(data_path)

# Drop rows where target 'Purchased' is missing, then fix features
# (Usually 'Purchased' is fully there, but let's be safe)
df = df.dropna(subset=['Purchased'])

# Fill missing values for features with median
# We use .fillna() and assign back to avoid "inplace" behavior issues in some versions
df['Age'] = df['Age'].fillna(df['Age'].median())
df['EstimatedSalary'] = df['EstimatedSalary'].fillna(df['EstimatedSalary'].median())

# Features and target
X = df[['Age', 'EstimatedSalary']]
y = df['Purchased']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create a pipeline with scaling and model
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', LogisticRegression())
])

# Train the model
pipeline.fit(X_train, y_train)

# Save the pipeline
with open('model.pkl', 'wb') as f:
    pickle.dump(pipeline, f)

print("Model trained and saved as model.pkl (including scaler)")
print(f"Final training accuracy: {pipeline.score(X_train, y_train):.4f}")
print(f"Final testing accuracy: {pipeline.score(X_test, y_test):.4f}")
