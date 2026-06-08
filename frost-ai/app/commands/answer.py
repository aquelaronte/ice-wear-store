from pydantic import BaseModel

from app import config
from app.prompts.prompt_generator import PromptGenerator
from app.types.llm import LlmMessage, LlmMessageRole
from app.types.message_type import MessageType
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
