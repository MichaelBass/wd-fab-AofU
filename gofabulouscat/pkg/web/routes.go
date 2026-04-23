package web

import (
	"io"
	"log"
	"net/http"

	"github.com/CC-RMD-EpiBio/gofabulouscat/pkg/web/handlers"
	static "github.com/CC-RMD-EpiBio/gofabulouscat/static"
	"github.com/CC-RMD-EpiBio/gofabulouscat/versions"
	swgui "github.com/swaggest/swgui/v5emb"
	"github.com/swaggest/usecase"
	"github.com/swaggest/usecase/status"
)

func (a *App) loadRoutes() {

	sh := handlers.NewSessionHandler(a.Context, a.db, a.Models, a.config.Cat, "")

	// New Session
	newSessionUseCase := usecase.NewInteractor(sh.NewSessionHandlerIo)
	newSessionUseCase.SetTitle("New Session")
	newSessionUseCase.SetExpectedErrors(status.InvalidArgument)
	a.Service.Post("/", newSessionUseCase)

	a.Service.Router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/docs", http.StatusSeeOther)
	})

	// Deactivate Session
	deleteSessionUseCase := usecase.NewInteractor(sh.DeleteSessionIo)
	deleteSessionUseCase.SetTitle("Delete Session")
	deleteSessionUseCase.SetExpectedErrors(status.InvalidArgument)
	a.Service.Delete("/{session_id}", deleteSessionUseCase)

	// Get Session
	getSessionUseCase := usecase.NewInteractor(sh.GetSessionSummaryIo)
	getSessionUseCase.SetTitle("Get Session Data")
	getSessionUseCase.SetExpectedErrors(status.InvalidArgument)
	a.Service.Get("/{session_id}", getSessionUseCase)

	// Get Session(S)
	getSessionsUseCase := usecase.NewInteractor(sh.GetSessionListIo)
	getSessionsUseCase.SetTitle("Get Session List")
	getSessionsUseCase.SetExpectedErrors(status.InvalidArgument)
	a.Service.Get("/sessions", getSessionsUseCase)

	ch := handlers.NewCatHandlerHelper(a.db, a.Models, &a.Context, a.Translations)
	// Get Session/scale item
	getSessionScaleDomainItemUseCase := usecase.NewInteractor(ch.NextScaleItemIo)
	getSessionScaleDomainItemUseCase.SetTitle("Get next item for scale/session")
	getSessionScaleDomainItemUseCase.SetExpectedErrors(status.InvalidArgument)
	a.Service.Get("/{session_id}/{scale}/item", getSessionScaleDomainItemUseCase)

	postResponseUseCase := usecase.NewInteractor(ch.PostResponseIo)
	postResponseUseCase.SetTitle("Post response to item")
	postResponseUseCase.SetExpectedErrors(status.InvalidArgument)
	a.Service.Post("/{session_id}/response", postResponseUseCase)

	th := handlers.NewTranslationHandler(a.Translations)
	postTranslationUseCase := usecase.NewInteractor(th.PostTranslateIo)
	postTranslationUseCase.SetTitle("Lookup translation for a given text")
	postTranslationUseCase.SetExpectedErrors(status.InvalidArgument)
	a.Service.Post("/translate", postTranslationUseCase)

	// API
	a.Service.Router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/docs", http.StatusSeeOther)
	})

	favicon := static.Favicon
	a.Service.Router.Get("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		f, err := favicon.Open("NIH_2013_logo_vertical.svg")

		if err != nil {
			http.Error(w, "Favicon not found", http.StatusNotFound)
			log.Println("Error opening favicon:", err) // Log the error
			return
		}
		defer f.Close()

		// Set the correct Content-Type. Important for browsers to recognize it.
		w.Header().Set("Content-Type", "image/x-icon")

		// Copy the favicon content to the response.
		_, err = io.Copy(w, f)
		if err != nil {
			http.Error(w, "Error serving favicon", http.StatusInternalServerError)
			log.Println("Error serving favicon:", err) // Log the error
			return
		}
	})

	a.Service.Router.Method(http.MethodGet, "/Spanish.csv", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		data, err := versions.Spanish.ReadFile("wdfab_final_spa.csv")
		if err != nil {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "text/csv")
		w.Header().Set("Content-Disposition", "inline; filename=\"Spanish.csv\"")
		w.Write(data)
	}))

	a.Service.Docs("/docs", swgui.New)

}
