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
	adminService := service.NewAdminService(eventRepo, userRepo, db)
	teamRepo := repository.NewTeamRepository(db)
	teamService := service.NewTeamService(teamRepo, db)
	authHandler := handler.NewAuthHandler(authService)
	eventHandler := handler.NewEventHandler(eventService)
	regHandler := handler.NewRegistrationHandler(regService)
	adminHandler := handler.NewAdminHandler(adminService)
	teamHandler := handler.NewTeamHandler(teamService)

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
		v1.GET("/teams", teamHandler.ListTeams)

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
				student.POST("/teams", teamHandler.CreateTeam)
				student.POST("/teams/:id/join", teamHandler.JoinTeam)
			}

			// Organizer/admin routes
			organizer := auth.Group("")
			organizer.Use(middleware.RequireRole(model.RoleOrganizer, model.RoleAdmin))
			{
				organizer.POST("/events", eventHandler.CreateEvent)
				organizer.PUT("/events/:id", eventHandler.UpdateEvent)
				organizer.DELETE("/events/:id", eventHandler.DeleteEvent)
				organizer.GET("/organizer/events", eventHandler.ListOrganizerEvents)
				organizer.GET("/events/:id/registrants", eventHandler.ListRegistrants)
				organizer.PUT("/registrations/:id/status", regHandler.UpdateRegistrationStatus)
			}

			// Admin-only routes
			admin := auth.Group("")
			admin.Use(middleware.RequireRole(model.RoleAdmin))
			{
				admin.GET("/admin/events", adminHandler.ListPendingEvents)
				admin.PUT("/admin/events/:id/status", adminHandler.UpdateEventStatus)
				admin.GET("/admin/users", adminHandler.ListUsers)
				admin.PUT("/admin/users/:id/role", adminHandler.UpdateUserRole)
			}
		}
	}

	log.Printf("SinergiITS backend starting on :%s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server failed to start: %v", err)
	}
}
