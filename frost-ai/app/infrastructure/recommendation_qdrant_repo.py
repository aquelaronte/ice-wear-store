from qdrant_client import AsyncQdrantClient

from app.repositories.llm_repo import LlmRepository
from app.types.item import ScoredItem


class RecommendationQdrantRepository:
    def __init__(
        self,
        qdrant_client: AsyncQdrantClient,
        llm_repo: LlmRepository,
        collection_name: str,
    ) -> None:
        self.qdrant_client = qdrant_client
        self.llm_repo = llm_repo
        self.collection_name = collection_name

    async def recommend(self, question: str) -> list[ScoredItem]:
        question_embedding = await self.llm_repo.generate_embedding(question)

        results = await self.qdrant_client.query_points(
            collection_name=self.collection_name, query=question_embedding, limit=5
        )

        items: list[ScoredItem] = []

        for point in results.points:
            if point.payload is None:
                continue

            description = point.payload.get("description")
            name = point.payload.get("name")
            price = point.payload.get("price")
            variants = point.payload.get("variants")
            visual_description = point.payload.get("visual_description")

            if not isinstance(name, str) or not isinstance(price, int):
                continue

            if description is not None and not isinstance(description, str):
                continue

            if not isinstance(variants, list) or not all(
                isinstance(v, str)
                for v in variants  # pyright: ignore[reportUnknownVariableType]
            ):
                continue

            if not isinstance(visual_description, str):
                continue

            variants_typed: list[str] = (  # pyright: ignore[reportUnknownVariableType]
                variants
            )

            items.append(
                ScoredItem(
                    name=name,
                    description=description,
                    price=price,
                    variants=variants_typed,
                    visual_description=visual_description,
                    score=point.score,
                )
            )

        return items
