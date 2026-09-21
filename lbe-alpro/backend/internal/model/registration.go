package model

import (
	"time"

	"gorm.io/gorm"
)

// Registration represents a student's registration to an event.
type Registration struct {
	ID            uint               `gorm:"primaryKey" json:"id"`
	EventID       uint               `gorm:"uniqueIndex:idx_event_user;not null" json:"event_id"`
	UserID        uint               `gorm:"uniqueIndex:idx_event_user;not null" json:"user_id"`
	Answer        string             `gorm:"type:text" json:"answer"`
	AttachmentURL string             `gorm:"type:varchar(500)" json:"attachment_url"`
	Status        RegistrationStatus `gorm:"type:varchar(20);not null;default:pending" json:"status"`
	RegisteredAt  time.Time          `json:"registered_at"`
	CreatedAt     time.Time          `json:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at"`

	// Relations
	Event Event `gorm:"foreignKey:EventID" json:"-"`
	User  User  `gorm:"foreignKey:UserID" json:"-"`
}

// BeforeCreate sets RegisteredAt if not set.
func (r *Registration) BeforeCreate(tx *gorm.DB) error {
	if r.RegisteredAt.IsZero() {
		r.RegisteredAt = time.Now()
	}
	return nil
}
