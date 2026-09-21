// Package model holds GORM entities and shared enum types.
package model

// Role represents a user role. Stored as varchar; validated at DTO level.
type Role string

const (
	RoleStudent   Role = "student"
	RoleOrganizer Role = "organizer"
	RoleAdmin     Role = "admin"
)

// Category represents a bidang pengembangan.
type Category string

const (
	CategoryMinatBakat    Category = "minat_bakat"
	CategoryKewirausahaan Category = "kewirausahaan"
	CategoryManajerial    Category = "manajerial"
	CategoryKeilmiahan    Category = "keilmiahan"
)

// EventType represents the kind of activity.
type EventType string

const (
	TypeLomba    EventType = "lomba"
	TypeBootcamp EventType = "bootcamp"
	TypeOprec    EventType = "oprec"
	TypeWorkshop EventType = "workshop"
	TypeFunmatch EventType = "funmatch"
	TypeBazar    EventType = "bazar"
	TypeRiset    EventType = "riset"
)

// EventStatus represents the moderation status of an event.
type EventStatus string

const (
	EventStatusPending   EventStatus = "pending"
	EventStatusPublished EventStatus = "published"
	EventStatusRejected  EventStatus = "rejected"
)

// RegistrationStatus represents the status of a registration.
type RegistrationStatus string

const (
	RegistrationStatusPending  RegistrationStatus = "pending"
	RegistrationStatusApproved RegistrationStatus = "approved"
	RegistrationStatusRejected RegistrationStatus = "rejected"
)
