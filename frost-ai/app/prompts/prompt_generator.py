import json
from functools import lru_cache
from pathlib import Path
from string import Template
from typing import Literal

from app.types.item import Item, ScoredItem
from app.types.thread_message import ThreadMessage


class PromptGenerator:
    @classmethod
    @lru_cache(maxsize=1)
    def system_prompt(cls) -> str:
        return __read_file_content("system_prompt.md")

    @classmethod
    def user_prompt(
        cls,
        question: str,
        message_history: list[ThreadMessage] = [],
        recommendations: list[ScoredItem] = [],
    ) -> str:
        file_content = __read_user_prompt_file()

        user_template = Template(file_content)

        formatted_history = "\n".join(
            json.dumps({"role": msg.role.value, "message": msg.content})
            for msg in message_history[-5:]
        )

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
                "message_history": formatted_history,
                "recommendations": formatted_recommendations,
                "question": question,
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
def __read_user_prompt_file():
    return __read_file_content("user_prompt.md")


@lru_cache(maxsize=1)
def __read_embedding_prompt_file():
    return __read_file_content("embedding_prompt.md")


def __read_file_content(
    file_name: Literal["system_prompt.md", "user_prompt.md", "embedding_prompt.md"],
):
    template_path = Path(__file__).parent / "templates" / file_name
    with open(template_path, "r", encoding="utf-8") as file:
        return file.read()
