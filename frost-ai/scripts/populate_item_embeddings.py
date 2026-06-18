import asyncio
import logging

from asyncpg import Record
from qdrant_client import models
from qdrant_client.models import PointStruct

from app.config import dependencies, environments
from app.prompts.prompt_generator import PromptGenerator
from app.types.item import Item
from .helpers import fetch_all_items

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("populate_item_embeddings")


async def main():
    await dependencies.init()

    await create_collection()

    qdrant_client = dependencies.qdrant_client

    rows = await fetch_all_items()
    logger.info("fetched %d items from database", len(rows))

    semaphore = asyncio.Semaphore(value=5)  # max 5 concurrent LLM calls
    tasks = [generate_point(row, semaphore) for row in rows]

    points = await asyncio.gather(*tasks)
    valid_points = [point for point in points if point is not None]

    failed = len(rows) - len(valid_points)
    logger.info(
        "embedding complete: %d succeeded, %d failed/skipped, %d total",
        len(valid_points),
        failed,
        len(rows),
    )

    if not valid_points:
        logger.warning("no valid points to upsert, skipping qdrant write")
        return

    logger.info("upserting %d points into qdrant collection 'items'", len(valid_points))
    try:
        await qdrant_client.upsert(
            collection_name=environments.recommendation_collection_name,
            points=valid_points,
        )
        logger.info("qdrant upsert succeeded")
    except Exception:
        logger.exception("qdrant upsert failed")
        raise

    await dependencies.close()
    logger.info("done")


async def generate_point(
    row: Record, semaphore: asyncio.Semaphore
) -> PointStruct | None:
    item_id = row.get("id")
    name = row.get("name")
    description = row.get("description")
    variants: list[str] = row.get("variants")  # pyright: ignore[reportAssignmentType]
    price = row.get("price")
    llm_description = row.get("llm_description")
    pictures = row.get("pictures")

    if any(x is None for x in (name, variants, price, item_id)):
        logger.warning(
            "skipping item %r (id=%s): missing required field(s)", name, item_id
        )
        return None

    if not isinstance(price, int):
        logger.warning(
            "skipping item %r: price is not int (got %s)", name, type(price).__name__
        )
        return None

    if not all(isinstance(x, str) for x in (name, llm_description)):
        logger.warning("skipping item %r: type check failed for str fields", name)
        return None

    point_id = str(item_id)

    logger.info("generating embedding for item %r", name)
    async with semaphore:
        pictures_embedding: list[float] = []

        try:
            result = await dependencies.openai_client.embeddings.create(
                input=PromptGenerator.item_embedding_prompt(
                    item=Item(
                        item_id=item_id,  # pyright: ignore[reportArgumentType]
                        description=description,
                        name=name,  # pyright: ignore[reportArgumentType]
                        price=price,
                        variants=variants,
                    ),
                    visual_description=llm_description,  # pyright: ignore[reportArgumentType]
                ),
                model="text-embedding-3-small",
            )

            if pictures is not None and pictures:
                pictures_embedding = (
                    await dependencies.llm_image_repo.generate_images_embedding(
                        image_urls=pictures,
                    )
                )
        except Exception:
            logger.exception("embedding call raised for item %r", name)
            return None

        embedding = result.data[0].embedding
        logger.info("embedded item %r (dim=%d)", name, len(embedding))

        return PointStruct(
            id=point_id,
            vector={"description": embedding, "pictures": pictures_embedding},
            payload={
                "name": name,
                "description": description,
                "price": price,
                "variants": variants,
                "visual_description": llm_description,
            },
        )


async def create_collection():
    client = dependencies.qdrant_client

    if await client.collection_exists(
        collection_name=environments.recommendation_collection_name
    ):
        await client.delete_collection(
            collection_name=environments.recommendation_collection_name
        )
        logger.info("collection removed")

    await dependencies.qdrant_client.create_collection(
        collection_name=environments.recommendation_collection_name,
        vectors_config={
            "description": models.VectorParams(
                size=1536, distance=models.Distance.COSINE
            ),
            "pictures": models.VectorParams(size=3072, distance=models.Distance.COSINE),
        },
    )
    logger.info("collection created")


if __name__ == "__main__":
    asyncio.run(main())
