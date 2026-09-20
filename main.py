from pathlib import Path

import json
import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict
from fastapi.middleware.cors import CORSMiddleware
from autogluon.tabular import TabularPredictor


# =========================================================
# 1. PATH AYARLARI
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_DIR = BASE_DIR / "model" / "credit_fraud_weighted_final"
CONFIG_FILE = BASE_DIR / "model" / "model_config.json"


# =========================================================
# 2. MODEL CONFIGURATION
# =========================================================

if not MODEL_DIR.exists():
    raise RuntimeError(
        f"Model klasörü bulunamadı: {MODEL_DIR}"
    )

if not CONFIG_FILE.exists():
    raise RuntimeError(
        f"Model config bulunamadı: {CONFIG_FILE}"
    )


with open(CONFIG_FILE, "r", encoding="utf-8") as f:
    config = json.load(f)


THRESHOLD = float(config.get("threshold", 0.22))


# =========================================================
# 3. FEATURE'LAR
# =========================================================
FEATURES = config["feature_columns"]



# =========================================================
# 4. MODELİ YÜKLE
# =========================================================

try:

    predictor = TabularPredictor.load(
        str(MODEL_DIR)
    )

    print("===================================")
    print("MODEL BAŞARIYLA YÜKLENDİ")
    print(f"Model: {MODEL_DIR}")
    print(f"Threshold: {THRESHOLD}")
    print("===================================")

except Exception as e:

    raise RuntimeError(
        f"Model yüklenirken hata oluştu: {e}"
    )


# =========================================================
# 5. FASTAPI
# =========================================================

app = FastAPI(
    title="Credit Card Fraud Detection API",
    description="Credit card fraud prediction service",
    version="1.0.0",
)
app.mount(
    "/frontend",
    StaticFiles(directory=BASE_DIR / "frontend"),
    name="frontend"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# =========================================================
# FRONTEND
# =========================================================

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR),
    name="static"
)

@app.get("/", include_in_schema=False)
def home():
    return FileResponse(
        BASE_DIR / "frontend" / "index.html"
    )

# =========================================================
# 6. INPUT MODEL
# =========================================================

class Transaction(BaseModel):

    model_config = ConfigDict(extra="forbid")

    Time: float

    V1: float
    V2: float
    V3: float
    V4: float
    V5: float
    V6: float
    V7: float
    V8: float
    V9: float
    V10: float
    V11: float
    V12: float
    V13: float
    V14: float
    V15: float
    V16: float
    V17: float
    V18: float
    V19: float
    V20: float
    V21: float
    V22: float
    V23: float
    V24: float
    V25: float
    V26: float
    V27: float
    V28: float

    Amount: float


# =========================================================
# 7. HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "model_loaded": True,
        "threshold": THRESHOLD,
        "features": len(FEATURES),
    }


# =========================================================
# 8. PREDICT
# =========================================================

@app.post("/predict")
def predict(transaction: Transaction):

    try:

        # -------------------------------------------------
        # JSON → DataFrame
        # -------------------------------------------------

        data = pd.DataFrame(
            [transaction.model_dump()]
        )

        # -------------------------------------------------
        # FEATURE KONTROLÜ
        # -------------------------------------------------

        if list(data.columns) != FEATURES:

            raise HTTPException(
                status_code=400,
                detail="Input feature structure is invalid."
            )

        # -------------------------------------------------
        # NaN KONTROLÜ
        # -------------------------------------------------

        if data.isnull().any().any():

            raise HTTPException(
                status_code=400,
                detail="Input contains missing values."
            )

        # -------------------------------------------------
        # INFINITY KONTROLÜ
        # -------------------------------------------------

        if np.isinf(data.to_numpy()).any():

            raise HTTPException(
                status_code=400,
                detail="Input contains infinite values."
            )

        # -------------------------------------------------
        # MODEL TAHMİNİ
        # -------------------------------------------------

        probabilities = predictor.predict_proba(
            data
        )

        # Fraud sınıfının olasılığını al
        if 1 in probabilities.columns:

            fraud_probability = float(
                probabilities.iloc[0][1]
            )

        elif "1" in probabilities.columns:

            fraud_probability = float(
                probabilities.iloc[0]["1"]
            )

        else:

            raise RuntimeError(
                "Fraud probability column could not be found."
            )

        # -------------------------------------------------
        # THRESHOLD
        # -------------------------------------------------

        prediction = int(
            fraud_probability >= THRESHOLD
        )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "prediction": prediction,

            "label": (
                "fraud"
                if prediction == 1
                else "normal"
            ),

            "fraud_probability": round(
                fraud_probability,
                6
            ),

            "threshold": THRESHOLD,
        }

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail={
                "error": "Prediction failed",
                "message": str(e),
            },
        )