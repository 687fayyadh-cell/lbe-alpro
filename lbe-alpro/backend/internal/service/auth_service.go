package service

import (
	"errors"
	"time"

	"backend/internal/dto"
	"backend/internal/model"
	"backend/internal/repository"
	"backend/internal/response"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthService handles authentication business logic.
type AuthService struct {
	userRepo    *repository.UserRepository
	jwtSecret   []byte
	jwtExpHours int
}

// NewAuthService creates a new AuthService.
func NewAuthService(userRepo *repository.UserRepository, jwtSecret string, jwtExpHours int) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		jwtSecret:   []byte(jwtSecret),
		jwtExpHours: jwtExpHours,
	}
}

// Register creates a new student account. Role is always forced to student.
func (s *AuthService) Register(req dto.RegisterRequest) (*model.User, error) {
	existing, err := s.userRepo.GetByEmail(req.Email)
	if err == nil && existing != nil {
		return nil, response.ErrEmailTaken
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hash),
		Role:         model.RoleStudent,
		Department:   req.Department,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}
	return user, nil
}

// Login authenticates a user and returns a JWT token.
func (s *AuthService) Login(req dto.LoginRequest) (string, error) {
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", response.ErrInvalidCredentials
		}
		return "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return "", response.ErrInvalidCredentials
	}

	token, err := s.generateToken(user)
	if err != nil {
		return "", err
	}
	return token, nil
}

// GetMe returns the current user's profile data.
func (s *AuthService) GetMe(userID uint) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.ErrNotFound
		}
		return nil, err
	}
	return &dto.UserResponse{
		ID:         user.ID,
		Name:       user.Name,
		Email:      user.Email,
		Role:       string(user.Role),
		Department: user.Department,
		Bio:        user.Bio,
	}, nil
}

// UpdateMe updates the current user's profile.
func (s *AuthService) UpdateMe(userID uint, req dto.UpdateProfileRequest) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, response.ErrNotFound
		}
		return nil, err
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Department != "" {
		user.Department = req.Department
	}
	if req.Bio != "" {
		user.Bio = req.Bio
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}
	return &dto.UserResponse{
		ID:         user.ID,
		Name:       user.Name,
		Email:      user.Email,
		Role:       string(user.Role),
		Department: user.Department,
		Bio:        user.Bio,
	}, nil
}

// generateToken creates a JWT with user ID, role, and expiry.
func (s *AuthService) generateToken(user *model.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    string(user.Role),
		"exp":     time.Now().Add(time.Duration(s.jwtExpHours) * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}
