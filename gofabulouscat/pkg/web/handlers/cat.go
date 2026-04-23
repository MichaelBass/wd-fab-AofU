package handlers

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/url"
	"time"

	"github.com/CC-RMD-EpiBio/gofabulouscat/pkg/wdfab"

	"github.com/CC-RMD-EpiBio/gofluttercat/backend-golang/pkg/irtcat"
	badger "github.com/dgraph-io/badger/v4"
	"github.com/mederrata/ndvek"
)

type CatHandlerHelper struct {
	db           *badger.DB
	models       wdfab.WdFabIrtModels
	translations map[wdfab.Language]*wdfab.TranslationMap
	Context      *context.Context
}

func NewCatHandlerHelper(db *badger.DB, models wdfab.WdFabIrtModels, context *context.Context, translations map[wdfab.Language]*wdfab.TranslationMap) CatHandlerHelper {
	return CatHandlerHelper{
		db:           db,
		models:       models,
		Context:      context,
		translations: translations,
	}
}

func RemoveStringInPlace(slice []string, strToRemove string) []string {
	var i int
	for _, str := range slice {
		if str != strToRemove {
			slice[i] = str
			i++
		}
	}
	return slice[:i]
}

type nextScaleItemInput struct {
	Scale string `path:"scale"`
	Sid   string `path:"session_id"`
}

type nextScaleItemOutput struct {
	Now      time.Time                `header:"X-Now" json:"-"`
	Name     string                   `json:"item_name"`
	Question string                   `json:"question"`
	Choices  map[string]irtcat.Choice `json:"responses"`
	Version  float32                  `json:"version"`
	Scale    string                   `json:"scale"`
	Domain   string                   `json:"domain"`
}

func (ch CatHandlerHelper) NextScaleItemIo(ctx context.Context, input nextScaleItemInput, output *nextScaleItemOutput) error {
	sid, err := url.QueryUnescape(input.Sid)

	if err != nil {
		log.Printf("err: %v\n", err)

	}
	rehydrated, err := wdfab.SessionStateFromId([]byte(sid), ch.db, ch.Context)

	if err != nil {
		log.Printf("err: %v\n", err)
		return err
	}
	var ok bool
	var model *irtcat.GradedResponseModel
	var domain string
	if model, ok = ch.models.Physical[input.Scale]; ok {
		domain = "pf"
	} else if model, ok = ch.models.Mental[input.Scale]; ok {
		domain = "bh"
	} else {
		return errors.New("invalid scale")
	}

	if !ok {
		return errors.New("model not found")
	}

	scorer := irtcat.NewBayesianScorer(
		ndvek.Linspace(-10, 10, 400),
		irtcat.DefaultAbilityPrior,
		model,
	)
	scorer.Exclusions = rehydrated.Excluded
	thisModel, ok := ch.models.Mental[input.Scale]
	if !ok {
		thisModel = ch.models.Physical[input.Scale]
	}
	for r, a := range rehydrated.Responses {
		resp := irtcat.Response{
			Value: a,
			Item:  irtcat.GetItemByName(r, thisModel.GetItems()),
		}
		scorer.Answered = append(scorer.Answered, &resp)
	}

	scorer.Running.Energy, ok = rehydrated.Energies[domain][input.Scale]
	scorer.Exclusions = rehydrated.Excluded
	if !ok {
		fmt.Printf("scorer.Running.Energy: %v\n", rehydrated.Energies)
	}
	kselector := irtcat.NewEntropySelector(1.)
	item := kselector.NextItem(scorer)

	if item == nil {
		return errors.New("no items remaining")
	}

	output.Choices = item.Choices
	output.Name = item.Name
	output.Domain = domain
	output.Scale = input.Scale
	output.Now = time.Now().Local()
	output.Version = item.Version
	output.Question = item.Question
	if rehydrated.Language != wdfab.English {
		translator, ok := ch.translations[rehydrated.Language]
		if !ok {
			return fmt.Errorf("could not find translation %v, outputting english", rehydrated.Language.String())
		}
		question, choices, _ := translator.TranslateItem(item, rehydrated.Language)
		output.Question = question
		output.Choices = choices
	}

	return nil
}

type postResponseInput struct {
	Sid      string `path:"session_id"`
	ItemName string `json:"item_name"`
	Value    int    `json:"value"`
	Scale    string `json:"scale"`
	Domain   string `json:"domain"`
}

