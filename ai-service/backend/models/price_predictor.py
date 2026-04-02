"""
=============================================================================
Predictive Pricing Module
=============================================================================
AI CONCEPT: Linear Regression for Price Prediction

This module uses a trained Linear Regression model to predict service prices
based on multiple input features.

Mathematical Model:
  Price = β₀ + β₁(category) + β₂(complexity) + β₃(distance) + β₄(experience)

Where:
  β₀ = Intercept (base price)
  β₁-β₄ = Learned coefficients (how much each factor affects price)

The model was trained on historical pricing data using Ordinary Least Squares
(OLS) to minimize the sum of squared differences between predicted and actual prices.

The output is a price RANGE (±15%) to account for real-world variability.
=============================================================================
"""

import pickle
import os
import numpy as np

class PricePredictor:
    """
    Predicts service pricing using Linear Regression.
    Takes category, complexity, distance, and experience as inputs.
    """
    
    def __init__(self):
        """Load the pre-trained Linear Regression model and label encoder."""
        model_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'saved_models')
        
        # Load the trained Linear Regression model
        with open(os.path.join(model_dir, 'price_model.pkl'), 'rb') as f:
            self.model = pickle.load(f)
        
        # Load the label encoder (to convert category names to numbers)
        with open(os.path.join(model_dir, 'price_label_encoder.pkl'), 'rb') as f:
            self.label_encoder = pickle.load(f)
        
        print("  ✓ Price Predictor loaded successfully")
    
    def predict(self, category: str, complexity: int = 2,
                distance: float = 2.0, experience: int = 5,
                demand_index: float = 1.0, peak_hour: bool = False,
                urgency_level: str = "normal") -> dict:
        """
        Predict the price range for a service.
        
        AI PROCESS:
        1. Encode category name to integer using LabelEncoder
        2. Create feature vector: [category_encoded, complexity, distance, experience]
        3. Apply Linear Regression: price = dot(features, coefficients) + intercept
        4. Compute price range: predicted_price ± 15%
        
        Args:
            category: Service type (e.g., "Electrician", "Plumber")
            complexity: Job complexity level (1=simple, 2=medium, 3=complex)
            distance: Distance to customer in km
            experience: Helper's years of experience
            
        Returns:
            dict with predicted price, range, and feature contributions
        """
        try:
            # Step 1: Encode category
            # If category is not in training data, default to first category
            if category in self.label_encoder.classes_:
                category_encoded = self.label_encoder.transform([category])[0]
            else:
                # Fallback: use the first known category
                category_encoded = 0
            
            # Step 2: Create feature vector
            features = np.array([[category_encoded, complexity, distance, experience]])
            
            # Step 3: Make prediction
            # Linear Regression: y = X @ w + b
            predicted_price = self.model.predict(features)[0]
            
            # Step 4: Apply dynamic pricing multipliers.
            demand_multiplier = max(0.8, min(demand_index, 1.8))
            peak_multiplier = 1.12 if peak_hour else 1.0
            urgency_map = {
                "normal": 1.0,
                "high": 1.18,
                "emergency": 1.3
            }
            urgency_multiplier = urgency_map.get(urgency_level.lower(), 1.0)
            dynamic_multiplier = demand_multiplier * peak_multiplier * urgency_multiplier
            predicted_price = predicted_price * dynamic_multiplier

            # Step 5: Compute price range (±15% for realistic estimate)
            # Real-world prices vary, so we provide a range
            margin = 0.15  # 15% margin
            price_low = max(200, predicted_price * (1 - margin))  # Minimum ₹200
            price_high = predicted_price * (1 + margin)
            
            # Step 6: Calculate feature contributions
            # Each coefficient shows how much that feature contributes to the price
            coefficients = self.model.coef_
            feature_names = ['category', 'complexity', 'distance', 'experience']
            feature_values = [category_encoded, complexity, distance, experience]
            
            contributions = {}
            for name, coef, val in zip(feature_names, coefficients, feature_values):
                contributions[name] = round(coef * val, 2)
            
            return {
                "estimated_price": round(predicted_price, 2),
                "price_range": {
                    "low": round(price_low, 2),
                    "high": round(price_high, 2)
                },
                "currency": "INR",
                "factors": {
                    "category": category,
                    "complexity": complexity,
                    "distance_km": distance,
                    "experience_years": experience,
                    "demand_index": round(demand_index, 2),
                    "peak_hour": peak_hour,
                    "urgency_level": urgency_level
                },
                "feature_contributions": contributions
                ,
                "pricing_breakdown": {
                    "demand_multiplier": round(demand_multiplier, 3),
                    "peak_multiplier": round(peak_multiplier, 3),
                    "urgency_multiplier": round(urgency_multiplier, 3),
                    "final_multiplier": round(dynamic_multiplier, 3)
                }
            }
        except Exception as e:
            # Fallback pricing if model fails
            base_prices = {
                "Electrician": 800,
                "Plumber": 700,
                "AC Repair": 1000,
                "Carpenter": 900,
                "Appliance Repair": 850
            }
            base = base_prices.get(category, 800)
            return {
                "estimated_price": base,
                "price_range": {"low": base * 0.8, "high": base * 1.2},
                "currency": "INR",
                "factors": {
                    "category": category,
                    "complexity": complexity,
                    "distance_km": distance,
                    "experience_years": experience
                },
                "error": str(e)
            }