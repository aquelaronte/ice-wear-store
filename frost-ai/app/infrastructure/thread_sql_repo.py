import uuid

import asyncpg

from app.types.thread_message import ThreadMessage, ThreadMessageRole


class ThreadSqlRepository:
    def __init__(self, pool: asyncpg.Pool) -> None:
        self.pool = pool

    async def new_thread(self) -> str:
        thread_id = str(uuid.uuid7())

        await self.pool.execute("INSERT INTO thread(id) VALUES ($1)", thread_id)

        return thread_id

    async def save_messages(self, messages: list[ThreadMessage]) -> None:
        arguments = [
            (message.role.value, message.content, message.thread_id)
            for message in messages
        ]

        await self.pool.executemany(
            "INSERT INTO thread_message(role, content, thread_id) VALUES ($1, $2, $3)",
            arguments,
        )

    async def get_thread_messages(
        self, thread_id: str, limit: int
    ) -> list[ThreadMessage]:
        rows = await self.pool.fetch(
            "SELECT role, content, thread_id FROM thread_message "
            "WHERE thread_id = $1 ORDER BY id LIMIT $2",
            thread_id,
            limit,
        )

        return [
            ThreadMessage(
                role=ThreadMessageRole(row["role"]),
                content=row["content"],
                thread_id=row["thread_id"],
            )
            for row in rows
        ]
