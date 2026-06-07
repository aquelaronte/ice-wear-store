from dataclasses import dataclass
from enum import Enum

from app.types.llm import LlmMessage, LlmMessageRole
from app.types.message_type import MessageType


class ThreadMessageRole(Enum):
    USER = "user"
    AI = "ai"


@dataclass
class ThreadMessage:
    message_role: ThreadMessageRole
    content: str
    thread_id: str
    message_type: MessageType

    def to_llm_message(self) -> LlmMessage:
        return LlmMessage(
            content=self.content,
            role=(
                LlmMessageRole.USER
                if self.message_role == ThreadMessageRole.USER
                else LlmMessageRole.AI
            ),
            message_type=self.message_type,
        )
