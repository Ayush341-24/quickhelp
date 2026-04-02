"""
=============================================================================
Flask Backend API Server
=============================================================================
This server exposes RESTful API endpoints that connect the React frontend
to the Python AI/ML models.

API Endpoints:
  POST /api/classify      - NLP text classification
  POST /api/recommend     - Service helper recommendation
  POST /api/predict-price - Price prediction using regression
  POST /api/sentiment     - Sentiment analysis of reviews
  POST /api/emergency     - Emergency detection
  POST /api/analyze-all   - Combined analysis (all models at once)

Each endpoint receives JSON input and returns JSON output.
CORS is enabled to allow cross-origin requests from the React frontend.
=============================================================================
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("quickhelp.api")

# Add the project root to Python path so we can import our models
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Initialize Flask application
app = Flask(__name__)

# Enable CORS (Cross-Origin Resource Sharing)
# This allows the React frontend (running on port 5173) to call our API (port 5000)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# =============================================================================
# LOAD AI MODELS
# =============================================================================
# All models are loaded once at server startup for efficiency
# In production, you might use lazy loading or model serving frameworks
print("\n" + "=" * 50)
print("Loading AI Models...")
print("=" * 50)

from models.classifier import ProblemClassifier
from models.recommender import ServiceRecommender
from models.price_predictor import PricePredictor
from models.sentiment_analyzer import SentimentAnalyzer
from models.emergency_detector import EmergencyDetector

try:
    classifier = ProblemClassifier()
    recommender = ServiceRecommender()
    price_predictor = PricePredictor()
    sentiment_analyzer = SentimentAnalyzer()
    emergency_detector = EmergencyDetector()
    print("\n✅ All AI models loaded successfully!\n")
    logger.info("All AI models loaded successfully")
except Exception as e:
    print(f"\n❌ Error loading models: {e}")
    print("Please run 'python ml/train_all_models.py' first to train the models.")
    logger.exception("Failed to load AI models: %s", e)
    sys.exit(1)

# Lightweight in-memory conversation state for demo booking flows.
chat_sessions = {}


def _extract_request_features(text: str) -> dict:
    """Extract lightweight structured hints from free-form text."""
    txt = text.lower()

    complexity = 2
    if any(word in txt for word in ["simple", "minor", "small", "quick fix"]):
        complexity = 1
    elif any(word in txt for word in ["major", "complex", "urgent", "severe", "critical"]):
        complexity = 3

    distance = 2.0
    experience = 6
    if "near" in txt or "nearby" in txt:
        distance = 1.0
    elif "far" in txt or "outside city" in txt:
        distance = 4.0

    if complexity == 3:
        experience = 10
    elif complexity == 1:
        experience = 4

    urgency = "normal"
    if any(word in txt for word in ["urgent", "asap", "immediately", "emergency"]):
        urgency = "high"

    demand_index = 1.05
    if time.localtime().tm_wday >= 5:
        demand_index = 1.12  # weekend demand bump
    if urgency == "high":
        demand_index += 0.1

    return {
        "complexity": complexity,
        "distance": distance,
        "experience": experience,
        "urgency": urgency,
        "demand_index": round(demand_index, 2)
    }


URGENCY_KEYWORDS = (
    "urgent", "asap", "immediately", "emergency", "critical", "right now",
    "today", "quickly", "hurry", "fast",
)


def _urgency_detection(text: str, emergency: dict) -> dict:
    """Keyword + emergency severity based urgency."""
    low = text.lower()
    matched = [kw for kw in URGENCY_KEYWORDS if kw in low]
    if emergency.get("severity_level") == "HIGH" or emergency.get("is_emergency"):
        level = "high"
    elif matched:
        level = "high"
    elif any(w in low for w in ["soon", "when possible", "later"]):
        level = "medium"
    else:
        level = "normal"
    return {
        "is_urgent": level == "high",
        "level": level,
        "matched_keywords": matched,
    }


def _explanation_text(text: str, category: str) -> str:
    """Short, keyword-based explanation for the UI."""
    low = text.lower()
    bits = []
    if any(w in low for w in ["ac", "cool", "compressor", "gas"]):
        bits.append("Your description mentions cooling or AC-related terms.")
    if any(w in low for w in ["leak", "pipe", "water", "drain", "tap"]):
        bits.append("Water or plumbing terms suggest a possible plumbing issue.")
    if any(w in low for w in ["wire", "spark", "fuse", "trip", "socket"]):
        bits.append("Electrical keywords indicate you should verify safety before DIY fixes.")
    if any(w in low for w in ["noise", "sound", "loud", "vibration"]):
        bits.append("Unusual noise often points to mechanical wear or loose parts.")
    if not bits:
        bits.append(
            f"The model mapped your text to {category} based on learned patterns from similar requests."
        )
    bits.append(f"Predicted service category: {category}.")
    return " ".join(bits)


def _suggestion_text(category: str, urgency: dict, emergency: dict) -> str:
    """Rule-based tips (no external LLM)."""
    tips = {
        "AC Repair": "Try cleaning filters and checking thermostat mode first; if the unit still fails, avoid running it continuously to prevent compressor damage.",
        "Plumber": "Shut off the nearest water valve if there is active leakage; mop standing water to reduce slip risk.",
        "Electrician": "Do not touch exposed conductors; turn off the main supply if you see sparking. If breakers trip repeatedly, avoid resetting them until a professional inspects the circuit.",
        "Carpenter": "Measure openings and note material type (wood/ply) before scheduling so the helper can bring the right tools.",
        "Appliance Repair": "Note brand/model and error codes from the display; unplug the appliance before inspection.",
    }
    base = tips.get(category, "Share photos and exact location details to speed up dispatch and pricing.")
    if urgency["is_urgent"] or emergency.get("severity_level") == "HIGH":
        base += " Because this looks time-sensitive, prioritize a verified professional and mention urgency when booking."
    return base


def _build_process_steps(emergency: dict, assigned_helper: dict | None) -> list:
    return [
        {
            "step": "Issue received",
            "status": "done",
            "detail": "User request captured and preprocessed."
        },
        {
            "step": "AI diagnosis",
            "status": "done",
            "detail": "Problem classification and safety checks completed."
        },
        {
            "step": "Helper assignment",
            "status": "done" if assigned_helper else "in_progress",
            "detail": f"Best helper selected: {assigned_helper['name']}" if assigned_helper else "Selecting the best helper."
        },
        {
            "step": "Live tracking",
            "status": "pending",
            "detail": "Track helper ETA after booking confirmation."
        },
        {
            "step": "Service completion",
            "status": "pending",
            "detail": "Collect feedback and improve future recommendations."
        }
    ]


# =============================================================================
# API ENDPOINT 1: Problem Classification
# =============================================================================
@app.route('/api/classify', methods=['POST'])
def classify_problem():
    """
    NLP Text Classification Endpoint
    
    Input:  { "text": "My AC is not cooling properly" }
    Output: { "predicted_service": "AC Repair", "confidence": 95.2, ... }
    
    AI: TF-IDF + Naive Bayes
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        result = classifier.classify(text)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# API ENDPOINT 2: Helper Recommendation
# =============================================================================
@app.route('/api/recommend', methods=['POST'])
def recommend_helpers():
    """
    Recommendation System Endpoint
    
    Input:  { "service_category": "Electrician", "top_n": 3 }
    Output: [{ "name": "Rahul Sharma", "rating": 4.8, "score": 0.89, ... }]
    
    AI: Weighted Scoring Algorithm (Content-Based Filtering)
    """
    try:
        data = request.get_json()
        service_category = data.get('service_category', '')
        top_n = data.get('top_n', 3)
        user_distance_km = data.get('user_distance_km')
        
        if not service_category:
            return jsonify({"error": "No service category provided"}), 400
        
        result = recommender.recommend(service_category, top_n, user_distance_km)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# API ENDPOINT 3: Price Prediction
