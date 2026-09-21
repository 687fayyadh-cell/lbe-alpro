package service

import (
	"errors"
	"time"

	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/response"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// RegistrationService handles registration business logic.
type RegistrationService struct {
	regRepo   *repository.RegistrationRepository
	eventRepo *repository.EventRepository
	db        *gorm.DB
}

// NewRegistrationService creates a new RegistrationService.
func NewRegistrationService(regRepo *repository.RegistrationRepository, eventRepo *repository.EventRepository, db *gorm.DB) *RegistrationService {
	return &RegistrationService{
		regRepo:   regRepo,
		eventRepo: eventRepo,
		db:        db,
	}
}

// Register registers a student to an event inside a transaction.
// Checks: event exists, published, deadline not passed, quota available, no duplicate.
func (s *RegistrationService) Register(eventID, userID uint) (*model.Registration, error) {
	var result *model.Registration

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Lock the event row for update
		var event model.Event
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&event, eventID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return response.ErrNotFound
			}
			return err
		}

		// Check event is published
		if event.Status != model.EventStatusPublished {
			return response.ErrNotPublished
		}

		// Check deadline not passed
		if time.Now().After(event.Deadline) {
			return response.ErrDeadlinePassed
		}

		// Check quota available
		if event.CurrentParticipants >= event.Quota {
			return response.ErrQuotaFull
		}

		// Check duplicate registration
		var existing model.Registration
		err := tx.Where("event_id = ? AND user_id = ?", eventID, userID).First(&existing).Error
		if err == nil {
			return response.ErrAlreadyRegistered
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		// Create registration
		reg := &model.Registration{
			EventID: eventID,
			UserID:  userID,
			Status:  model.RegistrationStatusPending,
		}
		if err := tx.Create(reg).Error; err != nil {
			return err
		}

		// Increment current_participants
		if err := tx.Model(&event).Update("current_participants", event.CurrentParticipants+1).Error; err != nil {
			return err
		}

		result = reg
		return nil
	})

	if err != nil {
		return nil, err
	}
	return result, nil
}

// ListMy returns all registrations for a user.
func (s *RegistrationService) ListMy(userID uint) ([]model.Registration, error) {
	return s.regRepo.ListByUser(userID)
}

// Approve updates a registration status to approved.
func (s *RegistrationService) Approve(regID, eventID, userID uint, role model.Role) error {
	return s.updateStatus(regID, eventID, userID, role, model.RegistrationStatusApproved)
}

// Reject updates a registration status to rejected and decrements quota.
func (s *RegistrationService) Reject(regID, eventID, userID uint, role model.Role) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Find the registration
		var reg model.Registration
		if err := tx.First(&reg, regID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return response.ErrNotFound
			}
			return err
		}

		// Check it's pending
		if reg.Status != model.RegistrationStatusPending {
			return response.ErrValidation
		}

		// Check event ownership (organizer or admin)
		var event model.Event
		if err := tx.First(&event, reg.EventID).Error; err != nil {
			return err
		}
		if event.OrganizerID != userID && role != model.RoleAdmin {
			return response.ErrForbidden
		}

		// Update status
		if err := tx.Model(&reg).Update("status", model.RegistrationStatusRejected).Error; err != nil {
			return err
		}

		// Decrement current_participants
		if event.CurrentParticipants > 0 {
			if err := tx.Model(&event).Update("current_participants", event.CurrentParticipants-1).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// updateStatus is the shared logic for approve/reject.
func (s *RegistrationService) updateStatus(regID, eventID, userID uint, role model.Role, status model.RegistrationStatus) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Find the registration
		var reg model.Registration
		if err := tx.First(&reg, regID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return response.ErrNotFound
			}
			return err
		}

		// Check it's pending
		if reg.Status != model.RegistrationStatusPending {
			return response.ErrValidation
		}

		// Check event ownership
		var event model.Event
		if err := tx.First(&event, reg.EventID).Error; err != nil {
			return err
		}
		if event.OrganizerID != userID && role != model.RoleAdmin {
			return response.ErrForbidden
		}

		// Update status
		return tx.Model(&reg).Update("status", status).Error
	})
}
