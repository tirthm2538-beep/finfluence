"""
Source of truth for all FinFluence Story Cards.
Matches the TypeScript StoryCardData shape in frontend/src/types/card.ts
"""

import json
from pathlib import Path
from typing import List, Dict, Any

_DATA_FILE = Path(__file__).parent / "cards.json"

with open(_DATA_FILE, "r", encoding="utf-8") as _f:
    ALL_CARDS: List[Dict[str, Any]] = json.load(_f)

__all__ = ["ALL_CARDS"]
