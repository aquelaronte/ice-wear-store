from dataclasses import dataclass
from enum import Enum


class LlmMessageRole(Enum):
    USER = "USER"
    AI = "AI"
    SYSTEM = "SYSTEM"


@dataclass
class LlmMessage:
    content: str
    role: LlmMessageRole = LlmMessageRole.USER
