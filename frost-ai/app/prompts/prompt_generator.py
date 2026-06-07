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
        file_content = __read_system_prompt_file()

        user_template = Template(file_content)

        formatted_recommendations = "\n".join(
            json.dumps(
                {
                    "name": item.name,
                    "description": item.description,
                    "price": item.price,
                    "variants": item.variants,
                    "score": item.score,
                }
            )
            for item in recommendations[:5]
        )

        prompt = user_template.substitute(
            {
                "recommendations": formatted_recommendations,
            }
        )

        return prompt

    @classmethod
    def embedding_prompt(
        cls,
        item: Item,
        visual_description: str | None = None,
    ) -> str:
        file_content = __read_embedding_prompt_file()

        embedding_template = Template(file_content)

        prompt = embedding_template.substitute(
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
def __read_system_prompt_file():
    return __read_file_content("system_prompt.md")


@lru_cache(maxsize=1)
def __read_embedding_prompt_file():
    return __read_file_content("embedding_prompt.md")


def __read_file_content(
    file_name: Literal["system_prompt.md", "user_prompt.md", "embedding_prompt.md"],
):
    template_path = Path(__file__).parent / "templates" / file_name
    with open(template_path, "r", encoding="utf-8") as file:
        return file.read()
