package web

import (
	"log"
	"net/http"
	"time"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		startTime := time.Now()

		// Log request details *before* passing to the next handler
		log.Printf("[%s] %s %s", r.Method, r.URL.Path, r.RemoteAddr)

		// Call the next handler in the chain
		next.ServeHTTP(w, r)

		// Log response time *after* the handler has finished
		duration := time.Since(startTime)
		log.Printf("Completed in %v", duration)
	})
}
