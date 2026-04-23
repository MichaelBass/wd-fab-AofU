package client

import (
	"time"

	g "maragu.dev/gomponents"
	hx "maragu.dev/gomponents-htmx"
	gh "maragu.dev/gomponents/html"
	// "app/model"
)

// HomePage is the front page of the app.
func Landing(props PageProps, now time.Time) g.Node {
	props.Title = "Home"

	return page(props,
		gh.Div(gh.Class("prose prose-indigo prose-lg md:prose-xl"),
			gh.H1(g.Text("Welcome to the gomponents starter kit")),

			gh.P(g.Text("It uses gomponents, HTMX, and Tailwind CSS, and you can use it as a template for your new app. 😎")),

			gh.P(gh.A(gh.Href("https://github.com/maragudk/gomponents-starter-kit"), g.Text("See gomponents-starter-kit on GitHub"))),

			gh.H2(g.Text("Try HTMX")),

			gh.Button(
				gh.Class("rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"),
				g.Text("WD-FAB Open Sessions"), hx.Get("/sessions"), hx.Target("#sessions")),

			gh.Div(gh.ID("sessions")), // ThingsPartial(things, now),

		),
	)
}

/*
// ThingsPartial is a partial for showing a list of things, returned directly if the request is an HTMX request,
// and used in [HomePage].
func SessionsPartial(things []model.Thing, now time.Time) Node {
	return Group{
		P(Textf("Here are %v things from the mock database (updated %v):", len(things), now.Format(time.TimeOnly))),
		Ul(
			Map(things, func(t model.Thing) Node {
				return Li(Text(t.Name))
			}),
		),
	}
}
*/