# =============================================================================
@app.route('/api/predict-price', methods=['POST'])
def predict_price():
    """
    Predictive Pricing Endpoint
    
    Input:  { "category": "Electrician", "complexity": 2, "distance": 1.5, "experience": 8 }
    Output: { "estimated_price": 1050, "price_range": {"low": 892, "high": 1207}, ... }
    
    AI: Linear Regression
    """
    try:
        data = request.get_json()
        category = data.get('category', 'Electrician')
        complexity = data.get('complexity', 2)
        distance = data.get('distance', 2.0)
        experience = data.get('experience', 5)
        demand_index = data.get('demand_index', 1.0)
        peak_hour = data.get('peak_hour', False)
        urgency_level = data.get('urgency_level', 'normal')
        
        result = price_predictor.predict(
            category, complexity, distance, experience,
            demand_index, peak_hour, urgency_level
        )
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# API ENDPOINT 4: Sentiment Analysis
# =============================================================================
@app.route('/api/sentiment', methods=['POST'])
def analyze_sentiment():
    """
    Sentiment Analysis Endpoint
    
    Input:  { "text": "Great service, very professional!" }
    Output: { "overall_sentiment": "positive", "scores": {"positive": 92.1, ...}, ... }
    
    AI: TF-IDF + Logistic Regression
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        result = sentiment_analyzer.analyze(text)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# API ENDPOINT 5: Emergency Detection
# =============================================================================
@app.route('/api/emergency', methods=['POST'])
def detect_emergency():
    """
    Emergency Detection Endpoint
    
    Input:  { "text": "There is fire and electrical sparking in kitchen" }
    Output: { "is_emergency": true, "severity_level": "HIGH", "alert_message": "...", ... }
    
    AI: Rule-Based Expert System (Keyword Detection)
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        result = emergency_detector.detect(text)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# API ENDPOINT 6: Combined Analysis (All Models)
# =============================================================================
@app.route('/api/analyze-all', methods=['POST'])
def analyze_all():
    """
    Combined Analysis Endpoint - Runs ALL AI models on the input text.
    This is the main endpoint used by the frontend dashboard.

    Input:  { "text": "My AC is not cooling and there might be a gas leak" }
    Output: Clean JSON with problem, category, confidence, price, sentiment,
            urgency, suggestion, explanation, top_helpers, plus legacy fields.
    """
    try:
        data = request.get_json() or {}
        text = (data.get('text') or '').strip()

        if not text:
            logger.warning("analyze-all called without text")
            return jsonify({"success": False, "error": "No text provided"}), 400

        logger.info("analyze-all request (chars=%s)", len(text))

        classification = classifier.classify(text)
        request_features = _extract_request_features(text)
        emergency = emergency_detector.detect(text)
        predicted_service = classification['predicted_service']
        confidence = classification.get('confidence', 0.0)

        recommendations = recommender.recommend(
            predicted_service,
            top_n=3,
            user_distance_km=request_features["distance"]
        )
        assigned_helper = recommendations[0] if recommendations else None

        is_peak_hour = 18 <= time.localtime().tm_hour <= 22
        urgency_level = "emergency" if emergency.get("severity_level") == "HIGH" else "normal"
        price = price_predictor.predict(
            category=predicted_service,
            complexity=request_features["complexity"],
            distance=request_features["distance"],
            experience=request_features["experience"],
            demand_index=request_features["demand_index"],
            peak_hour=is_peak_hour,
            urgency_level=urgency_level
        )
        sentiment = sentiment_analyzer.analyze(text)
        urgency = _urgency_detection(text, emergency)
        explanation = _explanation_text(text, predicted_service)
        suggestion = _suggestion_text(predicted_service, urgency, emergency)

        process_steps = _build_process_steps(emergency, assigned_helper)
        assistant_guidance = {
            "summary": f"We identified '{predicted_service}' and ranked the best helpers for faster resolution.",
            "next_actions": [
                "Review helper ratings, distance, and experience.",
                "Confirm booking to start live tracking.",
                "Share exact location or landmark in chat for faster arrival.",
            ],
        }

        top_helpers = []
        for h in recommendations[:3]:
            top_helpers.append({
                "id": h.get("id"),
                "name": h.get("name"),
                "role": h.get("role"),
                "rating": h.get("rating"),
                "distance_km": h.get("distance"),
                "experience_years": h.get("experience_years"),
                "availability": h.get("availability"),
                "score": h.get("recommendation_score"),
                "phone": h.get("phone"),
                "image_url": h.get("image_url"),
            })

        combined_result = {
            "success": True,
            "problem": text,
            "category": predicted_service,
            "confidence": confidence,
            "predicted_price": price.get("estimated_price"),
            "pricing": price,
            "sentiment": {
                "overall": sentiment.get("overall_sentiment"),
                "scores": sentiment.get("scores"),
                "confidence": sentiment.get("confidence"),
            },
            "urgency": urgency,
            "suggestion": suggestion,
            "explanation": explanation,
            "top_helpers": top_helpers,
            "emergency": emergency,
            "process_steps": process_steps,
            "assistant_guidance": assistant_guidance,
            # Legacy fields for older clients
            "classification": classification,
            "recommendations": recommendations,
            "assigned_helper": assigned_helper,
            "input_text": text,
        }

        return jsonify(combined_result)

    except Exception as e:
        logger.exception("analyze-all failed: %s", e)
        return jsonify({"success": False, "error": str(e)}), 500


