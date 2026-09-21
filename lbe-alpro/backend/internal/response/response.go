// Package response provides standard success/error envelope helpers.
// All API responses must use these helpers to maintain a consistent
// envelope structure.
package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Meta holds pagination metadata for list responses.
type Meta struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}

// Success sends a 200 success response.
func Success(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

// Created sends a 201 success response for resource creation.
func Created(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

// NoContent sends a 204 success response (no body).
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// Paginated sends a 200 success response with pagination metadata.
func Paginated(c *gin.Context, message string, data interface{}, meta Meta) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": message,
		"data":    data,
		"meta":    meta,
	})
}

// Error sends a structured error response with the given HTTP status.
func Error(c *gin.Context, httpStatus int, code string, message string) {
	c.JSON(httpStatus, gin.H{
		"success": false,
		"error": gin.H{
			"code":    code,
			"message": message,
		},
	})
}
