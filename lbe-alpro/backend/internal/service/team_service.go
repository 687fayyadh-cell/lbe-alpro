package service

import (
	"errors"

	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/response"

	"gorm.io/gorm"
)

// TeamService handles team business logic.
type TeamService struct {
	teamRepo *repository.TeamRepository
	db       *gorm.DB
}

// NewTeamService creates a new TeamService.
func NewTeamService(teamRepo *repository.TeamRepository, db *gorm.DB) *TeamService {
	return &TeamService{teamRepo: teamRepo, db: db}
}

// List returns teams with optional event_id filter.
func (s *TeamService) List(eventID uint, page, limit int) ([]model.Team, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	return s.teamRepo.List(eventID, page, limit)
}

// Create creates a new team post. The creator is automatically added as a member.
func (s *TeamService) Create(team *model.Team, userID uint) error {
	team.CreatorID = userID
	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(team).Error; err != nil {
			return err
		}
		member := &model.TeamMember{
			TeamID: team.ID,
			UserID: userID,
		}
		return tx.Create(member).Error
	})
}

// Join adds a user to a team. Checks: not creator, not already member, max_members not reached.
func (s *TeamService) Join(teamID, userID uint) error {
	team, err := s.teamRepo.GetByID(teamID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return response.ErrNotFound
		}
		return err
	}

	// Can't join own team
	if team.CreatorID == userID {
		return response.ErrValidation
	}

	// Check if already member
	isMember, err := s.teamRepo.IsMember(teamID, userID)
	if err != nil {
		return err
	}
	if isMember {
		return response.ErrValidation
	}

	// Check max_members
	if team.MaxMembers != nil {
		count, err := s.teamRepo.MemberCount(teamID)
		if err != nil {
			return err
		}
		if int(count) >= *team.MaxMembers {
			return response.ErrQuotaFull
		}
	}

	member := &model.TeamMember{
		TeamID: teamID,
		UserID: userID,
	}
	return s.teamRepo.AddMember(member)
}
