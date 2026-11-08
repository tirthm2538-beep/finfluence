import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from models.card import StoryCardData
from data.cards import ALL_CARDS
from services.ai_generator import CardGenerationRequest, generate_story_card

app = FastAPI(
    title="FinFluence API",
    description="Backend API serving Gen Z financial literacy story cards and quizzes",
    version="1.0.0",
)

# CORS configuration supporting local dev and deployed production frontends (Vercel)
env_origins = os.getenv("CORS_ORIGINS", "")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if env_origins:
    origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "healthy",
        "service": "FinFluence API",
        "version": "1.0.0",
        "total_cards": len(ALL_CARDS),
    }


@app.get("/cards", response_model=List[StoryCardData], tags=["Cards"])
def get_cards(
    track: Optional[str] = Query(
        None, description="Optional track filter: 'core-finance' or 'stock-market'"
    )
):
    """
    Returns all 20 story cards as JSON matching the TypeScript StoryCardData shape.
    Supports optional ?track= query parameter.
    """
    if track:
        filtered = [card for card in ALL_CARDS if card.get("track") == track]
        return filtered
    return ALL_CARDS


@app.get("/cards/{card_id}", response_model=StoryCardData, tags=["Cards"])
def get_card_by_id(card_id: str):
    """Fetch a single story card by its unique ID."""
    for card in ALL_CARDS:
        if card.get("id") == card_id:
            return card
    raise HTTPException(
        status_code=404,
        detail=f"Card with id '{card_id}' not found",
    )


@app.get("/tracks", tags=["Tracks"])
def get_tracks():
    """Returns available tracks and concept counts."""
    return [
        {
            "id": "core-finance",
            "title": "Core Finance Literacy",
            "count": len([c for c in ALL_CARDS if c.get("track") == "core-finance"]),
        },
        {
            "id": "stock-market",
            "title": "Stock Market Literacy",
            "count": len([c for c in ALL_CARDS if c.get("track") == "stock-market"]),
        },
    ]


@app.post("/cards/generate", response_model=StoryCardData, tags=["AI Generation"])
def generate_card(req: CardGenerationRequest):
    """
    Generates a new Story Card adhering to FinFluence voice and tone rules.
    Matches the locked template with Hook, Plain English, Analogy, and Quiz.
    """
    new_card = generate_story_card(req)
    return new_card


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
