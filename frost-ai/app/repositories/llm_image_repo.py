from typing import Protocol


class LlmImageRepository(Protocol):
    async def generate_images_embedding(self, image_urls: list[str]) -> list[float]: ...
