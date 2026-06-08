from functools import cached_property

import asyncpg
from google import genai
from openai import AsyncOpenAI
from qdrant_client import AsyncQdrantClient

from app.config.environments import environments
from app.infrastructure.llm_openai_repo import LlmOpenaiRepository
from app.infrastructure.recommendation_qdrant_repo import RecommendationQdrantRepository
from app.infrastructure.thread_sql_repo import ThreadSqlRepository
from app.repositories.llm_repo import LlmRepository
from app.repositories.recommendation_repo import RecommendationRepository
from app.repositories.thread_repo import ThreadRepository


class _DependencyInjectionContainer:
    def __init__(self) -> None:
        self._pool: asyncpg.Pool | None = None
        self._googleai_client: genai.Client | None = None
        self._initialized = False

    async def init(self) -> None:
        if self._initialized:
            return

        self._googleai_client = (
            genai.Client()
        )  # Loads api key automatically from environments
        self._pool = await asyncpg.create_pool(
            dsn=environments.pg_dsn, min_size=10, max_size=20
        )
        self._initialized = True

    async def close(self) -> None:
        if not self._initialized:
            return

        # Clean up Postgres pool
        if self._pool is not None:
            await self._pool.close()
            self._pool = None

        # Clena google ai client
        if self._googleai_client is not None:
            await self._googleai_client.aio.aclose()
            self.googleai_client.close()
            self._googleai_client = None

        self._initialized = False

    @property
    def pg_conn_pool(self) -> asyncpg.Pool:
        assert self._pool is not None, "dependencies.init() was not called"
        return self._pool

    @cached_property
    def qdrant_client(self) -> AsyncQdrantClient:
        return AsyncQdrantClient(
            api_key=environments.qdrant_apikey,
            url=environments.qdrant_url,
        )

    @cached_property
    def openai_client(self) -> AsyncOpenAI:
        return AsyncOpenAI(api_key=environments.openai_apikey)

    @property
    def googleai_client(self) -> genai.Client:
        assert self._googleai_client is not None, "dependencies.init() was not called"
        return self._googleai_client

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
