package service

import (
	"errors"

	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/response"

	"gorm.io/gorm"
)

// EventService handles event business logic.
type EventService struct {
	eventRepo *repository.EventRepository
}

// NewEventService creates a new EventService.
func NewEventService(eventRepo *repository.EventRepository) *EventService {
	return &EventService{eventRepo: eventRepo}
}

// ListPublished returns published events with optional filters and pagination.
func (s *EventService) ListPublished(category, eventType, status, keyword string, page, limit int) ([]model.Event, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	return s.eventRepo.ListPublished(category, eventType, status, keyword, page, limit)
}

// GetByID returns a published event by ID.
func (s *EventService) GetByID(id uint) (*model.Event, error) {
	event, err := s.eventRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.ErrNotFound
		}
		return nil, err
	}
	return event, nil
}
