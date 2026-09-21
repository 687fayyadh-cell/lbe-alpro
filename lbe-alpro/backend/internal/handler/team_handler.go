package handler

import (
	"net/http"
	"strconv"

	"backend/internal/model"
	"backend/internal/response"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// TeamHandler handles team HTTP requests.
type TeamHandler struct {
	teamService *service.TeamService
}

// NewTeamHandler creates a new TeamHandler.
func NewTeamHandler(teamService *service.TeamService) *TeamHandler {
	return &TeamHandler{teamService: teamService}
}

// ListTeams godoc
// @Summary      List teams
// @Description  Get a list of team posts with optional event filter
// @Tags         teams
// @Produce      json
// @Param        event_id query int false "Filter by event ID"
// @Param        page     query int false "Page number" default(1)
// @Param        limit    query int false "Items per page" default(10)
// @Success      200  {object} map[string]interface{}
// @Failure      500  {object} map[string]interface{}
// @Router       /teams [get]
func (h *TeamHandler) ListTeams(c *gin.Context) {
	eventID, _ := strconv.ParseUint(c.Query("event_id"), 10, 32)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	teams, total, err := h.teamService.List(uint(eventID), page, limit)
	if err != nil {
		response.HandleError(c, err)
		return
	}

	response.Paginated(c, "Daftar tim berhasil diambil", teams, response.Meta{
		Page:  page,
		Limit: limit,
		Total: total,
	})
}

// CreateTeam godoc
// @Summary      Create team post
// @Description  Create a new team post for an event (student only)
// @Tags         teams
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body body object true "Team payload"
// @Success      201  {object} map[string]interface{}
// @Failure      400  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Router       /teams [post]
func (h *TeamHandler) CreateTeam(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		EventID     uint   `json:"event_id" binding:"required"`
		Title       string `json:"title" binding:"required,min=3,max=255"`
		Description string `json:"description"`
		ContactInfo string `json:"contact_info" binding:"required"`
		MaxMembers  *int   `json:"max_members"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.HandleValidationError(c, err)
		return
	}

	team := &model.Team{
		EventID:     req.EventID,
		Title:       req.Title,
		Description: req.Description,
		ContactInfo: req.ContactInfo,
		MaxMembers:  req.MaxMembers,
	}

	if err := h.teamService.Create(team, userID); err != nil {
		response.HandleError(c, err)
		return
	}

	response.Created(c, "Tim berhasil dibuat", team)
}

// JoinTeam godoc
// @Summary      Join team
// @Description  Join an existing team (student only)
// @Tags         teams
// @Produce      json
// @Security     BearerAuth
// @Param        id   path int true "Team ID"
// @Success      200  {object} map[string]interface{}
// @Failure      400  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Failure      404  {object} map[string]interface{}
// @Failure      422  {object} map[string]interface{}
// @Router       /teams/{id}/join [post]
func (h *TeamHandler) JoinTeam(c *gin.Context) {
	userID := c.GetUint("userID")

	teamID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "ID tim tidak valid")
		return
	}

	if err := h.teamService.Join(uint(teamID), userID); err != nil {
		response.HandleError(c, err)
		return
	}

	response.Success(c, "Berhasil bergabung dengan tim", nil)
}
