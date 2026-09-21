package middleware

import (
	"net/http"
	"strings"

	"backend/internal/model"
	"backend/internal/response"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims represents the claims in our JWT tokens.
type JWTClaims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// AuthJWT is middleware that validates a Bearer token and sets
// userID and role in the Gin context. Returns 401 if missing/invalid.
func AuthJWT(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", response.Messages["UNAUTHORIZED"])
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", response.Messages["UNAUTHORIZED"])
			c.Abort()
			return
		}

		tokenStr := parts[1]
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})
		if err != nil || !token.Valid {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", response.Messages["UNAUTHORIZED"])
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", response.Messages["UNAUTHORIZED"])
			c.Abort()
			return
		}

		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", response.Messages["UNAUTHORIZED"])
			c.Abort()
			return
		}

		roleStr, ok := claims["role"].(string)
		if !ok {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", response.Messages["UNAUTHORIZED"])
			c.Abort()
			return
		}

		c.Set("userID", uint(userIDFloat))
		c.Set("role", model.Role(roleStr))
		c.Next()
	}
}

// RequireRole is middleware that checks if the user has one of the
// allowed roles. Must be used after AuthJWT. Returns 403 if not allowed.
func RequireRole(allowed ...model.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			response.Error(c, http.StatusForbidden, "FORBIDDEN", response.Messages["FORBIDDEN"])
			c.Abort()
			return
		}

		role, ok := roleVal.(model.Role)
		if !ok {
			response.Error(c, http.StatusForbidden, "FORBIDDEN", response.Messages["FORBIDDEN"])
			c.Abort()
			return
		}

		for _, a := range allowed {
			if role == a {
				c.Next()
				return
			}
		}

		response.Error(c, http.StatusForbidden, "FORBIDDEN", response.Messages["FORBIDDEN"])
		c.Abort()
	}
}
