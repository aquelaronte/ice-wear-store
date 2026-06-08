import uuid

import asyncpg

from app.types.message_type import MessageType
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
            (
                str(uuid.uuid7()),
                message.message_role.value,
                message.content,
                message.thread_id,
                message.message_type.value,
            )
            for message in messages
        ]

        await self.pool.executemany(
            "INSERT INTO thread_message(id, message_role, content, thread_id, message_type) VALUES ($1, $2, $3, $4, $5)",
            arguments,
        )

    async def get_thread_messages(
        self, thread_id: str, limit: int
    ) -> list[ThreadMessage]:
        rows = await self.pool.fetch(
            "SELECT message_role, content, thread_id, message_type FROM thread_message "
            "WHERE thread_id = $1 ORDER BY id DESC LIMIT $2",
            thread_id,
            limit,
        )

        return [
            ThreadMessage(
                message_role=ThreadMessageRole(row["message_role"]),
                content=row["content"],
                thread_id=row["thread_id"],
                message_type=MessageType(row["message_type"]),
            )
            for row in rows
        ]
