"""
This script will iter over every item in database to generate
a description by passing item's pictures, name, variants, price, and
manual description to a llm

IMPORTANT: this script will generate a cache description for each item
"""

import asyncio
from pathlib import Path

from asyncpg import Record

from app.config import dependencies
from app.prompts.prompt_generator import PromptGenerator
from google.genai import types
from scripts.description_cache import DescriptionCache


async def main():
    cache = DescriptionCache(Path(__file__).parent / ".description_cache.json")

    await dependencies.init()

    rows = await fetch_all_items()

    semaphore = asyncio.Semaphore(value=5)  # max 5 concurrent LLM generations

    # Generate description for every item
    processed_items = await asyncio.gather(
        *[process_item(row, cache, semaphore) for row in rows]
    )

    # Retrieve only the valid ones
    valid_processed_items = [x for x in processed_items if x is not None]

    if valid_processed_items:
        ids, descriptions = zip(*valid_processed_items)
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

    await dependencies.close()


async def process_item(
    row: Record, cache: DescriptionCache, semaphore: asyncio.Semaphore
) -> tuple[str, str] | None:
    name = row["name"]

    # first check item in cache (disk)
    llm_description = cache.get(name)

    if llm_description is None:
        pictures: list[str] | None = row["pictures"]

        # Only use semaphore for generating ai response
        async with semaphore:
            llm_description = await generate_pictures_description(pictures)

        if llm_description is None:
            print("something went wrong while trying to generate genai description")
            return None

        # set generated description in cache
        cache.set(name, llm_description)

    return row["id"], llm_description


async def generate_pictures_description(pictures: list[str] | None) -> str | None:
    if pictures is None or len(pictures) < 3:
        return None

    # Generate images description
    response = await dependencies.googleai_client.aio.models.generate_content(  # pyright: ignore[reportUnknownMemberType]
        model="gemini-2.5-flash",
        contents=[
            PromptGenerator.item_visual_description_prompt(),
            *[types.Part.from_uri(file_uri=picture) for picture in pictures],
        ],
    )

    return response.text


async def fetch_all_items():
    rows = await dependencies.pg_conn_pool.fetch("""
        SELECT i.id, i.name, i.description, i.price, i.pictures,
            COALESCE(
                json_agg(
                    v.name
                ) FILTER (WHERE v.id IS NOT NULL), '[]'
            ) AS variants
        FROM item i
        LEFT JOIN item_variant v ON i.id = v.item_id
        GROUP BY i.id LIMIT 1;
    """)

    return rows


if __name__ == "__main__":
    asyncio.run(main())
