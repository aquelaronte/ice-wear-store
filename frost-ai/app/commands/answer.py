from dataclasses import dataclass

from app import config
from app.prompts.prompt_generator import PromptGenerator
from app.types.llm import LlmMessage, LlmMessageRole


@dataclass
class AnswerCommand:
    message: str
    thread_id: str | None = (
        None  # if no thread_id is passed, then a new one will be created there
    )


@dataclass
class AnswerResult:
    answer: str
    new_thread_id: str | None = None  # created thread


def answer(command: AnswerCommand) -> AnswerResult:
    llm_repo = config.dependencies.llm_repo
    thread_repo = config.dependencies.thread_repo

    # Retrieve thread message history
    thread_id = command.thread_id
    message_history = []

    if thread_id is not None:
        message_history = thread_repo.get_thread_messages(thread_id=thread_id, limit=5)
    else:
        thread_id = thread_repo.new_thread()

    # Send question to llm
    answer = llm_repo.ask(
        messages=[
            LlmMessage(
                content=PromptGenerator.system_prompt(), role=LlmMessageRole.SYSTEM
            ),
            LlmMessage(
                content=PromptGenerator.user_prompt(
                    question=command.message, message_history=message_history
                ),
                role=LlmMessageRole.USER,
            ),
        ]
    )

    return AnswerResult(
        answer=answer, new_thread_id=thread_id if command.thread_id is None else None
    )
