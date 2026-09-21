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
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           SinergiITS API
// @version         1.0
// @description     Platform terpadu pengembangan diri mahasiswa ITS.
// @host            localhost:8080
// @BasePath        /api/v1
// @schemes         http
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Masukkan "Bearer {token}"
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

	config.Seed(db)

	// Wire dependencies
	userRepo := repository.NewUserRepository(db)
	eventRepo := repository.NewEventRepository(db)
	regRepo := repository.NewRegistrationRepository(db)
	authService := service.NewAuthService(userRepo, cfg.JWTSecret, cfg.JWTExpiresHours)
	eventService := service.NewEventService(eventRepo)
	regService := service.NewRegistrationService(regRepo, eventRepo, db)
	authHandler := handler.NewAuthHandler(authService)
	eventHandler := handler.NewEventHandler(eventService)
	regHandler := handler.NewRegistrationHandler(regService)

	router := gin.Default()
	router.Use(middleware.CORS(cfg.CORSOrigin))

	// Health check
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

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
		v1.GET("/events", eventHandler.ListEvents)
		v1.GET("/events/:id", eventHandler.GetEvent)
		v1.GET("/teams", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"success": true, "message": "TODO: teams list", "data": []interface{}{}})
		})

		// Protected routes (require valid JWT)
		auth := v1.Group("")
		auth.Use(middleware.AuthJWT(cfg.JWTSecret))
		{
			auth.GET("/users/me", authHandler.GetMe)
			auth.PUT("/users/me", authHandler.UpdateMe)
			auth.GET("/registrations/me", regHandler.ListMyRegistrations)

			// Student-only routes
			student := auth.Group("")
			student.Use(middleware.RequireRole(model.RoleStudent))
			{
				student.POST("/events/:id/register", regHandler.RegisterToEvent)
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
				organizer.PUT("/registrations/:id/status", regHandler.UpdateRegistrationStatus)
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
