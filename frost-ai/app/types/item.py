from dataclasses import dataclass


@dataclass
class Item:
    item_id: str
    name: str
    description: str | None
    price: int
    variants: list[str]


@dataclass
class ScoredItem(Item):
    visual_description: str | None
    score: float
