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

// Create creates a new event. Status is forced to pending, organizer_id from JWT.
func (s *EventService) Create(event *model.Event) error {
	event.Status = model.EventStatusPending
	return s.eventRepo.Create(event)
}

// Update updates an event (owner or admin only).
func (s *EventService) Update(id, userID uint, role model.Role, updates *model.Event) (*model.Event, error) {
	event, err := s.eventRepo.GetByIDAnyStatus(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.ErrNotFound
		}
		return nil, err
	}

	// Ownership check
	if event.OrganizerID != userID && role != model.RoleAdmin {
		return nil, response.ErrForbidden
	}

	// Apply updates
	if updates.Title != "" {
		event.Title = updates.Title
	}
	if updates.Category != "" {
		event.Category = updates.Category
	}
	if updates.Type != "" {
		event.Type = updates.Type
	}
	if updates.Description != "" {
		event.Description = updates.Description
	}
	if updates.PosterURL != "" {
		event.PosterURL = updates.PosterURL
	}
	if updates.Quota > 0 {
		event.Quota = updates.Quota
	}
	if !updates.Deadline.IsZero() {
		event.Deadline = updates.Deadline
	}
	if updates.StartDate != nil {
		event.StartDate = updates.StartDate
	}
	if updates.EndDate != nil {
		event.EndDate = updates.EndDate
	}

	if err := s.eventRepo.Update(event); err != nil {
		return nil, err
	}
	return event, nil
}

// Delete deletes an event (owner or admin only).
func (s *EventService) Delete(id, userID uint, role model.Role) error {
	event, err := s.eventRepo.GetByIDAnyStatus(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return response.ErrNotFound
		}
		return err
	}

	if event.OrganizerID != userID && role != model.RoleAdmin {
		return response.ErrForbidden
	}

	return s.eventRepo.Delete(id)
}

// ListByOrganizer returns events for a specific organizer.
func (s *EventService) ListByOrganizer(organizerID uint, page, limit int) ([]model.Event, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	return s.eventRepo.ListByOrganizer(organizerID, page, limit)
}

// ListRegistrants returns registrations for an event.
func (s *EventService) ListRegistrants(eventID, userID uint, role model.Role) ([]model.Registration, error) {
	event, err := s.eventRepo.GetByIDAnyStatus(eventID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.ErrNotFound
		}
		return nil, err
	}

	if event.OrganizerID != userID && role != model.RoleAdmin {
		return nil, response.ErrForbidden
	}

	return s.eventRepo.ListRegistrants(eventID)
}
