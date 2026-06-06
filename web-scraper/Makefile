.PHONY: crawl-clemont crawl-undergold

LIMIT ?=

crawl-clemont:
	uv run scrapy crawl clemont $(if $(LIMIT),-a limit=$(LIMIT),) -O -:jsonlines

crawl-undergold:
	uv run scrapy crawl undergold $(if $(LIMIT),-a limit=$(LIMIT),) -O -:jsonlines
