from functools import cached_property

from app.repositories.llm_repo import LlmRepository
from app.repositories.recommendation_repo import RecommendationRepository
from app.repositories.thread_repo import ThreadRepository


class _DependencyInjectionContainer:
    @cached_property
    def llm_repo(self) -> LlmRepository: ...

    @cached_property
    def thread_repo(self) -> ThreadRepository: ...

    @cached_property
    def recommendation_repo(self) -> RecommendationRepository: ...


dependencies = _DependencyInjectionContainer()
