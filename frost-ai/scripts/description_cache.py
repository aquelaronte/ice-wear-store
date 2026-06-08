import json
from pathlib import Path


class DescriptionCache:
    def __init__(self, path: Path) -> None:
        self._path = path
        self._data: dict[str, str] = {}

        if path.exists():
            self._data = json.loads(path.read_text(encoding="utf-8"))

    def get(self, name: str) -> str | None:
        return self._data.get(name)

    def set(self, name: str, description: str) -> None:
        self._data[name] = description
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._path.write_text(
            json.dumps(self._data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
