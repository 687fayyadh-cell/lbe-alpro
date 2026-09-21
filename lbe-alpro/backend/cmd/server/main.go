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

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	cfg.Validate()

	db := cfg.ConnectDB()

	// AutoMigrate will be populated as models are added (BE-02).
	// Example: db.AutoMigrate(&model.User{}, &model.Event{}, ...)
	_ = db

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
