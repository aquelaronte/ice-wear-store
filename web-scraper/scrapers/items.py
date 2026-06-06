from dataclasses import dataclass

import scrapy


class IceWearStoreItem(scrapy.Item):
    name: str = scrapy.Field()
    price: int = scrapy.Field()
    description: str | None = scrapy.Field()
    pictures: list[str] = scrapy.Field()
    variants: list[str] = scrapy.Field()
