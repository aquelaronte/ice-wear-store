from app.config import dependencies


async def fetch_all_items():
    rows = await dependencies.pg_conn_pool.fetch("""
        SELECT i.id, i.name, i.description, i.price, i.pictures, i.source, i.llm_description,
            COALESCE(
                array_agg(v.name) FILTER (WHERE v.id IS NOT NULL),
                ARRAY[]::text[]
            ) AS variants
        FROM item i
        LEFT JOIN item_variant v ON i.id = v.item_id
        GROUP BY i.id;
    """)

    return rows
