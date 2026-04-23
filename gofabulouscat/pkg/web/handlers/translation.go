package handlers

import (
	"context"
	"time"

	"github.com/CC-RMD-EpiBio/gofabulouscat/pkg/wdfab"
)

type translationHandler struct {
	TranslationMap map[wdfab.Language]*wdfab.TranslationMap
}

func NewTranslationHandler(translator map[wdfab.Language]*wdfab.TranslationMap) translationHandler {
	return translationHandler{
		TranslationMap: translator,
	}
}

type translationInput struct {
	Language wdfab.Language `json:"language"`
	Text     string         `json:"text"`
}

type translationOutput struct {
	Now     time.Time `header:"X-Now" json:"-"`
	Text    string    `json:"text"`
	Success bool      `json:"success"`
}

func (th translationHandler) PostTranslateIo(ctx context.Context, input translationInput, output *translationOutput) error {
	output.Now = time.Now().Local()
	if input.Language == wdfab.English {
		output.Text = input.Text
		output.Success = true
		return nil
	}
	lookup, ok := th.TranslationMap[input.Language].Translate(input.Text)
	output.Text = lookup
	output.Success = ok
	return nil
}
