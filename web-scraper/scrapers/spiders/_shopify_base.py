import scrapy
from scrapy.http import Response

from scrapers import helpers
from scrapers.items import IceWearStoreItem


class ShopifyStoreSpider(scrapy.Spider):
    def parse(self, response: Response):
        hrefs = response.css("product-card a.product-title::attr(href)").getall()

        yield from response.follow_all(urls=hrefs, callback=self.lookup_product)

    def lookup_product(self, response: Response):
        name = response.css(".product-info__block-item h1.product-title::text").get()

        if name is None:
            return

        raw_price = response.css(".product-info__block-item span.money::text").get()

        if raw_price is None:
            return

        price = helpers.parse_currency_value(raw_price)

        if price is None:
            return

        description = response.css(".product-info__block-item .prose p::text").get()

        pictures = [
            response.urljoin(src)
            for src in response.css(".product-gallery__media img::attr(src)").getall()
        ]

        variants = response.css(
            ".variant-picker__option-values .block-swatch span::text"
        ).getall()

        yield IceWearStoreItem(
            name=name,
            price=price,
            description=description,
            pictures=pictures,
            variants=variants,
        )
