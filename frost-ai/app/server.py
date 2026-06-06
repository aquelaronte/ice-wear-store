from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.commands.answer import AnswerCommand, AnswerResult, answer
from app.config import dependencies


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await dependencies.init()
    try:
        yield
    finally:
        await dependencies.close()


app = FastAPI(title="Frost AI", lifespan=lifespan)


@app.post("/answer", response_model=AnswerResult)
async def post_answer(command: AnswerCommand) -> AnswerResult:
    return await answer(command)
