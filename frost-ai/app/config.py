from functools import cached_property

from app.repositories.llm_repository import LlmRepository
from app.repositories.thread_repo import ThreadRepository


class _DependencyInjectionContainer:
    @cached_property
    def llm_repo(self) -> LlmRepository: ...

    @cached_property
    def thread_repo(self) -> ThreadRepository: ...


dependencies = _DependencyInjectionContainer()
