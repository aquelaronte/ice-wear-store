from dataclasses import dataclass


@dataclass
class Item:
    name: str
    description: str | None
    price: int
    variants: list[str]


@dataclass
class ScoredItem(Item):
    score: float
