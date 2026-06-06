from pydantic import BaseModel

from app import config
from app.prompts.prompt_generator import PromptGenerator
from app.types.llm import LlmMessage, LlmMessageRole
from app.types.thread_message import ThreadMessage, ThreadMessageRole


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
            thread_id=thread_id, limit=5
        )
    else:
        thread_id = await thread_repo.new_thread()

    # Retrieve recommendations
    recommendations = recommendation_repo.recommend(question=command.message)

    # Send question to llm
    answer = llm_repo.ask(
        messages=[
            LlmMessage(
                content=PromptGenerator.system_prompt(), role=LlmMessageRole.SYSTEM
            ),
            LlmMessage(
                content=PromptGenerator.user_prompt(
                    question=command.message,
                    message_history=message_history,
                    recommendations=recommendations,
                ),
                role=LlmMessageRole.USER,
            ),
        ]
    )

    # Save messages in thread so they can be retrieved by the LLM
    # in the next interaction
    await thread_repo.save_messages(
        [
            ThreadMessage(
                role=ThreadMessageRole.USER,
                content=command.message,
                thread_id=thread_id,
            ),
            ThreadMessage(
                role=ThreadMessageRole.AI,
                content=answer,
                thread_id=thread_id,
            ),
        ]
    )

    return AnswerResult(
        answer=answer, new_thread_id=thread_id if command.thread_id is None else None
    )