# =============================================================================
# API ENDPOINT 7: Conversational AI Chat Assistant (Mocked / Demo)
# =============================================================================
@app.route('/api/chat', methods=['POST'])
def chat_assistant():
    """
    Rule-based chat assistant (no heavy external APIs).

    Input:  { "message": "My sink is leaking fast", "context": [] }
    Output: { "response": "...", "detected_category": "Plumber", "detected_intent": "..." }
    """
    try:
        data = request.get_json() or {}
        message = data.get('message', '').strip()
        if not message:
            logger.warning("chat called without message")
            return jsonify({"success": False, "error": "No message provided"}), 400

        logger.info("chat message (chars=%s)", len(message))
        message_lower = message.lower()
        session_id = data.get('session_id', 'default')
        context = data.get('context', [])
        session = chat_sessions.get(session_id, {
            "intent": "general",
            "service": None,
            "location": None,
            "urgency": "normal"
        })
        
        # Simple intent matching + ML fallback classification.
        response_text = "I'm your AI home service assistant. Please tell me what issue you're facing."
        intent = "general"
        action = None
        
        if any(word in message_lower for word in ["leak", "pipe", "sink", "tap", "drain"]):
            response_text = "It sounds like you have a plumbing issue. Water damage can spread quickly. I can find an expert Plumber for you right away."
            intent = "Plumber"
            action = "ANALYZE"
        elif any(word in message_lower for word in ["ac", "air conditioner", "not cooling", "cooling", "compressor"]) or (
            "cool" in message_lower and "ac" in message_lower
        ):
            response_text = (
                "It seems like an AC issue. You may need gas refill or cleaning, "
                "or a technician to inspect the compressor and filters."
            )
            intent = "AC Repair"
            action = "ANALYZE"
        elif any(word in message_lower for word in ["wire", "spark", "light", "socket", "power"]):
            response_text = "Electrical issues can be dangerous! Please stay away from sparking wires. I will find a certified Electrician."
            intent = "Electrician"
            action = "ANALYZE"
        elif any(word in message_lower for word in ["book", "confirm", "assign", "schedule"]):
            known_service = session.get("service") or session.get("intent")
            response_text = f"Booking initiated for {known_service}. I am assigning the best available helper now and preparing live tracking."
            intent = known_service or "general"
            action = "BOOK"

        if intent == "general":
            clf = classifier.classify(message)
            if clf.get("confidence", 0) >= 45:
                intent = clf["predicted_service"]
                action = "ANALYZE"
                response_text = (
                    f"I understood your issue as '{intent}' (confidence {clf['confidence']}%). "
                    "I will now analyze pricing, safety, and best helper options."
                )

        if any(word in message_lower for word in ["urgent", "asap", "immediately", "emergency"]):
            session["urgency"] = "high"

        if intent != "general":
            session["service"] = intent
            session["intent"] = intent

        # Persist a short rolling context window.
        session["last_messages"] = (context + [message])[-6:]
        chat_sessions[session_id] = session

        detected_category = None if intent == "general" else intent

        return jsonify({
            "success": True,
            "response": response_text,
            "detected_category": detected_category,
            "detected_intent": intent,
            "suggested_action": action,
            "booking_context": session,
            "support_tips": [
                "Mention urgency level if immediate support is needed.",
                "Share location hints like nearby landmark.",
                "Type 'book now' once you review recommendations.",
            ],
        })
    except Exception as e:
        logger.exception("chat failed: %s", e)
        return jsonify({"success": False, "error": str(e)}), 500


