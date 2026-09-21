package repository

import (
	"time"

	"backend/internal/model"

	"gorm.io/gorm"
)

// EventRepository handles database operations for events.
type EventRepository struct {
	db *gorm.DB
}

// NewEventRepository creates a new EventRepository.
func NewEventRepository(db *gorm.DB) *EventRepository {
	return &EventRepository{db: db}
}

// ListPublished returns published events with optional filters and pagination.
func (r *EventRepository) ListPublished(category, eventType, status, keyword string, page, limit int) ([]model.Event, int64, error) {
	var events []model.Event
	var total int64

	query := r.db.Model(&model.Event{}).Where("status = ?", model.EventStatusPublished)

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if eventType != "" {
		query = query.Where("type = ?", eventType)
	}
	if status == "open" {
		query = query.Where("deadline >= ? AND current_participants < quota", time.Now())
	} else if status == "closed" {
		query = query.Where("deadline < ? OR current_participants >= quota", time.Now())
	}
	if keyword != "" {
		query = query.Where("(title ILIKE ? OR description ILIKE ?)", "%"+keyword+"%", "%"+keyword+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&events).Error; err != nil {
		return nil, 0, err
	}

	return events, total, nil
}

// GetByID returns a published event by ID.
func (r *EventRepository) GetByID(id uint) (*model.Event, error) {
	var event model.Event
	if err := r.db.Where("id = ? AND status = ?", id, model.EventStatusPublished).First(&event).Error; err != nil {
		return nil, err
	}
	return &event, nil
}

// GetByIDAnyStatus returns an event by ID regardless of status (for organizer/admin).
func (r *EventRepository) GetByIDAnyStatus(id uint) (*model.Event, error) {
	var event model.Event
	if err := r.db.First(&event, id).Error; err != nil {
		return nil, err
	}
	return &event, nil
}

// Create inserts a new event.
func (r *EventRepository) Create(event *model.Event) error {
	return r.db.Create(event).Error
}

// Update updates an event.
func (r *EventRepository) Update(event *model.Event) error {
	return r.db.Save(event).Error
}

// Delete deletes an event by ID.
func (r *EventRepository) Delete(id uint) error {
	return r.db.Delete(&model.Event{}, id).Error
}

// ListByOrganizer returns events for a specific organizer.
func (r *EventRepository) ListByOrganizer(organizerID uint, page, limit int) ([]model.Event, int64, error) {
	var events []model.Event
	var total int64

	query := r.db.Model(&model.Event{}).Where("organizer_id = ?", organizerID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&events).Error; err != nil {
		return nil, 0, err
	}

	return events, total, nil
}

// ListRegistrants returns registrations for an event.
func (r *EventRepository) ListRegistrants(eventID uint) ([]model.Registration, error) {
	var regs []model.Registration
	if err := r.db.Where("event_id = ?", eventID).Preload("User").Order("registered_at DESC").Find(&regs).Error; err != nil {
		return nil, err
	}
	return regs, nil
}
