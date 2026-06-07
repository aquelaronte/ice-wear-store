.PHONY: dev build-migrate populate migrate rollback

LIMIT ?=

dev:
	air

build-migrate:
	go build -o ./bin/migrate ./cmd/migrate

populate:
	go run ./cmd/populate/main.go $(if $(LIMIT),-limit=$(LIMIT),)

migrate:
	go run ./cmd/migrate db migrate

rollback:
	go run ./cmd/migrate db rollback
