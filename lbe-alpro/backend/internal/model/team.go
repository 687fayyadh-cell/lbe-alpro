package model

import "time"

// Team represents a team post for an event (Cari Tim).
type Team struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	EventID     uint      `gorm:"index;not null" json:"event_id"`
	CreatorID   uint      `gorm:"index;not null" json:"creator_id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title" binding:"required"`
	Description string    `gorm:"type:text" json:"description"`
	ContactInfo string    `gorm:"type:varchar(255);not null" json:"contact_info" binding:"required"`
	MaxMembers  *int      `json:"max_members"`
	CreatedAt   time.Time `json:"created_at"`

	// Relations
	Event   Event        `gorm:"foreignKey:EventID" json:"-"`
	Creator User         `gorm:"foreignKey:CreatorID" json:"-"`
	Members []TeamMember `gorm:"foreignKey:TeamID" json:"members,omitempty"`
}

// TeamMember represents a member of a team post.
type TeamMember struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	TeamID   uint      `gorm:"uniqueIndex:idx_team_user;not null" json:"team_id"`
	UserID   uint      `gorm:"uniqueIndex:idx_team_user;not null" json:"user_id"`
	JoinedAt time.Time `json:"joined_at"`

	// Relations
	Team Team `gorm:"foreignKey:TeamID" json:"-"`
	User User `gorm:"foreignKey:UserID" json:"-"`
}
