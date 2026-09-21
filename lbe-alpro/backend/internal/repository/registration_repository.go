package repository

import (
	"backend/internal/model"

	"gorm.io/gorm"
)

// RegistrationRepository handles database operations for registrations.
type RegistrationRepository struct {
	db *gorm.DB
}

// NewRegistrationRepository creates a new RegistrationRepository.
func NewRegistrationRepository(db *gorm.DB) *RegistrationRepository {
	return &RegistrationRepository{db: db}
}

// Create inserts a new registration record.
func (r *RegistrationRepository) Create(reg *model.Registration) error {
	return r.db.Create(reg).Error
}

// GetByEventAndUser finds a registration by event and user ID.
func (r *RegistrationRepository) GetByEventAndUser(eventID, userID uint) (*model.Registration, error) {
	var reg model.Registration
	if err := r.db.Where("event_id = ? AND user_id = ?", eventID, userID).First(&reg).Error; err != nil {
		return nil, err
	}
	return &reg, nil
}

// ListByUser returns all registrations for a user.
func (r *RegistrationRepository) ListByUser(userID uint) ([]model.Registration, error) {
	var regs []model.Registration
	if err := r.db.Where("user_id = ?", userID).Preload("Event").Order("registered_at DESC").Find(&regs).Error; err != nil {
		return nil, err
	}
	return regs, nil
}

// UpdateStatus updates a registration's status.
func (r *RegistrationRepository) UpdateStatus(reg *model.Registration, status model.RegistrationStatus) error {
	return r.db.Model(reg).Update("status", status).Error
}
