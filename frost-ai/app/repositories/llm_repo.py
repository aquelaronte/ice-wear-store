from typing import Protocol

from app.types.llm import LlmMessage


class LlmRepository(Protocol):
    def ask(self, messages: list[LlmMessage]) -> str: ...

    def generate_embedding(self, to_embed: str) -> list[float]: ...
