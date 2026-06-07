from functools import cached_property

import asyncpg
from openai import OpenAI
from qdrant_client import QdrantClient

from app.config import environments
from app.infrastructure.llm_openai_repo import LlmOpenaiRepository
from app.infrastructure.recommendation_qdrant_repo import RecommendationQdrantRepository
from app.infrastructure.thread_sql_repo import ThreadSqlRepository
from app.repositories.llm_repo import LlmRepository
from app.repositories.recommendation_repo import RecommendationRepository
from app.repositories.thread_repo import ThreadRepository


class _DependencyInjectionContainer:
    def __init__(self) -> None:
        self._pool: asyncpg.Pool | None = None
        self._qdrant_client: QdrantClient | None = None
        self._openai_client: OpenAI | None = None

    async def init(self) -> None:
        if self._pool is not None:
            return

        self._pool = await asyncpg.create_pool(
            dsn=environments.pg_dsn, min_size=10, max_size=20
        )

    async def close(self) -> None:
        if self._pool is None:
            return

        await self._pool.close()
        self._pool = None

    @property
    def pg_conn_pool(self) -> asyncpg.Pool:
        assert self._pool is not None, "dependencies.init() was not called"
        return self._pool

    @cached_property
    def qdrant_client(self) -> QdrantClient:
        return QdrantClient(
            api_key=environments.qdrant_apikey,
            url=environments.qdrant_url,
        )

    @cached_property
    def openai_client(self) -> OpenAI:
        return OpenAI(api_key=environments.openai_apikey)

    @cached_property
    def thread_repo(self) -> ThreadRepository:
        return ThreadSqlRepository(self.pg_conn_pool)

    @cached_property
    def llm_repo(self) -> LlmRepository:
        return LlmOpenaiRepository(self.openai_client)

    @cached_property
    def recommendation_repo(self) -> RecommendationRepository:
        return RecommendationQdrantRepository(self.qdrant_client, self.llm_repo)


dependencies = _DependencyInjectionContainer()
