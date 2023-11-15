package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type errResponse struct {
	Error string `json:"error" firestore:"error"`
}

// HSTSMiddleware adds a HSTS header on every request
func HSTSMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Redirect plain HTTP requets to HTTPS. Behind the loadbalancer
		// we look at the X-header insted of request proto.
		proto := c.Request.Header.Get("X-Forwarded-Proto")
		if strings.ToLower(proto) == "http" {
			target := "https://" + c.Request.Host + c.Request.URL.Path
			c.Redirect(http.StatusTemporaryRedirect, target)
			c.Abort()
			return
		}

		// HSTS requsets are ignored by browser when served over HTTP
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
	})
}

// HTTPHandler is a http handling function
type HTTPHandler func(*gin.Context) (int, interface{}, error)

// HandledHTTPResponse reutrns a gin handler
func HandledHTTPResponse(h HTTPHandler) func(*gin.Context) {
	return func(c *gin.Context) {
		code, data, err := h(c)
		if err != nil {
			c.JSON(code, errResponse{err.Error()})
			return
		}
		if data != nil {
			c.JSON(code, data)
		}
	}
}
