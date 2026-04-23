package client

import (
	"crypto/sha256"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"

	g "maragu.dev/gomponents"
	gc "maragu.dev/gomponents/components"
	gh "maragu.dev/gomponents/html"
)

var hashOnce sync.Once

// var appCSSPath, appJSPath, htmxJSPath string

// PageProps are properties for the [page] component.
type PageProps struct {
	Title       string
	Description string
}

// page layout with header, footer, and container to restrict width and set base padding.
func page(props PageProps, children ...g.Node) g.Node {
	// Hash the paths for easy cache busting on changes
	hashOnce.Do(func() {
		// appCSSPath = getHashedPath("public/styles/app.css")
		// htmxJSPath = getHashedPath("public/scripts/htmx.js")
		// appJSPath = getHashedPath("public/scripts/app.js")
	})
	log.Println("test out")

	return gc.HTML5(gc.HTML5Props{
		Title:       props.Title,
		Description: props.Description,
		Language:    "en",
		Head: []g.Node{
			g.Raw(`<span class="logo"><img src="logo.png"></span>`),
		},
		Body: []g.Node{gh.Class("bg-indigo-600 text-gray-900"),
			gh.Div(gh.Class("min-h-screen flex flex-col justify-between bg-white"),
				header(),
				gh.Div(gh.Class("grow"),
					container(true, true,
						g.Group(children),
					),
				),
				footer(),
			),
		},
	})
}

// header bar with logo and navigation.
func header() g.Node {
	return gh.Div(gh.Class("bg-indigo-600 text-white shadow"),
		container(true, false,
			gh.Div(gh.Class("h-16 flex items-center justify-between"),
				gh.A(gh.Href("/"), gh.Class("inline-flex items-center text-xl font-semibold"),
					gh.Img(gh.Src("/images/logo.png"), gh.Alt("Logo"), gh.Class("h-12 w-auto bg-white rounded-full mr-4")),
					g.Text("Home"),
				),
			),
		),
	)
}

// container restricts the width and sets padding.
func container(padX, padY bool, children ...g.Node) g.Node {
	return gh.Div(
		gc.Classes{
			"max-w-7xl mx-auto":     true,
			"px-4 md:px-8 lg:px-16": padX,
			"py-4 md:py-8":          padY,
		},
		g.Group(children),
	)
}

// footer with a link to the gomponents website.
func footer() g.Node {
	return gh.Div(gh.Class("bg-indigo-600 text-white"),
		container(true, false,
			gh.Div(gh.Class("h-16 flex items-center justify-center"),
				gh.A(gh.Href("https://www.gomponents.com"), g.Text("www.gomponents.com")),
			),
		),
	)
}

func GetHashedPath(path string) string {
	externalPath := strings.TrimPrefix(path, "public")
	ext := filepath.Ext(path)
	if ext == "" {
		panic("no extension found")
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Sprintf("%v.x%v", strings.TrimSuffix(externalPath, ext), ext)
	}

	return fmt.Sprintf("%v.%x%v", strings.TrimSuffix(externalPath, ext), sha256.Sum256(data), ext)
}
