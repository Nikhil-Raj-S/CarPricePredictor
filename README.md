# 🚗 CarPricePredictor

A full-stack machine learning web app that predicts the resale price of used cars listed on Quikr.

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.1-black?logo=flask)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3-orange?logo=scikit-learn)

---

## 📸 Overview

Enter a car's brand, model, year, kilometres driven, and fuel type — and the app instantly predicts its estimated resale value using a Linear Regression model trained on 815 real Quikr listings.

---

## 🧠 ML Model

- **Dataset**: Quikr used car listings (815 cleaned records)
- **Algorithm**: Linear Regression (sklearn Pipeline)
- **Features**: `name`, `company`, `year`, `kms_driven`, `fuel_type`
- **Target**: `Price` (INR)
- **Model selection**: Best model picked across 1000 random train/test splits

---

## 🗂️ Project Structure

```
CarPricePredictor/
├── backend/
│   ├── app.py                    # Flask API server
│   ├── requirements.txt          # Python dependencies
│   ├── LinearRegressionModel.pkl # Trained ML model
│   └── Cleaned_quikr.csv         # Cleaned dataset
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        └── App.jsx               # React UI
```

---

## ⚙️ Setup & Run

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend (Flask)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate.bat

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

Server runs at **http://localhost:5000**

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000**

---

## 🔌 API Reference

| Method | Endpoint   | Description                      |
|--------|------------|----------------------------------|
| GET    | `/health`  | Check server status              |
| GET    | `/options` | Get valid dropdown values        |
| POST   | `/predict` | Predict car price                |

### POST `/predict` — Example

**Request:**
```json
{
  "name": "Maruti Swift Dzire",
  "company": "Maruti",
  "year": 2017,
  "kms_driven": 45000,
  "fuel_type": "Petrol"
}
```

**Response:**
```json
{
  "predicted_price": 385000.0,
  "currency": "INR",
  "formatted": "₹3,85,000"
}
```

---

## ✅ Input Validation

| Field        | Rule                                         |
|--------------|----------------------------------------------|
| `name`       | Must be non-empty                            |
| `company`    | Must be a company from the training data     |
| `year`       | Integer between 1995 and 2025                |
| `kms_driven` | Integer between 0 and 500,000                |
| `fuel_type`  | One of: Petrol, Diesel, LPG                  |

---

## 🛣️ Roadmap

- [ ] Add Random Forest / XGBoost model comparison
- [ ] EDA dashboard with price charts by brand
- [ ] Deploy backend to Render.com
- [ ] Deploy frontend to Vercel
- [ ] Add confidence interval to predictions

---

## 👨‍💻 Author

**Nikhil Raj S**  
[![GitHub](https://img.shields.io/badge/GitHub-Nikhil--Raj--S-black?logo=github)](https://github.com/Nikhil-Raj-S)

---

## 📄 License

MIT License — free to use and modify.
