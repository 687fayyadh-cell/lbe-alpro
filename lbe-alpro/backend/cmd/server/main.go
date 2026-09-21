// Command server boots the SinergiITS backend.
//
// It loads environment config, connects to PostgreSQL, runs AutoMigrate,
// installs CORS, exposes a health probe, and listens on PORT.
package main

import (
	"log"
	"net/http"

	"backend/internal/config"
	"backend/internal/middleware"
	"backend/internal/model"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	cfg.Validate()

	db := cfg.ConnectDB()

	if err := db.AutoMigrate(
		&model.User{},
		&model.Event{},
		&model.Registration{},
		&model.Team{},
		&model.TeamMember{},
	); err != nil {
		log.Fatalf("FATAL: auto-migration failed: %v", err)
	}
	log.Println("AutoMigrate completed successfully.")

	router := gin.Default()
	router.Use(middleware.CORS(cfg.CORSOrigin))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "OK",
			"data":    gin.H{"status": "up"},
		})
	})

	log.Printf("SinergiITS backend starting on :%s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server failed to start: %v", err)
	}
}
