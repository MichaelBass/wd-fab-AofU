package cmd

import (
	"context"
	"log"
	"os"
	"os/signal"

	conf "github.com/CC-RMD-EpiBio/gofabulouscat/config"
	"github.com/CC-RMD-EpiBio/gofabulouscat/pkg/client"
	web "github.com/CC-RMD-EpiBio/gofabulouscat/pkg/web"
)

func launchCat() error {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	app := web.New(conf.GetConfig(), ctx)
	err := app.Start(ctx)
	defer cancel()

	return err
}

func launchCatClient() error {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)

	client := client.NewClient(conf.GetConfig(), ctx)
	err := client.Start()
	if err != nil {
		log.Println(err)
		return err
	}
	defer cancel()

	err = launchCat()
	if err != nil {
		log.Println(err)
		return err
	}
	defer cancel()

	return err
}
