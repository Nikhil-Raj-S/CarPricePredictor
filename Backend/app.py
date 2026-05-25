from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Load model & build whitelists from training data at startup
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'LinearRegressionModel.pkl')
DATA_PATH  = os.path.join(os.path.dirname(__file__), 'Cleaned_quikr.csv')

model = pickle.load(open(MODEL_PATH, 'rb'))
df    = pd.read_csv(DATA_PATH)

VALID_COMPANIES  = set(df['company'].unique())
VALID_FUEL_TYPES = set(df['fuel_type'].unique())
VALID_NAMES      = set(df['name'].unique())

YEAR_MIN, YEAR_MAX = int(df['year'].min()), 2025
KMS_MIN,  KMS_MAX  = 0, 500_000


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def err(msg, code=400):
    return jsonify({'error': msg}), code


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})


@app.route('/options', methods=['GET'])
def options():
    """Return valid dropdown values for the frontend form."""
    return jsonify({
        'companies':  sorted(VALID_COMPANIES),
        'fuel_types': sorted(VALID_FUEL_TYPES),
        'names':      sorted(VALID_NAMES),
        'year_min':   YEAR_MIN,
        'year_max':   YEAR_MAX,
        'kms_max':    KMS_MAX,
    })


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(silent=True)

    if not data:
        return err('Request body must be JSON')

    # 1. Presence check
    required = ['name', 'company', 'year', 'kms_driven', 'fuel_type']
    missing = [f for f in required if f not in data or data[f] in ('', None)]
    if missing:
        return err(f"Missing fields: {', '.join(missing)}")

    # 2. Type check
    try:
        year       = int(data['year'])
        kms_driven = int(data['kms_driven'])
    except (ValueError, TypeError):
        return err('year and kms_driven must be whole numbers')

    # 3. Range check
    if not (YEAR_MIN <= year <= YEAR_MAX):
        return err(f'year must be between {YEAR_MIN} and {YEAR_MAX}')
    if not (KMS_MIN <= kms_driven <= KMS_MAX):
        return err(f'kms_driven must be between {KMS_MIN:,} and {KMS_MAX:,}')

    # 4. Whitelist check
    company   = str(data['company']).strip()
    fuel_type = str(data['fuel_type']).strip()
    name      = str(data['name']).strip()

    if company not in VALID_COMPANIES:
        return err(f'Unknown company: {company}')
    if fuel_type not in VALID_FUEL_TYPES:
        return err(f'fuel_type must be one of: {sorted(VALID_FUEL_TYPES)}')

    # 5. Predict (clamp to non-negative)
    input_df = pd.DataFrame([{
        'name':       name,
        'company':    company,
        'year':       year,
        'kms_driven': kms_driven,
        'fuel_type':  fuel_type,
    }])

    raw        = float(model.predict(input_df)[0])
    prediction = max(0, round(raw, 2))

    return jsonify({
        'predicted_price': prediction,
        'currency':        'INR',
        'formatted':       f'₹{prediction:,.0f}',
        'input':           input_df.iloc[0].to_dict(),
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)