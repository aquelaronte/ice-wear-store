import asyncio

import httpx
from google.genai import Client, types


class LlmImageGoogleaiRepository:
    def __init__(self, googleai_client: Client) -> None:
        self.googleai_client = googleai_client

    async def generate_images_embedding(self, image_urls: list[str]) -> list[float]:
        # The embedding model can only fetch Google-hosted URIs, so download the
        # images ourselves and pass the raw bytes.
        async with httpx.AsyncClient() as http_client:
            parts = await asyncio.gather(
                *[self._fetch_image_part(http_client, url) for url in image_urls]
            )

        parts = [part for part in parts if part is not None]
        if not parts:
            return []

        response = await self.googleai_client.aio.models.embed_content(  # pyright: ignore[reportUnknownMemberType]
            model="gemini-embedding-2",
            contents=parts,
        )

        if response.embeddings is None or response.embeddings[0].values is None:
            return []

        return response.embeddings[0].values

    async def _fetch_image_part(
        self, http_client: httpx.AsyncClient, image_url: str
    ) -> types.Part | None:
        try:
            response = await http_client.get(image_url, follow_redirects=True)
            response.raise_for_status()
        except httpx.HTTPError:
            return None

        mime_type = response.headers.get("content-type", "image/jpeg").split(";")[0]
        return types.Part.from_bytes(data=response.content, mime_type=mime_type)
