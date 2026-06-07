from dataclasses import dataclass
from enum import Enum


class LlmMessageRole(Enum):
    USER = "USER"
    AI = "AI"
    SYSTEM = "SYSTEM"


class LlmMessageType(Enum):
    TEXT = "TEXT"
    IMAGE = "IMAGE"


@dataclass
class LlmMessage:
    content: str
    role: LlmMessageRole = LlmMessageRole.USER
    message_type: LlmMessageType = LlmMessageType.TEXT
