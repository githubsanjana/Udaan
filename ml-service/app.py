from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# ── Load Model ─────────────────────────────────────────────
model         = None
feature_names = None

def load_model():
    global model, feature_names
    try:
        model         = joblib.load('model/fraud_model.pkl')
        feature_names = joblib.load('model/feature_names.pkl')
        print("✅ Fraud detection model loaded!")
    except Exception as e:
        print(f"⚠️  Model not found: {e}")
        print("   Run 'python train.py' first to train the model")

load_model()

# ── Helper: extract features from request ─────────────────
def extract_features(data):
    amount      = float(data.get('amount', 0))
    merchant    = str(data.get('merchant', '')).lower()
    tx_type     = str(data.get('txType', ''))
    tx_time     = str(data.get('txTime', ''))
    location    = str(data.get('location', ''))

    suspicious_keywords = ['unknown', 'lottery', 'prize', 'lucky', 'winner',
                           'free', 'claim', 'urgent', 'reward', 'offer']

    features = {
        'amount_normalized':      min(amount / 50000, 1.0),
        'is_night':               1 if ('Late Night' in tx_time or 'Early Morning' in tx_time) else 0,
        'is_international':       1 if (tx_type == 'International' or 'International' in location) else 0,
        'is_new_contact':         1 if 'New Contact' in location else 0,
        'is_suspicious_keyword':  1 if any(kw in merchant for kw in suspicious_keywords) else 0,
        'is_multiple_locations':  1 if 'Multiple' in location else 0,
        'is_different_city':      1 if 'Different' in location else 0,
    }
    return features

# ── Routes ─────────────────────────────────────────────────
@app.route('/')
def home():
    return jsonify({
        'service': '✦ Udaan ML Fraud Detection',
        'status':  'running',
        'model':   'loaded' if model else 'not loaded — run train.py first',
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data     = request.get_json()
        features = extract_features(data)

        if model is None:
            # Fallback rule-based scoring
            score = _rule_based_score(features)
        else:
            X          = np.array([[features[f] for f in feature_names]])
            fraud_prob = model.predict_proba(X)[0][1]
            score      = int(fraud_prob * 100)

        # Determine risk level
        if score >= 70:
            risk_level = 'high'
        elif score >= 40:
            risk_level = 'medium'
        else:
            risk_level = 'safe'

        return jsonify({
            'success':    True,
            'riskScore':  score,
            'riskLevel':  risk_level,
            'flagged':    risk_level == 'high',
            'features':   features,
            'model_used': 'random_forest' if model else 'rule_based',
        })

    except Exception as e:
        return jsonify({ 'success': False, 'error': str(e) }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status':       'ok',
        'model_loaded': model is not None,
    })

# ── Fallback rule-based scoring ────────────────────────────
def _rule_based_score(features):
    score = 0
    if features['is_suspicious_keyword']:  score += 35
    if features['is_international']:       score += 20
    if features['is_night']:               score += 15
    if features['is_multiple_locations']:  score += 25
    if features['is_new_contact']:         score += 10
    if features['is_different_city']:      score += 10
    if features['amount_normalized'] > 0.4: score += 25
    elif features['amount_normalized'] > 0.2: score += 15
    elif features['amount_normalized'] > 0.05: score += 5
    return min(98, max(2, score))

if __name__ == '__main__':
    print("🚀 Starting Udaan ML Service on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)