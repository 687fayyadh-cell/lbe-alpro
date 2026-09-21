// Package config loads backend runtime configuration from environment
// variables and provides database connectivity.
package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
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

// Validate fails fast when critical environment variables are missing or
// insecure. Call this before starting the server.
func (c *Config) Validate() {
	if c.JWTSecret == "" || c.JWTSecret == "change-me" {
		log.Fatal("FATAL: JWT_SECRET must be set to a secure value in .env")
	}
	if c.DBHost == "" || c.DBName == "" || c.DBUser == "" {
		log.Fatal("FATAL: DB_HOST, DB_NAME, and DB_USER must be set in .env")
	}
}

// ConnectDB opens a GORM connection to PostgreSQL and returns it.
// AutoMigrate is not called here; it happens in main after models are wired.
func (c *Config) ConnectDB() *gorm.DB {
	db, err := gorm.Open(postgres.Open(c.DSN()), &gorm.Config{
		Logger:                                   logger.Default.LogMode(logger.Silent),
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatalf("FATAL: failed to connect to database: %v", err)
	}
	return db
}
