from scrapers.spiders._shopify_base import ShopifyStoreSpider


class UndergoldSpider(ShopifyStoreSpider):
    name = "undergold"
    allowed_domains = ["undergoldapparel.com"]
    start_urls = ["https://undergoldapparel.com/collections/all"]
    description_selector = (
        '.product-info__block-item[data-block-id="description"] .prose p::text'
    )
