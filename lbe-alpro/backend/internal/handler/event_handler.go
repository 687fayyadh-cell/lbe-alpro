package handler

import (
	"strconv"

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
