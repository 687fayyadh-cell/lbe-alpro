// Command server boots the SinergiITS backend.
package main

import (
	"log"
	"net/http"

	"backend/internal/config"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/service"

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

	// Wire dependencies
	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, cfg.JWTSecret, cfg.JWTExpiresHours)
	authHandler := handler.NewAuthHandler(authService)

	router := gin.Default()
	router.Use(middleware.CORS(cfg.CORSOrigin))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "OK",
			"data":    gin.H{"status": "up"},
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Public routes
		v1.POST("/auth/register", authHandler.Register)
		v1.POST("/auth/login", authHandler.Login)
		v1.GET("/events", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: events list", "data": []interface{}{}})
		})
		v1.GET("/events/:id", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: event detail", "data": nil})
		})
		v1.GET("/teams", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: teams list", "data": []interface{}{}})
		})

		// Protected routes (require valid JWT)
		auth := v1.Group("")
		auth.Use(middleware.AuthJWT(cfg.JWTSecret))
		{
			auth.GET("/users/me", authHandler.GetMe)
			auth.PUT("/users/me", authHandler.UpdateMe)
			auth.GET("/registrations/me", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: my registrations", "data": []interface{}{}})
			})

			// Student-only routes
			student := auth.Group("")
			student.Use(middleware.RequireRole(model.RoleStudent))
			{
				student.POST("/events/:id/register", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: register to event"})
				})
				student.POST("/teams", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: create team"})
				})
				student.POST("/teams/:id/join", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: join team"})
				})
			}

			// Organizer/admin routes
			organizer := auth.Group("")
			organizer.Use(middleware.RequireRole(model.RoleOrganizer, model.RoleAdmin))
			{
				organizer.POST("/events", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: create event"})
				})
				organizer.PUT("/events/:id", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: update event"})
				})
				organizer.DELETE("/events/:id", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: delete event"})
				})
				organizer.GET("/organizer/events", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: my events", "data": []interface{}{}})
				})
				organizer.GET("/events/:id/registrants", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: event registrants", "data": []interface{}{}})
				})
				organizer.PUT("/registrations/:id/status", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: update registration status"})
				})
			}

			// Admin-only routes
			admin := auth.Group("")
			admin.Use(middleware.RequireRole(model.RoleAdmin))
			{
				admin.GET("/admin/events", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: admin events list", "data": []interface{}{}})
				})
				admin.PUT("/admin/events/:id/status", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: admin update event status"})
				})
				admin.GET("/admin/users", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: admin users list", "data": []interface{}{}})
				})
				admin.PUT("/admin/users/:id/role", func(c *gin.Context) {
					c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: admin update user role"})
				})
			}
		}
	}

	log.Printf("SinergiITS backend starting on :%s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server failed to start: %v", err)
	}
}
