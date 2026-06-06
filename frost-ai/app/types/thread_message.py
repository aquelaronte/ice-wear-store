from enum import Enum


class ThreadMessageRole(Enum):
    USER = "USER"
    AI = "AI"


class ThreadMessage:
    id: str
    role: ThreadMessageRole
    content: str
    conversation_id: str
