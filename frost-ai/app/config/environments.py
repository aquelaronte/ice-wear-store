from functools import cached_property
import os

from dotenv import load_dotenv

load_dotenv()


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

    @property
    def recommendation_collection_name(self):
        return "items"


environments = _Envs()
