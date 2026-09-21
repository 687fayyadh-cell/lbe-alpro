package dto

// CreateEventRequest is the request body for POST /events.
type CreateEventRequest struct {
	Title       string `json:"title" binding:"required,min=3,max=255"`
	Category    string `json:"category" binding:"required,oneof=minat_bakat kewirausahaan manajerial keilmiahan"`
	Type        string `json:"type" binding:"required,oneof=lomba bootcamp oprec workshop funmatch bazar riset"`
	Description string `json:"description" binding:"required,min=10"`
	PosterURL   string `json:"poster_url" binding:"omitempty,url"`
	Quota       int    `json:"quota" binding:"required,min=1"`
	Deadline    string `json:"deadline" binding:"required"`
	StartDate   string `json:"start_date" binding:"omitempty"`
	EndDate     string `json:"end_date" binding:"omitempty"`
}

// UpdateEventRequest is the request body for PUT /events/:id.
type UpdateEventRequest struct {
	Title       string `json:"title" binding:"omitempty,min=3,max=255"`
	Category    string `json:"category" binding:"omitempty,oneof=minat_bakat kewirausahaan manajerial keilmiahan"`
	Type        string `json:"type" binding:"omitempty,oneof=lomba bootcamp oprec workshop funmatch bazar riset"`
	Description string `json:"description" binding:"omitempty,min=10"`
	PosterURL   string `json:"poster_url" binding:"omitempty,url"`
	Quota       int    `json:"quota" binding:"omitempty,min=1"`
	Deadline    string `json:"deadline" binding:"omitempty"`
	StartDate   string `json:"start_date" binding:"omitempty"`
	EndDate     string `json:"end_date" binding:"omitempty"`
}
