from dataclasses import dataclass
from typing import TypedDict

import scrapy
from scrapy.http import Response

from scrapers import helpers
from scrapers.items import IceWearStoreItem


class ShopifyStoreSpider(scrapy.Spider):
    description_selector = ".product-info__block-item .prose p::text"
    discard_first_picture_in_gallery = False

    def parse(self, response: Response):
        for product in response.css("product-card")[:1]:
            raw_img = product.css(".product-card__figure img::attr(src)").get()
            href = product.css("product-card a.product-title::attr(href)").get()

            img = response.urljoin(raw_img) if raw_img is not None else None

            yield response.follow(
                url=href,
                callback=self.lookup_product,
                cb_kwargs={"cover_img": img},
            )

    def lookup_product(self, response: Response, cover_img: str | None):
        name = response.css(".product-info__block-item h1.product-title::text").get()

        if name is None:
            return

        # Parse price to integer format in cents
        raw_price = response.css(".product-info__block-item span.money::text").get()

        if raw_price is None:
            return

        price = helpers.parse_currency_value(raw_price)

        if price is None:
            return

        description = response.css(self.description_selector).get()

        pictures_src = response.css(".product-gallery__media img::attr(src)").getall()
        pictures_src = (
            pictures_src[1:5]
            if self.discard_first_picture_in_gallery
            else pictures_src[:4]
        )

        # Retrieve first 4 pictures
        pictures = [response.urljoin(src) for src in pictures_src]

        variants = response.css(
            ".variant-picker__option-values .block-swatch span::text"
        ).getall()

        if cover_img is not None:
            pictures.insert(0, cover_img)

        yield IceWearStoreItem(
            name=name,
            price=price,
            pictures=pictures,
            description=description,
            variants=variants,
        )
