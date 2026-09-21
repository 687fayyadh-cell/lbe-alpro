package service

import (
	"errors"

	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/response"

	"gorm.io/gorm"
)

// AdminService handles admin business logic.
type AdminService struct {
	eventRepo *repository.EventRepository
	userRepo  *repository.UserRepository
	db        *gorm.DB
}

// NewAdminService creates a new AdminService.
func NewAdminService(eventRepo *repository.EventRepository, userRepo *repository.UserRepository, db *gorm.DB) *AdminService {
	return &AdminService{
		eventRepo: eventRepo,
		userRepo:  userRepo,
		db:        db,
	}
}

// ListPendingEvents returns events with pending status.
func (s *AdminService) ListPendingEvents(page, limit int) ([]model.Event, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	return s.eventRepo.ListByStatus(model.EventStatusPending, page, limit)
}

// UpdateEventStatus updates an event's status (published/rejected).
func (s *AdminService) UpdateEventStatus(eventID uint, status model.EventStatus) error {
	event, err := s.eventRepo.GetByIDAnyStatus(eventID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return response.ErrNotFound
		}
		return err
	}

	event.Status = status
	return s.eventRepo.Update(event)
}

// ListUsers returns all users.
func (s *AdminService) ListUsers(page, limit int) ([]model.User, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	return s.userRepo.List(page, limit)
}

// UpdateUserRole updates a user's role.
func (s *AdminService) UpdateUserRole(userID uint, role model.Role) error {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return response.ErrNotFound
		}
		return err
	}

	user.Role = role
	return s.userRepo.Update(user)
}
