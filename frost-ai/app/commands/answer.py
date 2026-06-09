import re

from pydantic import BaseModel

from app import config
from app.prompts.prompt_generator import PromptGenerator
from app.types.item import ScoredItem
from app.types.llm import LlmMessage, LlmMessageRole
from app.types.message_type import MessageType
from app.types.thread_message import ThreadMessage, ThreadMessageRole

_ITEM_TAG_PATTERN = re.compile(r"\[ITEM:\s*(\d+)\s*\]")


class AnswerCommand(BaseModel):
    message: str
    thread_id: str | None = None


class AnswerResult(BaseModel):
    answer: str
    new_thread_id: str | None = None


async def answer(command: AnswerCommand) -> AnswerResult:
    llm_repo = config.dependencies.llm_repo
    thread_repo = config.dependencies.thread_repo
    recommendation_repo = config.dependencies.recommendation_repo

    # Retrieve thread message history
    thread_id = command.thread_id
    message_history = []

    if thread_id is not None:
        message_history = await thread_repo.get_thread_messages(
            thread_id=thread_id, limit=6
        )
    else:
        thread_id = await thread_repo.new_thread()

    # Retrieve recommendations
    recommendations = await recommendation_repo.recommend(question=command.message)

    # Send mssages to llm
    answer = await llm_repo.ask(
        messages=[
            LlmMessage(
                content=PromptGenerator.system_prompt(recommendations=recommendations),
                role=LlmMessageRole.SYSTEM,
            ),
            *[message.to_llm_message() for message in message_history],
            LlmMessage(
                content=command.message,
                role=LlmMessageRole.USER,
            ),
        ]
    )

    # Replace [ITEM: <index>] tags emitted by the LLM with [ITEM: <item_id>]
    # so the frontend can resolve each reference against the catalog. Indices
    # that fall outside the recommendations slice (rare case) the model saw are dropped.
    answer = _replace_item_tags(answer, recommendations[:5])

    # Save messages in thread so they can be retrieved by the LLM
    # in the next interaction
    await thread_repo.save_messages(
        [
            ThreadMessage(
                message_role=ThreadMessageRole.USER,
                content=command.message,
                thread_id=thread_id,
                message_type=MessageType.TEXT,
            ),
            ThreadMessage(
                message_role=ThreadMessageRole.AI,
                content=answer,
                thread_id=thread_id,
                message_type=MessageType.TEXT,
            ),
        ]
    )

    return AnswerResult(
        answer=answer, new_thread_id=thread_id if command.thread_id is None else None
    )


def _replace_item_tags(answer: str, recommendations: list[ScoredItem]) -> str:
    def resolve(match: re.Match[str]) -> str:
        index = int(match.group(1))
        if 0 <= index < len(recommendations):
            return f"[ITEM: {recommendations[index].item_id}]"
        return ""  # remove tag if it can't be resolved

    return _ITEM_TAG_PATTERN.sub(resolve, answer)
