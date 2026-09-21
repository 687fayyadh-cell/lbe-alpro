package handler

import (
	"net/http"

	"backend/internal/dto"
	"backend/internal/response"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// AuthHandler handles authentication HTTP requests.
type AuthHandler struct {
	authService *service.AuthService
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Register godoc
// @Summary      Register new student account
// @Description  Create a new account with student role. Role is forced to student.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body dto.RegisterRequest true "Registration payload"
// @Success      201  {object} response.BaseResponse{data=dto.UserResponse}
// @Failure      400  {object} response.ErrorResponse
// @Failure      409  {object} response.ErrorResponse
// @Router       /api/v1/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.HandleValidationError(c, err)
		return
	}

	user, err := h.authService.Register(req)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Created(c, "Registrasi berhasil", dto.UserResponse{
		ID:         user.ID,
		Name:       user.Name,
		Email:      user.Email,
		Role:       string(user.Role),
		Department: user.Department,
		Bio:        user.Bio,
	})
}

// Login godoc
// @Summary      Login
// @Description  Authenticate and receive a JWT token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body dto.LoginRequest true "Login payload"
// @Success      200  {object} response.BaseResponse{data=dto.LoginResponse}
// @Failure      400  {object} response.ErrorResponse
// @Failure      401  {object} response.ErrorResponse
// @Router       /api/v1/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.HandleValidationError(c, err)
		return
	}

	token, err := h.authService.Login(req)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Success(c, "Login berhasil", dto.LoginResponse{Token: token})
}

// GetMe godoc
// @Summary      Get current user profile
// @Description  Get the authenticated user's profile
// @Tags         users
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object} response.BaseResponse{data=dto.UserResponse}
// @Failure      401  {object} response.ErrorResponse
// @Router       /api/v1/users/me [get]
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", response.Messages["UNAUTHORIZED"])
		return
	}

	data, err := h.authService.GetMe(userID.(uint))
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Success(c, "Profil berhasil diambil", data)
}

// UpdateMe godoc
// @Summary      Update current user profile
// @Description  Update the authenticated user's profile
// @Tags         users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body body dto.UpdateProfileRequest true "Update payload"
// @Success      200  {object} response.BaseResponse{data=dto.UserResponse}
// @Failure      400  {object} response.ErrorResponse
// @Failure      401  {object} response.ErrorResponse
// @Router       /api/v1/users/me [put]
func (h *AuthHandler) UpdateMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", response.Messages["UNAUTHORIZED"])
		return
	}

	var req dto.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.HandleValidationError(c, err)
		return
	}

	data, err := h.authService.UpdateMe(userID.(uint), req)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Success(c, "Profil berhasil diperbarui", data)
}
