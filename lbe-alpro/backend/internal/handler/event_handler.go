package handler

import (
	"net/http"
	"strconv"
	"time"

	"backend/internal/dto"
	"backend/internal/model"
	"backend/internal/response"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// EventHandler handles event HTTP requests.
type EventHandler struct {
	eventService *service.EventService
}

// NewEventHandler creates a new EventHandler.
func NewEventHandler(eventService *service.EventService) *EventHandler {
	return &EventHandler{eventService: eventService}
}

// ListEvents godoc
// @Summary      List published events
// @Description  Get a paginated list of published events with optional filters
// @Tags         events
// @Produce      json
// @Param        category query string false "Filter by category"
// @Param        type     query string false "Filter by event type"
// @Param        status   query string false "Filter by status (open/closed)"
// @Param        q        query string false "Search keyword"
// @Param        page     query int    false "Page number" default(1)
// @Param        limit    query int    false "Items per page" default(10)
// @Success      200  {object} map[string]interface{}
// @Failure      500  {object} map[string]interface{}
// @Router       /events [get]
func (h *EventHandler) ListEvents(c *gin.Context) {
	category := c.Query("category")
	eventType := c.Query("type")
	status := c.Query("status")
	keyword := c.Query("q")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	events, total, err := h.eventService.ListPublished(category, eventType, status, keyword, page, limit)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Paginated(c, "Daftar event berhasil diambil", events, response.Meta{
		Page:  page,
		Limit: limit,
		Total: total,
	})
}

// GetEvent godoc
// @Summary      Get event detail
// @Description  Get a published event by ID
// @Tags         events
// @Produce      json
// @Param        id   path int true "Event ID"
// @Success      200  {object} map[string]interface{}
// @Failure      404  {object} map[string]interface{}
// @Router       /events/{id} [get]
func (h *EventHandler) GetEvent(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, 400, "VALIDATION_ERROR", "ID event tidak valid")
		return
	}

	event, err := h.eventService.GetByID(uint(id))
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Success(c, "Detail event berhasil diambil", event)
}

// CreateEvent godoc
// @Summary      Create event
// @Description  Create a new event (organizer/admin only). Status forced to pending.
// @Tags         events
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body body dto.CreateEventRequest true "Event payload"
// @Success      201  {object} map[string]interface{}
// @Failure      400  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Failure      403  {object} map[string]interface{}
// @Router       /events [post]
func (h *EventHandler) CreateEvent(c *gin.Context) {
	userID := c.GetUint("userID")

	var req dto.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.HandleValidationError(c, err)
		return
	}

	deadline, _ := time.Parse(time.RFC3339, req.Deadline)
	var startDate, endDate *time.Time
	if req.StartDate != "" {
		t, _ := time.Parse(time.RFC3339, req.StartDate)
		startDate = &t
	}
	if req.EndDate != "" {
		t, _ := time.Parse(time.RFC3339, req.EndDate)
		endDate = &t
	}

	event := &model.Event{
		OrganizerID: userID,
		Title:       req.Title,
		Category:    model.Category(req.Category),
		Type:        model.EventType(req.Type),
		Description: req.Description,
		PosterURL:   req.PosterURL,
		Quota:       req.Quota,
		Deadline:    deadline,
		StartDate:   startDate,
		EndDate:     endDate,
	}

	if err := h.eventService.Create(event); err != nil {
		response.HandleError(c, err)
		return
	}

	response.Created(c, "Event berhasil dibuat", event)
}

// UpdateEvent godoc
// @Summary      Update event
// @Description  Update an event (owner organizer/admin only)
// @Tags         events
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Event ID"
// @Param        body body dto.UpdateEventRequest true "Update payload"
// @Success      200  {object} map[string]interface{}
// @Failure      400  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Failure      403  {object} map[string]interface{}
// @Failure      404  {object} map[string]interface{}
// @Router       /events/{id} [put]
func (h *EventHandler) UpdateEvent(c *gin.Context) {
	userID := c.GetUint("userID")
	role := c.MustGet("role").(model.Role)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "ID event tidak valid")
		return
	}

	var req dto.UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.HandleValidationError(c, err)
		return
	}

	updates := &model.Event{}
	if req.Title != "" {
		updates.Title = req.Title
	}
	if req.Category != "" {
		updates.Category = model.Category(req.Category)
	}
	if req.Type != "" {
		updates.Type = model.EventType(req.Type)
	}
	if req.Description != "" {
		updates.Description = req.Description
	}
	if req.PosterURL != "" {
		updates.PosterURL = req.PosterURL
	}
	if req.Quota > 0 {
		updates.Quota = req.Quota
	}
	if req.Deadline != "" {
		t, _ := time.Parse(time.RFC3339, req.Deadline)
		updates.Deadline = t
	}
	if req.StartDate != "" {
		t, _ := time.Parse(time.RFC3339, req.StartDate)
		updates.StartDate = &t
	}
	if req.EndDate != "" {
		t, _ := time.Parse(time.RFC3339, req.EndDate)
		updates.EndDate = &t
	}

	event, err := h.eventService.Update(uint(id), userID, role, updates)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Success(c, "Event berhasil diperbarui", event)
}

// DeleteEvent godoc
// @Summary      Delete event
// @Description  Delete an event (owner organizer/admin only)
// @Tags         events
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Event ID"
// @Success      204  "No Content"
// @Failure      401  {object} map[string]interface{}
// @Failure      403  {object} map[string]interface{}
// @Failure      404  {object} map[string]interface{}
// @Router       /events/{id} [delete]
func (h *EventHandler) DeleteEvent(c *gin.Context) {
	userID := c.GetUint("userID")
	role := c.MustGet("role").(model.Role)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "ID event tidak valid")
		return
	}

	if err := h.eventService.Delete(uint(id), userID, role); err != nil {
		response.HandleError(c, err)
		return
	}

	response.NoContent(c)
}

// ListOrganizerEvents godoc
// @Summary      List organizer events
// @Description  Get all events for the current organizer
// @Tags         organizer
// @Produce      json
// @Security     BearerAuth
// @Param        page  query int false "Page number" default(1)
// @Param        limit query int false "Items per page" default(10)
// @Success      200  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Router       /organizer/events [get]
func (h *EventHandler) ListOrganizerEvents(c *gin.Context) {
	userID := c.GetUint("userID")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	events, total, err := h.eventService.ListByOrganizer(userID, page, limit)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Paginated(c, "Daftar event berhasil diambil", events, response.Meta{
		Page:  page,
		Limit: limit,
		Total: total,
	})
}

// ListRegistrants godoc
// @Summary      List event registrants
// @Description  Get all registrants for an event (owner organizer/admin only)
// @Tags         organizer
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Event ID"
// @Success      200  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Failure      403  {object} map[string]interface{}
// @Failure      404  {object} map[string]interface{}
// @Router       /events/{id}/registrants [get]
func (h *EventHandler) ListRegistrants(c *gin.Context) {
	userID := c.GetUint("userID")
	role := c.MustGet("role").(model.Role)

	eventID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "ID event tidak valid")
		return
	}

	regs, err := h.eventService.ListRegistrants(uint(eventID), userID, role)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Success(c, "Daftar pendaftar berhasil diambil", regs)
}
