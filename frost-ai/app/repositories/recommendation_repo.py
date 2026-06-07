from typing import Protocol

from app.types.item import ScoredItem


class RecommendationRepository(Protocol):
    def recommend(self, question: str) -> list[ScoredItem]: ...
