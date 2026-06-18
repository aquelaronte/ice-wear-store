package config

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	CORSOrigins []string
	FrostAIURL  string
	UploadDir   string
	DBDSN       string
}

var Envs = initConfig()

func initConfig() Config {
	// Load the centralized root .env by walking up from the working directory.
	if envPath := findEnvFile(); envPath != "" {
		godotenv.Load(envPath)
	}

	return Config{
		Port:        getEnv("MAIN_SERVER_PORT", "8000"),
		CORSOrigins: splitAndTrim(getEnv("CORS_ORIGINS", "*")),
		FrostAIURL:  getEnv("FROST_AI_URL", "http://localhost:8001"),
		UploadDir:   "./uploads",
		DBDSN:       getEnv("DB_DSN", "postgres://postgres:postgres@127.0.0.1:5432/ice_wear_store?sslmode=disable"),
	}
}

// findEnvFile walks up from the current working directory looking for a .env
// file, returning its path so the centralized root .env is found regardless of
// which cmd/ binary is run. Returns "" if none is found.
func findEnvFile() string {
	dir, err := os.Getwd()
	if err != nil {
		return ""
	}

	for {
		candidate := filepath.Join(dir, ".env")
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}

		parent := filepath.Dir(dir)
		if parent == dir {
			return ""
		}
		dir = parent
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}

func splitAndTrim(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
