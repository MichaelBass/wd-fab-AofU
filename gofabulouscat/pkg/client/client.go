package client

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"time"

	conf "github.com/CC-RMD-EpiBio/gofabulouscat/config"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	g "maragu.dev/gomponents"
	ghttp "maragu.dev/gomponents/http"
	"maragu.dev/httph"
)

type Client struct {
	mux     chi.Router
	server  *http.Server
	config  conf.Config
	Context context.Context
	log     *slog.Logger
}

func NewClient(config *conf.Config, ctx context.Context) *Client {
	// sessionManager.Lifetime = 48 * time.Hour
	mux := chi.NewMux()

	app := &Client{
		config:  *config,
		Context: ctx,
		mux:     mux,
		server: &http.Server{
			Addr:              ":8080",
			Handler:           mux,
			ReadTimeout:       5 * time.Second,
			ReadHeaderTimeout: 5 * time.Second,
			WriteTimeout:      5 * time.Second,
			IdleTimeout:       5 * time.Second,
		},
		log: slog.New(slog.NewTextHandler(os.Stderr, nil)),
	}

	return app
}
func (c *Client) Start() error {

	c.setupRoutes()

	if err := c.server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil

}

// Stop the server gracefully.
func (c *Client) Stop() error {
	c.log.Info("Stopping http server")

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	if err := c.server.Shutdown(ctx); err != nil {
		return err
	}
	c.log.Info("Stopped http server")
	return nil
}

// setupRoutes for the server.
func (c *Client) setupRoutes() {
	c.mux.Group(func(r chi.Router) {
		r.Use(middleware.Compress(5))
		r.Use(middleware.Logger)

		// Sets up a static file handler with cache busting middleware.
		r.Group(func(r chi.Router) {
			r.Use(httph.VersionedAssets)

			Static(r)
		})

		Home(r)
	})
}

func Static(r chi.Router) {
	staticHandler := http.FileServer(http.Dir("public"))
	r.Get(`/{:[^.]+\.[^.]+}`, staticHandler.ServeHTTP)
	r.Get(`/{:images|scripts|styles}/*`, staticHandler.ServeHTTP)
}

// Home handler for the home page, as well as HTMX partial for getting things.
func Home(r chi.Router) {
	r.Get("/", ghttp.Adapt(func(w http.ResponseWriter, r *http.Request) (g.Node, error) {
		return Landing(PageProps{}, time.Now()), nil
	}))
}
