package repository

import (
	"backend/internal/model"

	"gorm.io/gorm"
)

// TeamRepository handles database operations for teams.
type TeamRepository struct {
	db *gorm.DB
}

// NewTeamRepository creates a new TeamRepository.
func NewTeamRepository(db *gorm.DB) *TeamRepository {
	return &TeamRepository{db: db}
}

// Create inserts a new team record.
func (r *TeamRepository) Create(team *model.Team) error {
	return r.db.Create(team).Error
}

// GetByID returns a team by ID.
func (r *TeamRepository) GetByID(id uint) (*model.Team, error) {
	var team model.Team
	if err := r.db.Preload("Members.User").Preload("Creator").First(&team, id).Error; err != nil {
		return nil, err
	}
	return &team, nil
}

// List returns teams with optional event_id filter.
func (r *TeamRepository) List(eventID uint, page, limit int) ([]model.Team, int64, error) {
	var teams []model.Team
	var total int64

	query := r.db.Model(&model.Team{})
	if eventID > 0 {
		query = query.Where("event_id = ?", eventID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Preload("Creator").Offset(offset).Limit(limit).Order("created_at DESC").Find(&teams).Error; err != nil {
		return nil, 0, err
	}

	return teams, total, nil
}

// AddMember adds a user to a team.
func (r *TeamRepository) AddMember(member *model.TeamMember) error {
	return r.db.Create(member).Error
}

// IsMember checks if a user is already a member of a team.
func (r *TeamRepository) IsMember(teamID, userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&model.TeamMember{}).Where("team_id = ? AND user_id = ?", teamID, userID).Count(&count).Error
	return count > 0, err
}

// MemberCount returns the number of members in a team.
func (r *TeamRepository) MemberCount(teamID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.TeamMember{}).Where("team_id = ?", teamID).Count(&count).Error
	return count, err
}