type postResponseOutput struct {
	Now     time.Time                             `header:"X-Now" json:"-"`
	Session SessionSummary                        `json:"session"`
	Scores  map[string](map[string]*ScoreSummary) `json:"scores"`
}

func (ch CatHandlerHelper) PostResponseIo(ctx context.Context, input postResponseInput, output *postResponseOutput) error {
	output.Now = time.Now().Local()

	sid, err := url.QueryUnescape(input.Sid)

	if err != nil {
		log.Printf("err: %v\n", err)

	}
	rehydrated, err := wdfab.SessionStateFromId([]byte(sid), ch.db, ch.Context)

	if err != nil {
		return err
	}

	var models *map[string](*irtcat.GradedResponseModel)
	var domain string
	if input.Domain == "bh" {
		models = &ch.models.Mental
		domain = "bh"
	} else {
		models = &ch.models.Physical
		domain = "pf"
	}

	prev, ok := rehydrated.Responses[input.ItemName]
	if ok {
		if prev == input.Value {
			return nil
		}
	}

	for scale, model := range *models {
		itm := irtcat.GetItemByName(input.ItemName, model.Items)

		if itm != nil {
			resp := irtcat.Response{
				Value: input.Value,
				Item:  itm,
			}
			scorer := irtcat.NewBayesianScorer(
				ndvek.Linspace(-10, 10, 400),
				irtcat.DefaultAbilityPrior,
				model,
			)

			scorer.Running.Energy = rehydrated.Energies[domain][scale]
			if ok {
				log.Printf("Removing previous response for %s\n", itm.Name)
				scorer.RemoveResponses([]string{itm.Name})
			}
			scorer.AddResponses([]irtcat.Response{resp})
			rehydrated.Energies[domain][scale] = scorer.Running.Energy
			var responses irtcat.Responses
			for _, r := range scorer.Answered {
				responses.Responses = append(responses.Responses, *r)
			}
			rehydrated.EmEnergies[domain][scale] = scorer.ScoreRaoBlackwell()

		}
	}
	rehydrated.Responses[input.ItemName] = input.Value

	sbyte, _ := rehydrated.ByteMarshal()
	err = ch.db.Update(func(txn *badger.Txn) error {
		e := badger.NewEntry([]byte(sid), sbyte)
		err := txn.SetEntry(e)
		return err
	})
	log.Println("Saved new response for " + sid)

	// output stuff
	output.Session.SessionId = sid
	output.Session.StartTime = rehydrated.Start
	output.Session.ExpirationTime = rehydrated.Expiration
	output.Session.Responses = rehydrated.Responses
	output.Session.Car = rehydrated.Respondent.Car
	output.Session.Physical = rehydrated.Respondent.Physical
	output.Session.Mental = rehydrated.Respondent.Mental
	output.Session.Transit = rehydrated.Respondent.Transit

	output.Scores = make(map[string]map[string]*ScoreSummary, 0)
	sh := SessionHandler{
		models: ch.models,
	}

	if rehydrated.Respondent.Physical && (len(rehydrated.Energies["pf"]) > 0) {

		output.Scores["pf"] = make(map[string]*ScoreSummary, 0)
		for scale, energy := range rehydrated.Energies["pf"] {

			if StringInSlice("hidden", ch.models.ScaleInfo["pf"][scale].Tags) {
				continue
			}
			bs := &irtcat.BayesianScore{
				Energy:   energy,
				Grid:     ndvek.Linspace(-10, 10, 400),
				RbEnergy: rehydrated.EmEnergies["pf"][scale],
			}

			output.Scores["pf"][scale] = sh.NewScoreSummary(bs, scale)
		}
	}

	if rehydrated.Respondent.Mental {
		output.Scores["bh"] = make(map[string]*ScoreSummary, 0)

		for scale, energy := range rehydrated.Energies["bh"] {

			if StringInSlice("hidden", ch.models.ScaleInfo["bh"][scale].Tags) {
				continue
			}
			bs := &irtcat.BayesianScore{
				Energy:   energy,
				Grid:     ndvek.Linspace(-10, 10, 400),
				RbEnergy: rehydrated.EmEnergies["bh"][scale],
			}
			output.Scores["bh"][scale] = sh.NewScoreSummary(bs, scale)
		}
	}
	return err
}
