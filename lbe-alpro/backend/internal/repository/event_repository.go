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
