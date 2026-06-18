.PHONY: setup prod migrate populate-catalog populate-descriptions populate-embeddings infra init

setup:
	@echo "==> [1/4] Migrating database schema..."
	$(MAKE) -C main-server init
	$(MAKE) -C main-server migrate
	@echo "==> [2/4] Populating catalog from scrapers..."
	$(MAKE) -C main-server populate
	@echo "==> [3/4] Generating item descriptions..."
	$(MAKE) -C frost-ai populate-descriptions
	@echo "==> [4/4] Building vector embeddings..."
	$(MAKE) -C frost-ai populate-embeddings
	@echo "==> Database setup complete."

# Build and run all three services in production mode (Ctrl+C stops them).
prod:
	./scripts/start-prod.sh

# Start backing services (PostgreSQL + Qdrant).
infra:
	docker compose up -d

# Individual steps, runnable on their own.
init:
	$(MAKE) -C main-server init

migrate:
	$(MAKE) -C main-server migrate

populate-catalog:
	$(MAKE) -C main-server populate

populate-descriptions:
	$(MAKE) -C frost-ai populate-descriptions

populate-embeddings:
	$(MAKE) -C frost-ai populate-embeddings
