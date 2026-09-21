package repository

import (
	"backend/internal/model"

	"gorm.io/gorm"
)

// UserRepository handles database operations for users.
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new UserRepository.
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// GetByID finds a user by ID. Returns nil if not found.
func (r *UserRepository) GetByID(id uint) (*model.User, error) {
	var user model.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByEmail finds a user by email. Returns nil if not found.
func (r *UserRepository) GetByEmail(email string) (*model.User, error) {
	var user model.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// Create inserts a new user record.
func (r *UserRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

// Update updates a user record.
func (r *UserRepository) Update(user *model.User) error {
	return r.db.Save(user).Error
}
