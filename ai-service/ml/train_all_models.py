"""
=============================================================================
AI Model Training Script
=============================================================================
This script trains ALL AI/ML models used in the system:
1. NLP Text Classifier (TF-IDF + Naive Bayes) - Classifies service requests
2. Price Predictor (Linear Regression) - Predicts service pricing
3. Sentiment Analyzer (TF-IDF + Logistic Regression) - Analyzes review sentiment

AI CONCEPTS DEMONSTRATED:
- Natural Language Processing (NLP): Converting text to numerical features
- TF-IDF: Term Frequency-Inverse Document Frequency vectorization
- Naive Bayes: Probabilistic classifier based on Bayes' theorem
- Linear Regression: Predicting continuous values (prices)
- Logistic Regression: Multi-class classification for sentiment
- Train/Test Split: Evaluating model performance
=============================================================================
"""

import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error
from sklearn.preprocessing import LabelEncoder

# Create saved_models directory if it doesn't exist
os.makedirs('saved_models', exist_ok=True)

print("=" * 70)
print("AI MODEL TRAINING PIPELINE")
print("=" * 70)


# =============================================================================
# MODEL 1: NLP Service Request Classifier
# =============================================================================
# AI CONCEPT: Text Classification using NLP
# 
# How it works:
# 1. TF-IDF converts text into numerical vectors
#    - TF (Term Frequency): How often a word appears in a document
#    - IDF (Inverse Document Frequency): How rare a word is across all documents
#    - Words that are frequent in one document but rare overall get higher scores
#
# 2. Multinomial Naive Bayes classifies the vectors
#    - Based on Bayes' Theorem: P(class|features) = P(features|class) * P(class) / P(features)
#    - "Naive" because it assumes features are independent
#    - "Multinomial" because it works with word count/frequency features
#    - Very effective for text classification tasks
# =============================================================================

print("\n[1/3] Training NLP Service Request Classifier...")
print("-" * 50)

# Load training data
service_data = pd.read_csv('data/service_requests.csv')
print(f"  Loaded {len(service_data)} training samples")
print(f"  Categories: {service_data['category'].unique()}")

# Step 1: TF-IDF Vectorization
# Convert text descriptions into numerical feature vectors
# max_features=1000: Use top 1000 most important words
# ngram_range=(1,2): Consider single words AND word pairs (bigrams)
#   e.g., "not cooling" is more informative than "not" and "cooling" separately
tfidf_vectorizer = TfidfVectorizer(
    max_features=1000,
    ngram_range=(1, 2),
    stop_words='english',  # Remove common words like "the", "is", "at"
    lowercase=True  # Convert all text to lowercase for consistency
)

# Transform text data into TF-IDF feature matrix
X_text = tfidf_vectorizer.fit_transform(service_data['text'])
y_labels = service_data['category']

print(f"  TF-IDF Feature Matrix Shape: {X_text.shape}")
print(f"  (Each text is now a vector of {X_text.shape[1]} features)")

# Step 2: Split data into training and testing sets
# 80% for training, 20% for testing
# random_state=42 ensures reproducible results
X_train, X_test, y_train, y_test = train_test_split(
    X_text, y_labels, test_size=0.2, random_state=42
)

# Step 3: Train Multinomial Naive Bayes classifier
# alpha=0.1: Laplace smoothing parameter (prevents zero probability issues)
classifier = MultinomialNB(alpha=0.1)
classifier.fit(X_train, y_train)

# Step 4: Evaluate the model
y_pred = classifier.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\n  Classification Accuracy: {accuracy:.2%}")
print(f"\n  Detailed Classification Report:")
print(classification_report(y_test, y_pred, zero_division=0))

# Save the trained model and vectorizer using pickle (serialization)
with open('saved_models/classifier.pkl', 'wb') as f:
    pickle.dump(classifier, f)
with open('saved_models/tfidf_vectorizer.pkl', 'wb') as f:
    pickle.dump(tfidf_vectorizer, f)

print("  ✓ Classifier model saved successfully!")


# =============================================================================
# MODEL 2: Price Predictor using Linear Regression
# =============================================================================
# AI CONCEPT: Regression Analysis
#
# How it works:
# Linear Regression finds the best-fit line through the data
# Formula: Price = w1*category + w2*complexity + w3*distance + w4*experience + bias
#
# The model learns the weights (w1, w2, w3, w4) and bias that minimize
# the Mean Squared Error (MSE) between predicted and actual prices.
#
# This is a supervised learning approach where we learn from historical
# pricing data to predict future service costs.
# =============================================================================

print("\n[2/3] Training Price Predictor (Linear Regression)...")
print("-" * 50)

# Load pricing data
pricing_data = pd.read_csv('data/pricing_data.csv')
print(f"  Loaded {len(pricing_data)} pricing records")

# Step 1: Encode categorical variable (category) into numbers
# LabelEncoder converts text labels to integers:
# e.g., "AC Repair" -> 0, "Carpenter" -> 1, "Electrician" -> 2, etc.
price_label_encoder = LabelEncoder()
pricing_data['category_encoded'] = price_label_encoder.fit_transform(pricing_data['category'])

print(f"  Category Encoding: {dict(zip(price_label_encoder.classes_, price_label_encoder.transform(price_label_encoder.classes_)))}")

