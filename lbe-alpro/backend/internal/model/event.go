package model

import "time"

// Event represents a campus event.
type Event struct {
	ID                  uint        `gorm:"primaryKey" json:"id"`
	OrganizerID         uint        `gorm:"index;not null" json:"organizer_id"`
	Title               string      `gorm:"type:varchar(255);not null" json:"title" binding:"required"`
	Category            Category    `gorm:"type:varchar(50);index;not null" json:"category" binding:"required"`
	Type                EventType   `gorm:"type:varchar(50);index;not null" json:"type" binding:"required"`
	Description         string      `gorm:"type:text;not null" json:"description" binding:"required"`
	PosterURL           string      `gorm:"type:varchar(500)" json:"poster_url"`
	Quota               int         `gorm:"not null" json:"quota" binding:"required,min=1"`
	CurrentParticipants int         `gorm:"not null;default:0" json:"current_participants"`
	Deadline            time.Time   `gorm:"not null" json:"deadline" binding:"required"`
	StartDate           *time.Time  `json:"start_date"`
	EndDate             *time.Time  `json:"end_date"`
	Status              EventStatus `gorm:"type:varchar(20);index;not null;default:pending" json:"status"`
	CreatedAt           time.Time   `json:"created_at"`
	UpdatedAt           time.Time   `json:"updated_at"`

	// Relations
	Organizer     User           `gorm:"foreignKey:OrganizerID" json:"-"`
	Registrations []Registration `gorm:"foreignKey:EventID" json:"-"`
	Teams         []Team         `gorm:"foreignKey:EventID" json:"-"`
}
