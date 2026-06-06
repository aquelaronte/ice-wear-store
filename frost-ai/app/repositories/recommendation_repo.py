from typing import Protocol

from app.types.item import Item


class RecommendationRepository(Protocol):
    def recommend(self, question: str) -> list[Item]: ...
