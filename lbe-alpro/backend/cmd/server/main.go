// Command server boots the SinergiITS backend (G0 scaffold).
//
// It loads environment config, installs CORS, exposes a health probe,
// and listens on PORT. Routes, database wiring, and auth arrive in
// later units (BE-01 onward).
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

	router := gin.Default()
	router.Use(middleware.CORS(cfg.CORSOrigin))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "OK",
			"data":    gin.H{"status": "up"},
		})
	})

	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server failed to start: %v", err)
	}
}
