import asyncio

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Fusion, FusionQuery, Prefetch

from app.repositories.llm_image_repo import LlmImageRepository
from app.repositories.llm_repo import LlmRepository
from app.types.item import ScoredItem


class RecommendationQdrantRepository:
    def __init__(
        self,
        qdrant_client: AsyncQdrantClient,
        llm_repo: LlmRepository,
        llm_image_repo: LlmImageRepository,
        collection_name: str,
    ) -> None:
        self.qdrant_client = qdrant_client
        self.llm_repo = llm_repo
        self.collection_name = collection_name
        self.llm_image_repo = llm_image_repo

    async def recommend(
        self, question: str, image_urls: list[str] | None = []
    ) -> list[ScoredItem]:
        # Run embedding generation for question and images in parallel
        images_embedding_task = None

        async with asyncio.TaskGroup() as tg:
            question_embedding_task = tg.create_task(
                self.llm_repo.generate_embedding(question)
            )

            if image_urls:
                images_embedding_task = tg.create_task(
                    self.llm_image_repo.generate_images_embedding(image_urls)
                )

        # Gather results
        question_embedding = question_embedding_task.result()
        images_embedding = (
            images_embedding_task.result()
            if images_embedding_task is not None
            else None
        )

        if images_embedding is not None and images_embedding:
            # Perform fusion query if images_embedding is present
            results = await self.qdrant_client.query_points(
                collection_name=self.collection_name,
                prefetch=[
                    Prefetch(query=question_embedding, using="description", limit=20),
                    Prefetch(query=images_embedding, using="pictures", limit=20),
                ],
                query=FusionQuery(fusion=Fusion.RRF),
                limit=5,
            )
        else:
            # Perform a single query if there are no images_embedding
            results = await self.qdrant_client.query_points(
                collection_name=self.collection_name,
                query=question_embedding,
                using="description",
                limit=5,
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
                    item_id=str(
                        point.id
                    ),  # Point ID is the same ID as the item in Database
                    name=name,
                    description=description,
                    price=price,
                    variants=variants_typed,
                    visual_description=visual_description,
                    score=point.score,
                )
            )

        return items
