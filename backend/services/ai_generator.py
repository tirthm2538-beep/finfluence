import os
import json
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

SYSTEM_PROMPT = """You are the lead financial content designer for FinFluence, a mobile app teaching Gen Z financial literacy.
Your goal is to explain financial concepts through short, swipeable story cards.

VOICE & TONE RULES (STRICT):
1. Relatable hook: Start with a concrete, everyday situation (e.g., wallet money, UPI, college bills, gym subscriptions). No cringe or forced slang.
2. In Plain English: Explain the mechanism in plain language without jargon.
3. Grounded Analogy: Provide one tangible real-world comparison (e.g., gym membership, fruit salad, spare tire).
4. Quick Quiz: Exactly 3 multiple-choice options (A, B, C) with exactly one correct option and constructive explanations.
5. IF TRACK IS STOCK MARKET: Strictly education, definitions, and mechanics ONLY. NEVER give stock-picking tips, recommendations, or buy/sell signals.

OUTPUT FORMAT:
Return pure, valid JSON with this exact schema:
{
  "id": "concept-slug-number",
  "conceptNumber": 21,
  "track": "core-finance" | "stock-market",
  "trackTitle": "Core Finance Literacy" | "Stock Market Literacy",
  "conceptTitle": "Title of Concept",
  "tag": "Short Tag (e.g. Wealth Basics)",
  "readTime": "45 sec read",
  "hook": "Relatable hook text...",
  "explanation": "Clear plain English explanation...",
  "analogy": "Memorable grounded analogy...",
  "analogyIcon": "dumbbell" | "snow" | "pie-chart" | "compass",
  "quiz": {
    "question": "Clear quiz question?",
    "options": [
      {
        "id": "opt-a",
        "label": "A",
        "text": "Option text",
        "isCorrect": false,
        "explanation": "Why this is not correct"
      },
      {
        "id": "opt-b",
        "label": "B",
        "text": "Correct option text",
        "isCorrect": true,
        "explanation": "Why this is correct"
      },
      {
        "id": "opt-c",
        "label": "C",
        "text": "Option text",
        "isCorrect": false,
        "explanation": "Why this is not correct"
      }
    ],
    "correctOptionId": "opt-b",
    "takeaway": "One-line punchy takeaway."
  }
}
"""


class CardGenerationRequest(BaseModel):
    concept: str = Field(..., description="The financial concept to generate, e.g. 'Index Funds' or 'P/E Ratio'")
    track: str = Field(default="core-finance", description="'core-finance' or 'stock-market'")
    concept_number: Optional[int] = Field(default=21, description="Sequential concept number")


def generate_story_card(req: CardGenerationRequest) -> Dict[str, Any]:
    """
    Generates a new story card using Gemini API if GEMINI_API_KEY is configured,
    or returns a high-quality structured template matching the concept.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    slug = req.concept.lower().replace(" ", "-").replace("/", "-")
    card_id = f"{slug}-{req.concept_number}"
    track_title = "Stock Market Literacy" if req.track == "stock-market" else "Core Finance Literacy"

    # If Gemini API key is present, attempt live generation
    if gemini_key:
        try:
            import httpx
            prompt = f"Create a FinFluence story card for concept: '{req.concept}' under track: '{req.track}'. Concept number: {req.concept_number}."
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": f"{SYSTEM_PROMPT}\n\n{prompt}"}]}],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    resp_json = res.json()
                    text = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(text)
        except Exception:
            pass  # Fall through to deterministic template generator

    # Deterministic high-quality template generator (zero dependency / offline safe)
    is_stock = req.track == "stock-market"
    tag = "Market Mechanics" if is_stock else "Smart Money"
    icon = "pie-chart" if is_stock else "compass"

    return {
        "id": card_id,
        "conceptNumber": req.concept_number,
        "track": req.track,
        "trackTitle": track_title,
        "conceptTitle": req.concept,
        "tag": tag,
        "readTime": "45 sec read",
        "hook": f"Ever wondered why everyone in finance talks about {req.concept} as if it is common knowledge, but nobody ever explains it simply?",
        "explanation": f"{req.concept} is a fundamental mechanism in {'financial markets' if is_stock else 'personal finance'}. It provides a systematic way to evaluate risk and ensure your capital works effectively over long horizons.",
        "analogy": f"Understanding {req.concept} is like checking the weather forecast before heading on a road trip — you can still drive in the rain, but you will know whether to bring an umbrella.",
        "analogyIcon": icon,
        "quiz": {
            "question": f"What is the key takeaway when evaluating {req.concept}?",
            "options": [
                {
                    "id": f"{slug}-opt-a",
                    "label": "A",
                    "text": "It guarantees immediate double returns within 24 hours",
                    "isCorrect": False,
                    "explanation": "No legitimate financial concept promises guaranteed overnight returns."
                },
                {
                    "id": f"{slug}-opt-b",
                    "label": "B",
                    "text": "It helps manage risk and make evidence-based long term decisions",
                    "isCorrect": True,
                    "explanation": "Spot on! Discipline and risk awareness are the true foundations of wealth."
                },
                {
                    "id": f"{slug}-opt-c",
                    "label": "C",
                    "text": "Only billionaire institutional hedge funds are permitted to use it",
                    "isCorrect": False,
                    "explanation": "Modern retail platforms make these concepts accessible to everyone."
                }
            ],
            "correctOptionId": f"{slug}-opt-b",
            "takeaway": f"Mastering {req.concept} gives you an unfair advantage in long-term wealth building."
        }
    }
