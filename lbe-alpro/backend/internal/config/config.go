// Package config loads backend runtime configuration from environment
// variables. G0 scaffold: no database connection yet (see BE-01).
package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
)

// Config holds all backend runtime settings. Values come from the
// environment with local-development defaults matching .env.example.
type Config struct {
	DBHost          string
	DBPort          string
	DBUser          string
	DBPassword      string
	DBName          string
	JWTSecret       string
	JWTExpiresHours int
	Port            string
	CORSOrigin      string
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// Load reads configuration from the environment. It warns (does not fail)
// when JWT_SECRET is still the insecure placeholder so the G0 scaffold can
// boot locally; BE-01 enforces fail-fast validation on startup.
func Load() *Config {
	expHours, err := strconv.Atoi(getenv("JWT_EXPIRES_HOURS", "24"))
	if err != nil || expHours <= 0 {
		expHours = 24
	}

	cfg := &Config{
		DBHost:          getenv("DB_HOST", "localhost"),
		DBPort:          getenv("DB_PORT", "5432"),
		DBUser:          getenv("DB_USER", "postgres"),
		DBPassword:      getenv("DB_PASSWORD", ""),
		DBName:          getenv("DB_NAME", "sinergiits"),
		JWTSecret:       getenv("JWT_SECRET", "change-me"),
		JWTExpiresHours: expHours,
		Port:            getenv("PORT", "8080"),
		CORSOrigin:      getenv("CORS_ORIGIN", "http://localhost:3000"),
	}

	if cfg.JWTSecret == "" || cfg.JWTSecret == "change-me" {
		log.Println("WARNING: JWT_SECRET is not set to a secure value; update .env before any real use.")
	}

	return cfg
}

// DSN returns the PostgreSQL connection string for the configured database.
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName,
	)
}