# =============================================================================
# API ENDPOINT 9: Real-Time GPS Tracking (Simulated)
# =============================================================================
@app.route('/api/gps-track', methods=['POST'])
def gps_track():
    """
    Simulate live helper tracking with ETA updates.

    Input: {"helper_id": 11, "step": 1}
    Output: {"current_location": {...}, "eta_minutes": 7, ...}
    """
    try:
        data = request.get_json() or {}
        helper_id = data.get('helper_id', 11)
        step = int(data.get('step', 0))

        # Demo route points (Bangalore-like coordinates for map simulation).
        route = [
            {"lat": 12.9716, "lng": 77.5946},
            {"lat": 12.9731, "lng": 77.5962},
            {"lat": 12.9745, "lng": 77.5987},
            {"lat": 12.9762, "lng": 77.6019},
            {"lat": 12.9781, "lng": 77.6044}
        ]
        destination = {"lat": 12.9792, "lng": 77.6061}
        idx = max(0, min(step, len(route) - 1))
        current = route[idx]

        # Very lightweight ETA estimate for demo use.
        remaining_hops = (len(route) - 1) - idx
        eta_minutes = max(2, remaining_hops * 3)
        progress_percent = round((idx / (len(route) - 1)) * 100, 1)

        nearest_helpers = recommender.recommend("Electrician", top_n=3, user_distance_km=1.5)
        nearest_helpers = [
            {
                "id": h["id"],
                "name": h["name"],
                "role": h["role"],
                "distance": h["distance"],
                "score": h["recommendation_score"]
            }
            for h in nearest_helpers
        ]

        return jsonify({
            "helper_id": helper_id,
            "current_location": current,
            "destination": destination,
            "eta_minutes": eta_minutes,
            "progress_percent": progress_percent,
            "route_points": route,
            "status": "arriving" if eta_minutes > 2 else "almost_there",
            "nearest_helpers": nearest_helpers
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# API ENDPOINT 8: Computer Vision Diagnostics (Mocked)
# =============================================================================
@app.route('/api/vision-analyze', methods=['POST'])
def vision_analyze():
    """
    Computer Vision Image Diagnostics Endpoint
    
    Input: Multipart form data with an image file
    Output: { "detected_problem": "Broken Pipe", "confidence": 0.92, "suggested_category": "Plumber" }
    """
    try:
        # In a real app, we would process request.files['image'] via a ResNet/CNN model
        # For demonstration, we return a mocked high-confidence inference 
        return jsonify({
            "detected_problem": "Water Leakage / Pipe Issue",
            "confidence": 0.89,
            "suggested_category": "Plumber",
            "message": "I processed the image and detected a plumbing leak."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# HEALTH CHECK ENDPOINT
# =============================================================================
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the server is running."""
    return jsonify({
        "status": "healthy",
        "models_loaded": True,
        "endpoints": [
            "/api/classify",
            "/api/recommend",
            "/api/predict-price",
            "/api/sentiment",
            "/api/emergency",
            "/api/analyze-all",
            "/api/chat",
            "/api/vision-analyze",
            "/api/gps-track"
        ]
    })


# =============================================================================
# RUN THE SERVER
# =============================================================================
if __name__ == '__main__':
    print("=" * 50)
    print("Starting AI Service Recommendation API Server")
    print("Server URL: http://localhost:5001")
    print("=" * 50)
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )