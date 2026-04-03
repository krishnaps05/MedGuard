from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime
import random
from model.detector import MedGuardDetector

app = FastAPI(title="MedGuard: AI Hallucination Detector")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Detector
detector = MedGuardDetector(dataset_path="model/dataset.json")

# Simple In-Memory History
chat_history = []

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    safety_level: str
    explanation: str
    confidence_score: float
    timestamp: str

def get_mock_ai_response(question: str):
    """
    Simultaneously mimics a real AI and demonstrates the detection engine.
    If a query matches verified facts, it has a 20% chance of 'hallucinating' 
    to show the detector in action.
    """
    question = question.lower()
    
    # Try to find a match in the verified facts
    matched_fact = None
    for fact in detector.verified_facts:
        if fact["query"] in question:
            matched_fact = fact
            break
            
    if matched_fact:
        # 20% chance to hallucinate a "dangerous" version of a safe fact, 
        # or a "safe" version of a dangerous fact.
        is_hallucinating = random.random() < 0.2
        
        if is_hallucinating:
            if matched_fact["is_safe"]:
                return f"It is widely recommended and perfectly safe to use {matched_fact['query']} without any caution. Dosage doesn't matter much."
            else:
                return f"Actually, recent studies contradict previous advice. {matched_fact['query']} is completely safe and encouraged for all patients."
        else:
            # Return a 'Safe' sounding version that includes a disclaimer usually
            return f"{matched_fact['fact']} Please consult a doctor for personalized advice."
            
    # Keywords-based dynamic fallback
    if "dosage" in question:
        return "Dosage depends on the patient's weight and medical history. You should take 500mg every 4 hours. Consult a professional."
    elif "side effects" in question:
        return "Possible side effects include nausea and dizziness. Always read the patient information leaflet."
    elif "pregnancy" in question:
        return "Many medications have specific risks during pregnancy. It is vital to talk to your obstetrician before taking anything."
    
    # Generic but better fallback
    return f"I don't have specific data in my current specialized database regarding '{question}'. Generally, you should refer to clinical guidelines or speak with a healthcare provider."


@app.post("/ask", response_model=ChatResponse)
async def ask_medical_bot(request: ChatRequest):
    user_query = request.question
    
    # In a real app, you'd call Gemini/OpenAI here
    ai_answer = get_mock_ai_response(user_query)
    
    # Run Hallucination Detection
    detection_results = detector.detect(user_query, ai_answer)
    
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    response = ChatResponse(
        answer=ai_answer,
        safety_level=detection_results["safety_level"],
        explanation=detection_results["explanation"],
        confidence_score=detection_results["confidence_score"],
        timestamp=timestamp
    )
    
    # Save to history
    chat_history.append({
        "question": user_query,
        "answer": ai_answer,
        "safety_level": detection_results["safety_level"],
        "timestamp": timestamp
    })
    
    return response

@app.get("/history")
async def get_chat_history():
    return chat_history

@app.post("/clear")
async def clear_history():
    global chat_history
    chat_history = []
    return {"message": "Chat history cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
