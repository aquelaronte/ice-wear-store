.PHONY: dev build-migrate populate

dev:
	air

build-migrate:
	go build -o ./bin/migrate ./cmd/migrate

populate:
	go run ./cmd/populate/main.go
