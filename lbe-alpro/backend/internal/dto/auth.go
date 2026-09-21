// Package dto holds request/response structs with validation tags.
package dto

// RegisterRequest is the request body for POST /auth/register.
type RegisterRequest struct {
	Name       string `json:"name" binding:"required,min=2,max=255"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=6,max=72"`
	Department string `json:"department" binding:"max=100"`
}

// LoginRequest is the request body for POST /auth/login.
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse is the response body for POST /auth/login.
type LoginResponse struct {
	Token string `json:"token"`
}

// UserResponse is the response body for user data (password hash excluded).
type UserResponse struct {
	ID         uint   `json:"id"`
	Name       string `json:"name"`
	Email      string `json:"email"`
	Role       string `json:"role"`
	Department string `json:"department"`
	Bio        string `json:"bio"`
}

// UpdateProfileRequest is the request body for PUT /users/me.
type UpdateProfileRequest struct {
	Name       string `json:"name" binding:"omitempty,min=2,max=255"`
	Department string `json:"department" binding:"omitempty,max=100"`
	Bio        string `json:"bio" binding:"max=1000"`
}
