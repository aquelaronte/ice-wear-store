from dataclasses import dataclass
from enum import Enum

from app.types.message_type import MessageType


class LlmMessageRole(Enum):
    USER = "user"
    AI = "ai"
    SYSTEM = "system"


@dataclass
class LlmMessage:
    content: str
    role: LlmMessageRole = LlmMessageRole.USER
    message_type: MessageType = MessageType.TEXT
