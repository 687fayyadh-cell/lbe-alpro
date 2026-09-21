package handler

import (
	"net/http"
	"strconv"

	"backend/internal/model"
	"backend/internal/response"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// AdminHandler handles admin HTTP requests.
type AdminHandler struct {
	adminService *service.AdminService
}

// NewAdminHandler creates a new AdminHandler.
func NewAdminHandler(adminService *service.AdminService) *AdminHandler {
	return &AdminHandler{adminService: adminService}
}

// ListPendingEvents godoc
// @Summary      List pending events
// @Description  Get events pending moderation (admin only)
// @Tags         admin
// @Produce      json
// @Security     BearerAuth
// @Param        page  query int false "Page number" default(1)
// @Param        limit query int false "Items per page" default(10)
// @Success      200  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Failure      403  {object} map[string]interface{}
// @Router       /admin/events [get]
func (h *AdminHandler) ListPendingEvents(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	events, total, err := h.adminService.ListPendingEvents(page, limit)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Paginated(c, "Daftar event pending berhasil diambil", events, response.Meta{
		Page:  page,
		Limit: limit,
		Total: total,
	})
}

// UpdateEventStatus godoc
// @Summary      Update event status
// @Description  Approve or reject an event (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Event ID"
// @Param        body body object true "Status update"
// @Success      200  {object} map[string]interface{}
// @Failure      400  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Failure      403  {object} map[string]interface{}
// @Failure      404  {object} map[string]interface{}
// @Router       /admin/events/{id}/status [put]
func (h *AdminHandler) UpdateEventStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "ID event tidak valid")
		return
	}

	var req struct {
		Status string `json:"status" binding:"required,oneof=published rejected"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.HandleValidationError(c, err)
		return
	}

	if err := h.adminService.UpdateEventStatus(uint(id), model.EventStatus(req.Status)); err != nil {
		response.HandleError(c, err)
		return
	}

	response.Success(c, "Status event berhasil diperbarui", nil)
}

// ListUsers godoc
// @Summary      List users
// @Description  Get all users (admin only)
// @Tags         admin
// @Produce      json
// @Security     BearerAuth
// @Param        page  query int false "Page number" default(1)
// @Param        limit query int false "Items per page" default(10)
// @Success      200  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Failure      403  {object} map[string]interface{}
// @Router       /admin/users [get]
func (h *AdminHandler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	users, total, err := h.adminService.ListUsers(page, limit)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	// Convert to safe responses (no password hash)
	var safeUsers []map[string]interface{}
	for _, u := range users {
		safeUsers = append(safeUsers, map[string]interface{}{
			"id":         u.ID,
			"name":       u.Name,
			"email":      u.Email,
			"role":       string(u.Role),
			"department": u.Department,
		})
	}

	response.Paginated(c, "Daftar pengguna berhasil diambil", safeUsers, response.Meta{
		Page:  page,
		Limit: limit,
		Total: total,
	})
}

// UpdateUserRole godoc
// @Summary      Update user role
// @Description  Change a user's role (admin only)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "User ID"
// @Param        body body object true "Role update"
// @Success      200  {object} map[string]interface{}
// @Failure      400  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Failure      403  {object} map[string]interface{}
// @Failure      404  {object} map[string]interface{}
// @Router       /admin/users/{id}/role [put]
func (h *AdminHandler) UpdateUserRole(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "ID pengguna tidak valid")
		return
	}

	var req struct {
		Role string `json:"role" binding:"required,oneof=student organizer admin"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.HandleValidationError(c, err)
		return
	}

	if err := h.adminService.UpdateUserRole(uint(id), model.Role(req.Role)); err != nil {
		response.HandleError(c, err)
		return
	}

	response.Success(c, "Role pengguna berhasil diperbarui", nil)
}
