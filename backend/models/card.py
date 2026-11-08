from typing import List, Literal, Optional
from pydantic import BaseModel

TrackType = Literal["core-finance", "stock-market"]
OptionLabel = Literal["A", "B", "C", "D"]


class QuizOption(BaseModel):
    id: str
    label: OptionLabel
    text: str
    isCorrect: bool
    explanation: Optional[str] = None


class Quiz(BaseModel):
    question: str
    options: List[QuizOption]
    correctOptionId: str
    takeaway: str


class StoryCardData(BaseModel):
    id: str
    conceptNumber: int
    track: TrackType
    trackTitle: str
    conceptTitle: str
    tag: str
    readTime: str
    hook: str
    explanation: str
    analogy: str
    analogyIcon: Optional[str] = None
    quiz: Quiz
