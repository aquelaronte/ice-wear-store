from openai import AsyncOpenAI

from app.types.llm import LlmMessage, LlmMessageRole


class LlmOpenaiRepository:
    def __init__(self, openai_client: AsyncOpenAI) -> None:
        self.openai_client = openai_client

    async def ask(self, messages: list[LlmMessage]) -> str:
        response = await self.openai_client.chat.completions.create(
            model="o4-mini",
            messages=[
                {
                    "role": (
                        "user" if message.role == LlmMessageRole.USER else "assistant"
                    ),
                    "content": message.content,
                }
                for message in messages
            ],  # pyright: ignore[reportArgumentType]
        )

        answer = response.choices[0].message.content

        if answer is None:
            raise Exception("answer can't be generated")

        return answer

    async def generate_embedding(self, to_embed: str) -> list[float]:
        embedding = await self.openai_client.embeddings.create(
            input=to_embed,
            model="text-embedding-3-small",
            encoding_format="float",
        )

        return embedding.data[0].embedding
