package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string
	DB   struct {
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
		Port: getEnv("PORT", "8000"),
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

func getEnvWithoutFallback(key string) *string {
	if value, ok := os.LookupEnv(key); ok {
		return &value
	}

	return nil
}
