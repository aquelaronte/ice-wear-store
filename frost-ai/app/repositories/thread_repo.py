from typing import Protocol

from app.types.thread_message import ThreadMessage


class ThreadRepository(Protocol):
    async def new_thread(self) -> str: ...

    async def save_messages(self, messages: list[ThreadMessage]) -> None: ...

    async def get_thread_messages(
        self, thread_id: str, limit: int
    ) -> list[ThreadMessage]: ...
