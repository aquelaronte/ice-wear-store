from functools import cached_property

import asyncpg

from app.config import environments
from app.infrastructure.thread_sql_repo import ThreadSqlRepository
from app.repositories.llm_repo import LlmRepository
from app.repositories.recommendation_repo import RecommendationRepository
from app.repositories.thread_repo import ThreadRepository


class _DependencyInjectionContainer:
    def __init__(self) -> None:
        self._pool: asyncpg.Pool | None = None
        self._thread_repo: ThreadRepository | None = None

    async def init(self) -> None:
        if self._pool is not None:
            return

        self._pool = await asyncpg.create_pool(
            dsn=environments.pg_dsn, min_size=10, max_size=20
        )
        self._thread_repo = ThreadSqlRepository(self._pool)

    async def close(self) -> None:
        if self._pool is None:
            return

        await self._pool.close()
        self._pool = None
        self._thread_repo = None

    @property
    def pg_conn_pool(self) -> asyncpg.Pool:
        assert self._pool is not None, "dependencies.init() was not called"
        return self._pool

    @property
    def thread_repo(self) -> ThreadRepository:
        assert self._thread_repo is not None, "dependencies.init() was not called"
        return self._thread_repo

    @cached_property
    def llm_repo(self) -> LlmRepository: ...

    @cached_property
    def recommendation_repo(self) -> RecommendationRepository: ...


dependencies = _DependencyInjectionContainer()
