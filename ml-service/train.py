import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

print("🤖 Training Udaan Fraud Detection Model...")

# ── Generate synthetic training data ──────────────────────
np.random.seed(42)
n_samples = 5000

# Features
amounts        = np.random.exponential(scale=3000, size=n_samples)
is_night       = np.random.binomial(1, 0.2, n_samples)
is_intl        = np.random.binomial(1, 0.1, n_samples)
is_new_contact = np.random.binomial(1, 0.15, n_samples)
is_suspicious  = np.random.binomial(1, 0.12, n_samples)
is_multiple_loc = np.random.binomial(1, 0.08, n_samples)
is_diff_city   = np.random.binomial(1, 0.2, n_samples)
amount_normalized = np.clip(amounts / 50000, 0, 1)

# Create fraud labels based on risk factors
fraud_score = (
    0.30 * is_suspicious +
    0.25 * is_intl +
    0.20 * is_night +
    0.15 * is_multiple_loc +
    0.10 * is_new_contact +
    0.15 * (amount_normalized > 0.4).astype(int) +
    0.10 * is_diff_city
)

# Add noise
fraud_score += np.random.normal(0, 0.05, n_samples)
fraud_score = np.clip(fraud_score, 0, 1)

# Binary fraud label (threshold 0.35)
is_fraud = (fraud_score > 0.35).astype(int)

# Create DataFrame
df = pd.DataFrame({
    'amount_normalized': amount_normalized,
    'is_night':          is_night,
    'is_international':  is_intl,
    'is_new_contact':    is_new_contact,
    'is_suspicious_keyword': is_suspicious,
    'is_multiple_locations': is_multiple_loc,
    'is_different_city': is_diff_city,
    'is_fraud':          is_fraud,
})

print(f"📊 Dataset: {n_samples} samples")
print(f"   Fraud cases: {is_fraud.sum()} ({is_fraud.mean()*100:.1f}%)")
print(f"   Safe cases:  {(1-is_fraud).sum()} ({(1-is_fraud).mean()*100:.1f}%)")

# ── Train Model ────────────────────────────────────────────
X = df.drop('is_fraud', axis=1)
y = df['is_fraud']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=8,
    random_state=42,
    class_weight='balanced'
)

model.fit(X_train, y_train)

# ── Evaluate ───────────────────────────────────────────────
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n✅ Model trained!")
print(f"   Accuracy: {accuracy*100:.1f}%")
print(f"\n📈 Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Safe', 'Fraud']))

# Feature importance
print("🔍 Feature Importance:")
for feat, imp in sorted(zip(X.columns, model.feature_importances_), key=lambda x: -x[1]):
    print(f"   {feat}: {imp:.3f}")

# ── Save Model ─────────────────────────────────────────────
os.makedirs('model', exist_ok=True)
joblib.dump(model, 'model/fraud_model.pkl')
joblib.dump(list(X.columns), 'model/feature_names.pkl')

print("\n💾 Model saved to model/fraud_model.pkl")
print("🚀 Ready to serve predictions!")