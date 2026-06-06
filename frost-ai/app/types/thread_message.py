from dataclasses import dataclass
from enum import Enum


class ThreadMessageRole(Enum):
    USER = "USER"
    AI = "AI"


@dataclass
class ThreadMessage:
    role: ThreadMessageRole
    content: str
    thread_id: str
