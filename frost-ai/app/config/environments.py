from functools import cached_property
import os

from dotenv import load_dotenv

load_dotenv()


class _Envs:
    @cached_property
    def pg_dsn(self):
        return os.environ.get("DB_DSN")


environments = _Envs()
