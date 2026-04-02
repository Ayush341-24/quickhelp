"""
=============================================================================
NLP Problem Classifier Module
=============================================================================
AI CONCEPT: Natural Language Processing (NLP) + Text Classification

This module uses a trained TF-IDF + Naive Bayes pipeline to classify
user-described problems into service categories.

Pipeline:
  User Text → TF-IDF Vectorization → Naive Bayes → Category Prediction

The TF-IDF vectorizer converts human-readable text into numerical features
that the Naive Bayes classifier can process. The classifier then uses
Bayes' theorem to compute the most probable category.
=============================================================================
"""

import pickle
import os
import numpy as np

class ProblemClassifier:
    """
    Classifies user problem descriptions into service categories
    using NLP (TF-IDF) and Naive Bayes classification.
    """
    
    def __init__(self):
        """Load the pre-trained model and vectorizer from disk."""
        model_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'saved_models')
        
        # Load the TF-IDF vectorizer (converts text → numerical features)
        with open(os.path.join(model_dir, 'tfidf_vectorizer.pkl'), 'rb') as f:
            self.vectorizer = pickle.load(f)
        
        # Load the trained Naive Bayes classifier
        with open(os.path.join(model_dir, 'classifier.pkl'), 'rb') as f:
            self.model = pickle.load(f)
        
        print("  ✓ Problem Classifier loaded successfully")
    
    def classify(self, text: str) -> dict:
        """
        Classify a problem description into a service category.
        
        AI Process:
        1. Preprocess: Convert to lowercase
        2. Vectorize: TF-IDF transforms text into feature vector
        3. Predict: Naive Bayes computes P(category|text) for each category
        4. Return: Category with highest probability
        
        Args:
            text: User's problem description (e.g., "My AC is not cooling")
            
        Returns:
            dict with predicted category, confidence score, and all probabilities
        """
        # Step 1: Preprocess the input text
        text_clean = text.lower().strip()
        
        # Step 2: Transform text to TF-IDF vector
        # This creates a sparse matrix of TF-IDF features
        text_vector = self.vectorizer.transform([text_clean])
        
        # Step 3: Get prediction and probability scores
        # predict() returns the most likely class
        prediction = self.model.predict(text_vector)[0]
        
        # predict_proba() returns probability for each class
        # This shows HOW CONFIDENT the model is in its prediction
        probabilities = self.model.predict_proba(text_vector)[0]
        
        # Step 4: Build confidence map (category → probability)
        classes = self.model.classes_
        confidence_map = {}
        for cls, prob in zip(classes, probabilities):
            confidence_map[cls] = round(float(prob) * 100, 2)
        
        # Maximum probability is the model's confidence
        confidence = round(float(max(probabilities)) * 100, 2)
        
        return {
            "predicted_service": prediction,
            "confidence": confidence,
            "all_probabilities": confidence_map
        }