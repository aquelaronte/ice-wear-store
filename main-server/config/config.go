package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	CORSOrigins []string
	FrostAIURL  string
	DB          struct {
		Host     string
		Port     string
		Name     string
		Password *string
		User     string
	}
}

var Envs = initConfig()

func initConfig() Config {
	godotenv.Load()

	return Config{
		Port:        getEnv("PORT", "8000"),
		CORSOrigins: splitAndTrim(getEnv("CORS_ORIGINS", "*")),
		FrostAIURL:  getEnv("FROST_AI_URL", "http://localhost:8001"),
		DB: struct {
			Host     string
			Port     string
			Name     string
			Password *string
			User     string
		}{
			Host:     getEnv("DB_HOST", "127.0.0.1"),
			Port:     getEnv("DB_PORT", "5432"),
			Name:     getEnv("DB_NAME", "ice_wear_store"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnvWithoutFallback("DB_PASSWORD"),
		},
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

func getEnvWithoutFallback(key string) *string {
	if value, ok := os.LookupEnv(key); ok {
		return &value
	}

	return nil
}
