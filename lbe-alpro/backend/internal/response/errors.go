package response

import (
	"errors"
	"net/http"

	"backend/internal/model"

	"github.com/gin-gonic/gin"
)

// Sentinel domain errors returned by services. Handlers map these to
// HTTP status + error code in one place.
var (
	ErrValidation         = errors.New("VALIDATION_ERROR")
	ErrUnauthorized       = errors.New("UNAUTHORIZED")
	ErrForbidden          = errors.New("FORBIDDEN")
	ErrNotFound           = errors.New("NOT_FOUND")
	ErrEmailTaken         = errors.New("EMAIL_TAKEN")
	ErrAlreadyRegistered  = errors.New("ALREADY_REGISTERED")
	ErrQuotaFull          = errors.New("EVENT_QUOTA_FULL")
	ErrDeadlinePassed     = errors.New("EVENT_DEADLINE_PASSED")
	ErrNotPublished       = errors.New("EVENT_NOT_PUBLISHED")
	ErrInternal           = errors.New("INTERNAL_ERROR")
	ErrInvalidCredentials = errors.New("INVALID_CREDENTIALS")
)

// Messages maps error codes to Bahasa Indonesia user-facing messages.
var Messages = map[string]string{
	"VALIDATION_ERROR":      "Data yang dikirim tidak valid.",
	"UNAUTHORIZED":          "Anda belum login atau token tidak valid.",
	"FORBIDDEN":             "Anda tidak memiliki akses ke sumber daya ini.",
	"NOT_FOUND":             "Sumber daya yang dicari tidak ditemukan.",
	"EMAIL_TAKEN":           "Email sudah digunakan oleh akun lain.",
	"ALREADY_REGISTERED":    "Anda sudah terdaftar di event ini.",
	"EVENT_QUOTA_FULL":      "Maaf, kuota pendaftaran untuk event ini sudah penuh.",
	"EVENT_DEADLINE_PASSED": "Batas waktu pendaftaran event ini sudah berakhir.",
	"EVENT_NOT_PUBLISHED":   "Event ini belum dipublikasikan.",
	"INTERNAL_ERROR":        "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
	"INVALID_CREDENTIALS":   "Email atau password salah.",
}

// HandleError maps a domain error to the correct HTTP response.
// Use this in handlers to keep error mapping in one place.
func HandleError(c *gin.Context, err error) {
	var httpStatus int
	var code string

	switch {
	case errors.Is(err, ErrValidation):
		httpStatus, code = http.StatusBadRequest, "VALIDATION_ERROR"
	case errors.Is(err, ErrUnauthorized), errors.Is(err, ErrInvalidCredentials):
		httpStatus, code = http.StatusUnauthorized, "UNAUTHORIZED"
	case errors.Is(err, ErrForbidden):
		httpStatus, code = http.StatusForbidden, "FORBIDDEN"
	case errors.Is(err, ErrNotFound):
		httpStatus, code = http.StatusNotFound, "NOT_FOUND"
	case errors.Is(err, ErrEmailTaken):
		httpStatus, code = http.StatusConflict, "EMAIL_TAKEN"
	case errors.Is(err, ErrAlreadyRegistered):
		httpStatus, code = http.StatusConflict, "ALREADY_REGISTERED"
	case errors.Is(err, ErrQuotaFull):
		httpStatus, code = http.StatusUnprocessableEntity, "EVENT_QUOTA_FULL"
	case errors.Is(err, ErrDeadlinePassed):
		httpStatus, code = http.StatusUnprocessableEntity, "EVENT_DEADLINE_PASSED"
	case errors.Is(err, ErrNotPublished):
		httpStatus, code = http.StatusUnprocessableEntity, "EVENT_NOT_PUBLISHED"
	default:
		httpStatus, code = http.StatusInternalServerError, "INTERNAL_ERROR"
	}

	Error(c, httpStatus, code, Messages[code])
}

// HandleValidationError sends a 400 validation error with field details.
func HandleValidationError(c *gin.Context, err error) {
	Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
}

// RequireRole checks the user's role against allowed roles.
// Returns true and sends 403 if not allowed.
func RequireRole(c *gin.Context, userRole model.Role, allowed ...model.Role) bool {
	for _, r := range allowed {
		if userRole == r {
			return true
		}
	}
	Error(c, http.StatusForbidden, "FORBIDDEN", Messages["FORBIDDEN"])
	return false
}
