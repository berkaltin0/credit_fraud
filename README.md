Credit Card Fraud Detection System
This repository contains an end-to-end machine learning pipeline designed to identify fraudulent credit card transactions. The project encompasses the full lifecycle of a machine learning application, from data preprocessing and model training to deployment via a high-performance API and containerization for seamless scaling.
Overview
Financial fraud costs the global economy billions of dollars annually. This project implements a robust classification system to detect anomalous patterns in transaction data. Given the highly imbalanced nature of fraud datasets, the system employs advanced sampling techniques and ensemble learning to ensure high recall without compromising precision.

The final product is a production-ready API that allows users to send transaction details and receive a fraud probability score in real-time.
Features
End-to-End Pipeline: Automated scripts for data ingestion, cleaning, and feature engineering.
Imbalance Handling: Implementation of SMOTE (Synthetic Minority Over-sampling Technique) to address class skewness.
High-Performance API: Built with FastAPI, providing low-latency inference endpoints.
Containerization: Fully Dockerized environment to ensure "works on my machine" consistency across development and production.
Model Validation: Comprehensive evaluation metrics including Precision-Recall curves and F1-score analysis.
Tech Stack
Category
Tools & Libraries
Programming
Python 3.9+
Machine Learning
Scikit-learn, XGBoost, Pandas, NumPy
API Framework
FastAPI, Uvicorn
Containerization
Docker, Docker Compose
Environment
Pipenv / Virtualenv

Project Structure
data/: Contains raw and processed datasets (ignored by git in production).
models/: Serialized model files (.pkl or .joblib).
notebooks/: Jupyter notebooks for Exploratory Data Analysis (EDA) and experimentation.
src/: Core logic including the training pipeline and preprocessing utilities.
app/: FastAPI application code and API schemas.
Dockerfile: Configuration for building the project image.
How to Run
Local Setup
Clone the repository:git clone https://github.com/<span type="placeholder" placeholder-type="person"></span>/credit-card-fraud-detection.git

cd credit-card-fraud-detection

Install dependencies:pip install -r requirements.txt
Run the API:uvicorn app.main:app --reload
Running with Docker
To run the entire system in a containerized environment:

Build the Docker image:docker build -t fraud-detection-api .
Run the container:docker run -p 8000:8000 fraud-detection-api

The API will be available at http://localhost:8000. You can access the interactive Swagger documentation at http://localhost:8000/docs.
API Usage
The system exposes a POST /predict endpoint. It expects a JSON payload representing transaction features.

Example Request:{

  "amount": 125.50,

  "v1": -1.3598,

  "v2": 0.0727,

  "...": "...",

  "time": 406

}

Example Response:{

  "is_fraud": false,

  "probability": 0.02,

  "status": "success"

}
Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.
License
This project is licensed under the MIT License. See the LICENSE file for details.

Developed by Person
Last Updated: Date
