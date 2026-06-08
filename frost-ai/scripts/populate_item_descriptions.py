"""
This script will iter over every item in database to generate
a description by passing item's pictures

IMPORTANT: this script will generate a cache description for each item
"""

import asyncio
import logging
from pathlib import Path

from asyncpg import Record

from app.config import dependencies
from app.prompts.prompt_generator import PromptGenerator
from google.genai import types
from scripts.description_cache import DescriptionCache
from .helpers import fetch_all_items

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("populate_item_descriptions")


async def main():
    cache = DescriptionCache(Path(__file__).parent / ".description_cache.json")

    logger.info("initializing dependencies")
    await dependencies.init()

    rows = await fetch_all_items()
    logger.info("fetched %d items from database", len(rows))

    semaphore = asyncio.Semaphore(value=5)  # max 5 concurrent LLM generations

    tasks = [process_item(row, cache, semaphore) for row in rows]

    # Generate description for every item
    processed_items = await asyncio.gather(*tasks)

    # Retrieve only the valid ones
    valid_processed_items = [x for x in processed_items if x is not None]

    failed = len(rows) - len(valid_processed_items)
    logger.info(
        "processing complete: %d succeeded, %d failed/skipped, %d total",
        len(valid_processed_items),
        failed,
        len(rows),
    )

    if valid_processed_items:
        logger.info("updating %d rows in database", len(valid_processed_items))
        ids, descriptions = zip(*valid_processed_items)
        try:
            await dependencies.pg_conn_pool.execute(
                """
                UPDATE item AS i
                SET llm_description = u.description
                FROM unnest($1::uuid[], $2::text[]) AS u(id, description)
                WHERE i.id = u.id;
                """,
                list(ids),
                list(descriptions),
            )
            logger.info("database update succeeded")
        except Exception:
            logger.exception("database update failed")
            raise
    else:
        logger.warning("no valid items to update, skipping database write")

    await dependencies.close()
    logger.info("done")


async def process_item(
    row: Record, cache: DescriptionCache, semaphore: asyncio.Semaphore
) -> tuple[str, str] | None:
    row_id = row["id"]
    name = row["name"]
    source = row["source"]

    # first check item in cache (disk)
    llm_description = cache.get(f"{name}-{source}")

    if llm_description is not None:
        logger.info("cache hit for item %r", name)
        return (row_id, llm_description)

    pictures: list[str] | None = row["pictures"]

    if pictures is None or len(pictures) < 3:
        logger.warning(
            "skipping item %r: insufficient pictures (%s)",
            name,
            "none" if pictures is None else len(pictures),
        )
        return None

    logger.info("generating description for item %r (%d pictures)", name, len(pictures))

    # Only use semaphore for generating ai response
    async with semaphore:
        try:
            llm_description = await generate_pictures_description(pictures)
        except Exception:
            logger.exception("LLM call raised for item %r", name)
            return None

    if llm_description is None:
        logger.error("LLM returned no description for item %r", name)
        return None

    # set generated description in cache
    cache.set(f"{name}-{source}", llm_description)
    logger.info("generated and cached description for item %r", name)

    return (row_id, llm_description)


async def generate_pictures_description(pictures: list[str]) -> str | None:
    # Generate images description
    response = await dependencies.googleai_client.aio.models.generate_content(  # pyright: ignore[reportUnknownMemberType]
        model="gemini-2.5-flash",
        contents=[
            PromptGenerator.item_visual_description_prompt(),
            *[types.Part.from_uri(file_uri=picture) for picture in pictures],
        ],
    )

    return response.text


if __name__ == "__main__":
    asyncio.run(main())
