package model

import "time"

// User represents a platform user (student, organizer, or admin).
type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"type:varchar(255);not null" json:"name" binding:"required"`
	Email        string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email" binding:"required,email"`
	PasswordHash string    `gorm:"type:varchar(255);not null" json:"-"`
	Role         Role      `gorm:"type:varchar(20);not null;default:student" json:"role"`
	Department   string    `gorm:"type:varchar(100)" json:"department"`
	Bio          string    `gorm:"type:text" json:"bio"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
