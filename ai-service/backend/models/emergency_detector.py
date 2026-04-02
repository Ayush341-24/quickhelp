"""
=============================================================================
Emergency Detection Module
=============================================================================
AI CONCEPT: Rule-Based Expert System + Keyword Detection

This module implements a rule-based AI approach to detect emergency situations
from user problem descriptions. Unlike ML models that learn from data,
this uses handcrafted rules based on domain knowledge.

Why Rule-Based for Emergency Detection?
- Safety-critical: Cannot afford false negatives (missing real emergencies)
- Well-defined patterns: Emergency terms are specific and known
- Explainable: Easy to understand WHY something was flagged
- No training data needed: Domain experts define the rules

Detection Strategy:
1. Exact keyword matching: Look for emergency-related words
2. Phrase matching: Detect multi-word emergency phrases
3. Severity scoring: Compute urgency level based on number of matches
4. Context analysis: Some words are more dangerous than others

This is an example of a Knowledge-Based System (expert system),
one of the earliest forms of AI.
=============================================================================
"""

import re

class EmergencyDetector:
    """
    Detects emergency situations from user input text using
    a rule-based keyword matching system (Expert System approach).
    """
    
    def __init__(self):
        """
        Initialize the emergency detection rules.
        
        These rules are based on domain knowledge about dangerous
        situations related to home services.
        """
        # HIGH SEVERITY: Immediate life-threatening situations
        self.high_severity_keywords = [
            'fire', 'burning', 'smoke', 'flames', 'explosion',
            'electric shock', 'electrocution', 'electrocuted',
            'gas leak', 'gas smell', 'carbon monoxide',
            'flood', 'flooding', 'water everywhere',
            'collapse', 'collapsed', 'falling ceiling',
            'sparking', 'electrical fire', 'short circuit fire',
            'unconscious', 'injured', 'hurt badly'
        ]
        
        # MEDIUM SEVERITY: Urgent but not immediately life-threatening
        self.medium_severity_keywords = [
            'urgent', 'emergency', 'asap', 'immediately',
            'dangerous', 'hazard', 'hazardous', 'risk',
            'sparks', 'sparking wire', 'exposed wire',
            'burst pipe', 'pipe burst', 'major leak',
            'no power', 'power outage', 'blackout',
            'overheating', 'very hot', 'melting',
            'broken glass', 'shattered'
        ]
        
        # LOW SEVERITY: Worth noting but not urgent
        self.low_severity_keywords = [
            'leak', 'leaking', 'dripping badly',
            'not working at all', 'completely broken',
            'strange smell', 'odd noise', 'loud noise',
            'crack', 'cracked', 'damaged severely'
        ]
        
        # Emergency type classifications
        self.emergency_types = {
            'fire': ['fire', 'burning', 'smoke', 'flames', 'explosion', 'electrical fire'],
            'electrical': ['electric shock', 'electrocution', 'sparking', 'exposed wire', 
                          'short circuit', 'sparks', 'electrocuted'],
            'gas': ['gas leak', 'gas smell', 'carbon monoxide'],
            'water': ['flood', 'flooding', 'burst pipe', 'pipe burst', 'water everywhere'],
            'structural': ['collapse', 'collapsed', 'falling ceiling', 'crack']
        }
        
        print("  ✓ Emergency Detector loaded successfully")
    
    def detect(self, text: str) -> dict:
        """
        Detect emergency situations in user input text.
        
        AI PROCESS (Rule-Based Expert System):
        1. Normalize text (lowercase)
        2. Scan for high, medium, and low severity keywords
        3. Classify emergency type(s)
        4. Compute severity score
        5. Generate appropriate alert message
        
        Severity Score Calculation:
          score = (high_matches * 3) + (medium_matches * 2) + (low_matches * 1)
          
          If score >= 3: HIGH severity
          If score >= 1: MEDIUM severity
          Otherwise: No emergency
        
        Args:
            text: User's problem description
            
        Returns:
            dict with emergency status, severity, type, and alert details
        """
        text_lower = text.lower().strip()
        
        # Step 1: Find matching keywords at each severity level
        high_matches = [kw for kw in self.high_severity_keywords if kw in text_lower]
        medium_matches = [kw for kw in self.medium_severity_keywords if kw in text_lower]
        low_matches = [kw for kw in self.low_severity_keywords if kw in text_lower]
        
        # Step 2: Compute severity score (weighted sum)
        severity_score = (len(high_matches) * 3) + (len(medium_matches) * 2) + (len(low_matches) * 1)
        
        # Step 3: Determine emergency type
        detected_types = []
        for etype, keywords in self.emergency_types.items():
            if any(kw in text_lower for kw in keywords):
                detected_types.append(etype)
        
        # Step 4: Determine if this is an emergency and its severity level
        is_emergency = severity_score >= 1
        
        if severity_score >= 3:
            severity_level = "HIGH"
            color = "red"
        elif severity_score >= 1:
            severity_level = "MEDIUM"
            color = "orange"
        else:
            severity_level = "NONE"
            color = "green"
        
        # Step 5: Generate alert message
        if is_emergency:
            if detected_types:
                type_str = ', '.join(detected_types).upper()
                alert_message = f"DANGER DETECTED: {type_str} HAZARD - Please take immediate precautions."
            else:
                alert_message = "URGENT SITUATION DETECTED - Please exercise caution."
            
            # Safety instructions based on emergency type
            safety_tips = self._get_safety_tips(detected_types)
        else:
            alert_message = "No emergency detected. Your request will be processed normally."
            safety_tips = []
        
        return {
            "is_emergency": is_emergency,
            "severity_level": severity_level,
            "severity_score": severity_score,
            "color": color,
            "alert_message": alert_message,
            "detected_types": detected_types,
            "matched_keywords": {
                "high": high_matches,
                "medium": medium_matches,
                "low": low_matches
            },
            "safety_tips": safety_tips,
            "analyzed_text": text
        }
    
    def _get_safety_tips(self, emergency_types: list) -> list:
        """
        Generate context-specific safety tips based on emergency type.
        This represents the 'knowledge base' of our expert system.
        """
        tips = {
            'fire': [
                "Evacuate immediately and call fire services (101)",
                "Do not use water on electrical fires",
                "Stay low to avoid smoke inhalation"
            ],
            'electrical': [
                "Do NOT touch any exposed wires or sparking equipment",
                "Turn off the main power supply if safe to do so",
                "Call emergency services if someone has been shocked",
                "Keep children and pets away from the area"
            ],
            'gas': [
                "Do NOT turn on any electrical switches",
                "Open all windows and doors for ventilation",
                "Evacuate the building immediately",
                "Call gas emergency services"
            ],
            'water': [
                "Turn off the main water supply",
                "Move electrical appliances away from water",
                "Turn off electricity in affected areas",
                "Document damage for insurance purposes"
            ],
            'structural': [
                "Evacuate the area immediately",
                "Do not re-enter until professionally inspected",
                "Call structural engineering services",
                "Report to local building authority"
            ]
        }
        
        all_tips = []
        for etype in emergency_types:
            if etype in tips:
                all_tips.extend(tips[etype])
        
        return all_tips if all_tips else ["Please contact emergency services if you feel unsafe."]