# Step 2: Prepare feature matrix and target variable
# Features: category (encoded), complexity level, distance, experience years
# Target: estimated price
X_price = pricing_data[['category_encoded', 'complexity', 'distance', 'experience_years']].values
y_price = pricing_data['estimated_price'].values

# Step 3: Split data
X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(
    X_price, y_price, test_size=0.2, random_state=42
)

# Step 4: Train Linear Regression model
# The model finds optimal coefficients using Ordinary Least Squares (OLS)
price_model = LinearRegression()
price_model.fit(X_train_p, y_train_p)

# Step 5: Evaluate
y_pred_p = price_model.predict(X_test_p)
mse = mean_squared_error(y_test_p, y_pred_p)
rmse = np.sqrt(mse)
print(f"\n  Root Mean Squared Error (RMSE): ₹{rmse:.2f}")
print(f"  Model Coefficients: {price_model.coef_}")
print(f"  Model Intercept: {price_model.intercept_:.2f}")
print(f"  Interpretation:")
print(f"    - Category effect: ₹{price_model.coef_[0]:.2f} per category unit")
print(f"    - Complexity effect: ₹{price_model.coef_[1]:.2f} per complexity level")
print(f"    - Distance effect: ₹{price_model.coef_[2]:.2f} per km")
print(f"    - Experience effect: ₹{price_model.coef_[3]:.2f} per year of experience")

# Save the model
with open('saved_models/price_model.pkl', 'wb') as f:
    pickle.dump(price_model, f)
with open('saved_models/price_label_encoder.pkl', 'wb') as f:
    pickle.dump(price_label_encoder, f)

print("  ✓ Price predictor model saved successfully!")


# =============================================================================
# MODEL 3: Sentiment Analyzer using Logistic Regression
# =============================================================================
# AI CONCEPT: Multi-class Text Classification
#
# How it works:
# 1. TF-IDF converts review text into numerical features (same as classifier)
# 2. Logistic Regression performs multi-class classification:
#    - Uses the sigmoid function to compute probabilities
#    - One-vs-Rest strategy: trains one classifier per class
#    - Outputs probability for each class (positive, neutral, negative)
#    - The class with highest probability wins
#
# Why Logistic Regression for sentiment?
# - Provides probability scores (confidence levels)
# - Works well with text features
# - Handles multiple classes naturally
# =============================================================================

print("\n[3/3] Training Sentiment Analyzer (Logistic Regression)...")
print("-" * 50)

# Load review data
review_data = pd.read_csv('data/reviews.csv')
print(f"  Loaded {len(review_data)} reviews")
print(f"  Sentiment Distribution:")
print(f"  {review_data['sentiment'].value_counts().to_dict()}")

# Step 1: TF-IDF Vectorization for reviews
# Separate vectorizer because review vocabulary differs from service requests
sentiment_vectorizer = TfidfVectorizer(
    max_features=500,
    ngram_range=(1, 2),
    stop_words='english',
    lowercase=True
)

X_sentiment = sentiment_vectorizer.fit_transform(review_data['text'])
y_sentiment = review_data['sentiment']

# Step 2: Split data
X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(
    X_sentiment, y_sentiment, test_size=0.2, random_state=42
)

# Step 3: Train Logistic Regression classifier
# C=1.0: Regularization strength (prevents overfitting)
# max_iter=1000: Maximum iterations for convergence
sentiment_model = LogisticRegression(
    # C=1.0,
    max_iter=1000
    # multi_class='multinomial',  # Handle all 3 classes simultaneously
    # solver='lbfgs'  # Optimization algorithm
)
sentiment_model.fit(X_train_s, y_train_s)

# Step 4: Evaluate
y_pred_s = sentiment_model.predict(X_test_s)
accuracy_s = accuracy_score(y_test_s, y_pred_s)
print(f"\n  Sentiment Analysis Accuracy: {accuracy_s:.2%}")
print(f"\n  Detailed Classification Report:")
print(classification_report(y_test_s, y_pred_s, zero_division=0))

# Save the model
with open('saved_models/sentiment_model.pkl', 'wb') as f:
    pickle.dump(sentiment_model, f)
with open('saved_models/sentiment_vectorizer.pkl', 'wb') as f:
    pickle.dump(sentiment_vectorizer, f)

print("  ✓ Sentiment analyzer model saved successfully!")


# =============================================================================
# SUMMARY
# =============================================================================
print("\n" + "=" * 70)
print("TRAINING COMPLETE - ALL MODELS SAVED")
print("=" * 70)
print(f"""
Models saved in 'saved_models/' directory:
  1. classifier.pkl          - Naive Bayes service classifier
  2. tfidf_vectorizer.pkl    - TF-IDF vectorizer for service texts
  3. price_model.pkl         - Linear Regression price predictor
  4. price_label_encoder.pkl - Category label encoder for pricing
  5. sentiment_model.pkl     - Logistic Regression sentiment analyzer
  6. sentiment_vectorizer.pkl- TF-IDF vectorizer for review texts

AI Concepts Demonstrated:
  • NLP (Natural Language Processing)
  • TF-IDF Feature Extraction
  • Naive Bayes Classification
  • Linear Regression
  • Logistic Regression
  • Train/Test Split Evaluation
  • Model Serialization (pickle)
""")