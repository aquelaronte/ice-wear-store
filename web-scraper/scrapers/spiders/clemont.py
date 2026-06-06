from scrapers.spiders._shopify_base import ShopifyStoreSpider


class ClemontSpider(ShopifyStoreSpider):
    name = "clemont"
    allowed_domains = ["clemont.co"]
    start_urls = [
        "https://clemont.co/collections/all",
    ]
    discard_first_picture_in_gallery = True
