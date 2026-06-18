from functools import cached_property
import os

from dotenv import find_dotenv, load_dotenv

# Walk up the directory tree to find the centralized root .env
load_dotenv(find_dotenv())


class _Envs:
    @cached_property
    def pg_dsn(self):
        return os.environ.get("DB_DSN")

    @cached_property
    def qdrant_url(self):
        return os.environ.get("QDRANT_URL")

    @cached_property
    def qdrant_apikey(self):
        return os.environ.get("QDRANT_API_KEY")

    @cached_property
    def openai_apikey(self):
        return os.environ.get("OPENAI_APIKEY")

    @cached_property
    def port(self) -> int:
        return int(os.environ.get("FROST_AI_PORT", "8001"))

    @property
    def recommendation_collection_name(self):
        return "items"


environments = _Envs()
