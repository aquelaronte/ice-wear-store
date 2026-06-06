from typing import Protocol

from app.types.thread_message import ThreadMessage


class ThreadRepository(Protocol):
    def new_thread(self) -> str: ...

    def save_messages(self, messages: list[ThreadMessage]) -> None: ...

    def get_thread_messages(
        self, thread_id: str, limit: int
    ) -> list[ThreadMessage]: ...
