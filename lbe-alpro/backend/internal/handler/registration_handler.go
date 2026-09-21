package handler

import (
	"net/http"
	"strconv"

	"backend/internal/dto"
	"backend/internal/model"
	"backend/internal/response"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// RegistrationHandler handles registration HTTP requests.
type RegistrationHandler struct {
	regService *service.RegistrationService
}

// NewRegistrationHandler creates a new RegistrationHandler.
func NewRegistrationHandler(regService *service.RegistrationService) *RegistrationHandler {
	return &RegistrationHandler{regService: regService}
}

// RegisterToEvent godoc
// @Summary      Register to event
// @Description  Register the current user to an event (student only)
// @Tags         registrations
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Event ID"
// @Success      201  {object} map[string]interface{}
// @Failure      400  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Failure      409  {object} map[string]interface{}
// @Failure      422  {object} map[string]interface{}
// @Router       /events/{id}/register [post]
func (h *RegistrationHandler) RegisterToEvent(c *gin.Context) {
	userID := c.GetUint("userID")

	eventID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "ID event tidak valid")
		return
	}

	reg, err := h.regService.Register(uint(eventID), userID)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Created(c, "Berhasil mendaftar ke event", reg)
}

// ListMyRegistrations godoc
// @Summary      List my registrations
// @Description  Get all registrations for the current user
// @Tags         registrations
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Router       /registrations/me [get]
func (h *RegistrationHandler) ListMyRegistrations(c *gin.Context) {
	userID := c.GetUint("userID")

	regs, err := h.regService.ListMy(userID)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Success(c, "Daftar pendaftaran berhasil diambil", regs)
}

// UpdateRegistrationStatus godoc
// @Summary      Update registration status
// @Description  Approve or reject a pending registration (organizer/admin only)
// @Tags         registrations
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Registration ID"
// @Param        body body dto.UpdateRegistrationStatusRequest true "Status update"
// @Success      200  {object} map[string]interface{}
// @Failure      400  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Failure      403  {object} map[string]interface{}
// @Failure      404  {object} map[string]interface{}
// @Router       /registrations/{id}/status [put]
func (h *RegistrationHandler) UpdateRegistrationStatus(c *gin.Context) {
	userID := c.GetUint("userID")
	role := c.MustGet("role").(model.Role)

	regID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "ID pendaftaran tidak valid")
		return
	}

	var req dto.UpdateRegistrationStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.HandleValidationError(c, err)
		return
	}

	if req.Status == "approved" {
		if err := h.regService.Approve(uint(regID), 0, userID, role); err != nil {
			response.HandleError(c, err)
			return
		}
		response.Success(c, "Pendaftaran berhasil disetujui", nil)
	} else {
		if err := h.regService.Reject(uint(regID), 0, userID, role); err != nil {
			response.HandleError(c, err)
			return
		}
		response.Success(c, "Pendaftaran berhasil ditolak", nil)
	}
}
