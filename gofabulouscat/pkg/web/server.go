/*
###############################################################################
#
#                           COPYRIGHT NOTICE
#                  Mark O. Hatfield Clinical Research Center
#                       National Institutes of Health
#            United States Department of Health and Human Services
#
# This software was developed and is owned by the National Institutes of
# Health Clinical Center (NIHCC), an agency of the United States Department
# of Health and Human Services, which is making the software available to the
# public for any commercial or non-commercial purpose under the following
# open-source BSD license.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# (1) Redistributions of source code must retain this copyright
# notice, this list of conditions and the following disclaimer.
#
# (2) Redistributions in binary form must reproduce this copyright
# notice, this list of conditions and the following disclaimer in the
# documentation and/or other materials provided with the distribution.
#
# (3) Neither the names of the National Institutes of Health Clinical
# Center, the National Institutes of Health, the U.S. Department of
# Health and Human Services, nor the names of any of the software
# developers may be used to endorse or promote products derived from
# this software without specific prior written permission.
#
# (4) Please acknowledge NIHCC as the source of this software by including
# the phrase "Courtesy of the U.S. National Institutes of Health Clinical
# Center"or "Source: U.S. National Institutes of Health Clinical Center."
#
# THIS SOFTWARE IS PROVIDED BY THE U.S. GOVERNMENT AND CONTRIBUTORS "AS
# IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
# TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
# PARTICULAR PURPOSE ARE DISCLAIMED.
#
# You are under no obligation whatsoever to provide any bug fixes,
# patches, or upgrades to the features, functionality or performance of
# the source code ("Enhancements") to anyone; however, if you choose to
# make your Enhancements available either publicly, or directly to
# the National Institutes of Health Clinical Center, without imposing a
# separate written license agreement for such Enhancements, then you hereby
# grant the following license: a non-exclusive, royalty-free perpetual license
# to install, use, modify, prepare derivative works, incorporate into
# other computer software, distribute, and sublicense such Enhancements or
# derivative works thereof, in binary and source code form.
#
###############################################################################
*/

package web

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"
	"crypto/tls"
	"crypto/x509"
	"os"

	conf "github.com/CC-RMD-EpiBio/gofabulouscat/config"
	wdfab "github.com/CC-RMD-EpiBio/gofabulouscat/pkg/wdfab"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"

	"github.com/CC-RMD-EpiBio/gofabulouscat/internal"
	badger "github.com/dgraph-io/badger/v4"
	"github.com/swaggest/openapi-go/openapi31"
	"github.com/swaggest/rest/openapi"
	"github.com/swaggest/rest/response"
	"github.com/swaggest/rest/response/gzip"
	"github.com/swaggest/rest/web"
)

// var sessionManager *scs.SessionManager

type App struct {
	Service      *web.Service
	db           *badger.DB
	config       conf.Config
	Models       wdfab.WdFabIrtModels
	ApiSchema    *openapi.Collector
	Context      context.Context
	Translations map[wdfab.Language]*wdfab.TranslationMap
}

func New(config *conf.Config, ctx context.Context) *App {
	// sessionManager.Lifetime = 48 * time.Hour

	db, err := badger.Open(badger.DefaultOptions("").WithInMemory(true))
	if err != nil {
		log.Println(err)
	}

	app := &App{
		Service:   web.NewService(openapi31.NewReflector()),
		config:    *config,
		db:        db,
		ApiSchema: &openapi.Collector{},
		Models:    wdfab.Load(config),
	}
	es, err := wdfab.LoadTranslations()

	if err == nil {
		app.Translations = es
	} else {
		fmt.Printf("err: %v\n", err)
	}

	app.Service.OpenAPISchema().SetTitle("NIH Go WD-FAB")
	app.Service.OpenAPISchema().SetDescription(internal.Description)
	app.Service.OpenAPISchema().SetVersion(internal.Version)

	app.Service.Use(
		middleware.Recoverer, // Panic recovery.
		middleware.StripSlashes,
		response.EncoderMiddleware, // Response encoder setup.
		gzip.Middleware,
		middleware.Logger,
		cors.AllowAll().Handler, // "github.com/rs/cors", 3rd-party CORS middleware can also be configured here.
	)
	app.loadRoutes()

	return app
}

func (a *App) Start(ctx context.Context) error {



    cer, err_cert := tls.LoadX509KeyPair("/etc/ssl/certs/ssl-cert.crt", "/etc/ssl/certs/ssl-cert.key")
	if err_cert != nil {
		log.Println(err_cert)
	}

	// Load CA certificate for server verification.
	caCert, errCA := os.ReadFile("/etc/ssl/certs/ssl-cert-bundle.crt")
	if errCA != nil {
		log.Println(errCA)
	}


	caCertPool := x509.NewCertPool()
	if !caCertPool.AppendCertsFromPEM(caCert) {
		log.Println("Error appending Cert")
	}
	
    cfg := &tls.Config{
    	Certificates: []tls.Certificate{cer},
		RootCAs:      caCertPool,
		MinVersion:   tls.VersionTLS12,
    }







	server := &http.Server{

		Addr: ":" + a.config.Server.InternalPort,

		Handler: a.Service,

		TLSConfig: cfg,
	}

	log.Println("Starting backend server at " + server.Addr)

	var err error
	ch := make(chan error, 1)

	go func() {
		//err = server.ListenAndServe()
		err = server.ListenAndServeTLS("/etc/ssl/certs/ssl-cert.crt", "/etc/ssl/certs/ssl-cert.key")
		if err != nil {
			ch <- fmt.Errorf("failed to start server: %w", err)
		}
		close(ch)
	}()

	select {
	case err = <-ch:
		return err
	case <-ctx.Done():
		timeout, cancel := context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()
		defer a.db.Close()
		return server.Shutdown(timeout)
	}

}
