import json
import re

class MedGuardDetector:
    def __init__(self, dataset_path="model/dataset.json"):
        with open(dataset_path, "r") as f:
            self.data = json.load(f)
            self.verified_facts = self.data.get("verified_facts", [])

    def rule_based_check(self, response):
        """Detect risky keywords and phrases."""
        risky_keywords = ["dosage", "surgery", "pregnancy", "dangerous", "prescription", "side effects"]
        detected = [kw for kw in risky_keywords if kw in response.lower()]
        
        # Check if medical claims are made without a disclaimer
        disclaimer_phrases = ["consult your doctor", "medical professional", "not medical advice", "disclaimer"]
        has_disclaimer = any(phrase in response.lower() for phrase in disclaimer_phrases)
        
        return detected, has_disclaimer

    def knowledge_validation(self, user_query, response):
        """Compare AI response with the trusted dataset."""
        for fact in self.verified_facts:
            # Simple keyword matching for demo purposes
            if fact["query"] in user_query.lower():
                # Check if the fact's safety aligns with the response
                # This is a simplified check: if 'not safe' is in fact and response, it's correct.
                if ("not safe" in fact["fact"].lower() and "safe" in response.lower()) or \
                   ("safe" in fact["fact"].lower() and "not safe" in response.lower()):
                    return "Hallucination Detected", 20, fact["fact"]
                return "Validated", 90, fact["fact"]
        
        return "Unknown", 50, "No direct data available for verification."

    def calculate_confidence(self, detected_risks, has_disclaimer, knowledge_status, knowledge_score):
        """Combined confidence calculation."""
        base_score = knowledge_score
        
        # Deduct for risky keywords if no disclaimer
        if detected_risks and not has_disclaimer:
            base_score -= 20
        
        # Bonus for having a disclaimer
        if has_disclaimer:
            base_score += 10
            
        # Ensure score is within 0-100
        return max(0, min(100, base_score))

    def detect(self, user_query, ai_response):
        """Main detection entry point."""
        risks, has_disclaimer = self.rule_based_check(ai_response)
        k_status, k_score, k_fact = self.knowledge_validation(user_query, ai_response)
        
        confidence = self.calculate_confidence(risks, has_disclaimer, k_status, k_score)
        
        safety_level = "Safe"
        explanation = "Response appears consistent with basic medical knowledge."
        
        if confidence < 40:
            safety_level = "High Risk"
            explanation = f"Potential hallucination detected. {k_fact if k_status == 'Hallucination Detected' else 'Risky medical claims without proper disclaimers.'}"
        elif confidence < 75:
            safety_level = "Uncertain"
            explanation = "Unable to fully verify all claims. Exercise caution and consult a professional."
            
        return {
            "safety_level": safety_level,
            "explanation": explanation,
            "confidence_score": confidence,
            "detected_risks": risks,
            "has_disclaimer": has_disclaimer
        }
