.PHONY: dev build-migrate populate

LIMIT ?=

dev:
	air

build-migrate:
	go build -o ./bin/migrate ./cmd/migrate

populate:
	go run ./cmd/populate/main.go $(if $(LIMIT),-limit=$(LIMIT),)
