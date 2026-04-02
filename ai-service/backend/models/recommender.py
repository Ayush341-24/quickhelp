"""
=============================================================================
Intelligent Recommendation Engine
=============================================================================
AI CONCEPT: Content-Based Recommendation System

This module recommends the best service helpers based on a scoring algorithm
that considers multiple factors:

Recommendation Score = (rating * 0.5) + (experience_norm * 0.3) + (1/distance * 0.2)

The system:
1. Filters helpers by the predicted service category
2. Computes a composite score for each helper
3. Ranks helpers by score (highest first)
4. Returns top-N recommendations

This is a content-based filtering approach where recommendations are based
on helper attributes rather than collaborative filtering (user behavior).
=============================================================================
"""

import json
import os

class ServiceRecommender:
    """
    Recommends the best service helpers based on rating, distance,
    and availability using a weighted scoring algorithm.
    """
    
    def __init__(self):
        """Load helper data from JSON file."""
        data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'data')
        with open(os.path.join(data_dir, 'helpers.json'), 'r') as f:
            self.helpers = json.load(f)
        print("  ✓ Service Recommender loaded successfully")
    
    def recommend(self, service_category: str, top_n: int = 3, user_distance_km: float | None = None) -> list:
        """
        Recommend top-N helpers for a given service category.
        
        AI SCORING ALGORITHM:
        ---------------------
        score = (rating * 0.5) + (experience_norm * 0.3) + (1/distance * 0.2)
        where experience_norm = min(experience_years / 15, 1) and distance is floored
        to avoid division issues. Higher score → better match.
        
        Args:
            service_category: The predicted service type (e.g., "Electrician")
            top_n: Number of recommendations to return (default: 3)
            
        Returns:
            List of top-N helper dictionaries with scores
        """
        # Step 1: Filter helpers by service category
        # Only consider helpers whose role matches the predicted service
        matching_helpers = [
            h for h in self.helpers 
            if h['role'].lower() == service_category.lower()
        ]
        
        # If no exact match found, return all helpers (fallback strategy)
        if not matching_helpers:
            matching_helpers = self.helpers.copy()
        
        # Step 2: Composite score (project formula):
        # score = (rating * 0.5) + (experience * 0.3) + (1/distance * 0.2)
        # experience uses years normalized to [0, 1]; distance floored to avoid divide-by-zero.
        scored_helpers = []
        for helper in matching_helpers:
            effective_distance = helper['distance']
            if user_distance_km is not None:
                effective_distance = max(0.1, abs(helper['distance'] - user_distance_km))

            rating = float(helper['rating'])
            exp_norm = min(float(helper['experience_years']) / 15.0, 1.0)
            experience_term = exp_norm * 0.3
            inv_dist = 1.0 / max(float(effective_distance), 0.1)
            distance_term = inv_dist * 0.2

            total_score = (rating * 0.5) + experience_term + distance_term

            helper_with_score = helper.copy()
            helper_with_score['recommendation_score'] = round(total_score, 4)
            helper_with_score['score_breakdown'] = {
                'rating_term': round(rating * 0.5, 4),
                'experience_term': round(experience_term, 4),
                'distance_term': round(distance_term, 4),
            }
            scored_helpers.append(helper_with_score)
        
        # Step 3: Sort by score (descending) and return top N
        scored_helpers.sort(key=lambda x: x['recommendation_score'], reverse=True)
        
        return scored_helpers[:top_n]