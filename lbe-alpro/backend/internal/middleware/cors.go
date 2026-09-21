// Package middleware holds Gin middleware. G0 implements CORS only;
// AuthJWT and RequireRole arrive with BE-05.
package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORS returns a middleware that allows the configured frontend origin,
// standard JSON API methods, Authorization and Content-Type headers, and
// answers OPTIONS preflight requests with 204. The allowed origin comes
// from environment config (CORS_ORIGIN); no JWT handling happens here.
func CORS(allowOrigin string) gin.HandlerFunc {
	if allowOrigin == "" {
		allowOrigin = "http://localhost:3000"
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "" || origin == allowOrigin {
			c.Header("Access-Control-Allow-Origin", allowOrigin)
		} else {
			// Reflect nothing for unknown origins; still expose Vary so
			// caches do not poison responses across origins.
			c.Header("Access-Control-Allow-Origin", allowOrigin)
		}
		c.Header("Vary", "Origin")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
