import json
from functools import lru_cache
from pathlib import Path
from string import Template
from typing import Literal

from app.types.item import Item, ScoredItem


class PromptGenerator:
    @classmethod
    def system_prompt(
        cls,
        recommendations: list[ScoredItem] = [],
    ) -> str:
        file_content = _read_system_prompt_file()

        user_template = Template(file_content)

        formatted_recommendations = "\n".join(
            json.dumps(
                {
                    "index": index,
                    "name": item.name,
                    "description": item.description,
                    "price": item.price,
                    "variants": item.variants,
                    "score": item.score,
                }
            )
            for index, item in enumerate(recommendations[:5])
        )

        prompt = user_template.safe_substitute(
            {
                "recommendations": formatted_recommendations,
            }
        )

        return prompt

    @classmethod
    @lru_cache(maxsize=1)
    def item_visual_description_prompt(cls) -> str:
        return _read_file_content("item_visual_description_prompt.md")

    @classmethod
    def item_embedding_prompt(
        cls,
        item: Item,
        visual_description: str | None = None,
    ) -> str:
        file_content = _read_embedding_prompt_file()

        embedding_template = Template(file_content)

        prompt = embedding_template.safe_substitute(
            {
                "name": item.name,
                "description": item.description or "",
                "price": item.price,
                "variants": ", ".join(item.variants),
                "visual_description": visual_description or "",
            }
        )

        return prompt


@lru_cache(maxsize=1)
def _read_system_prompt_file():
    return _read_file_content("system_prompt.md")


@lru_cache(maxsize=1)
def _read_embedding_prompt_file():
    return _read_file_content("item_embedding_prompt.md")


def _read_file_content(
    file_name: Literal[
        "system_prompt.md",
        "item_embedding_prompt.md",
        "item_visual_description_prompt.md",
    ],
):
    template_path = Path(__file__).parent / "templates" / file_name
    with open(template_path, "r", encoding="utf-8") as file:
        return file.read()
