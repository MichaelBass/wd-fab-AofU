package handlers

import (
	"context"
	"log"
	"math"
	"net/url"
	"time"

	"github.com/CC-RMD-EpiBio/gofabulouscat/config"
	"github.com/CC-RMD-EpiBio/gofabulouscat/pkg/wdfab"
	"github.com/CC-RMD-EpiBio/gofluttercat/backend-golang/pkg/irtcat"
	badger "github.com/dgraph-io/badger/v4"
	"github.com/google/uuid"
	"github.com/mederrata/ndvek"
)

type SessionHandler struct {
	db       *badger.DB
	models   wdfab.WdFabIrtModels
	context  context.Context
	filePath *string
	config   config.CatConfig
}

func NewSessionHandler(context context.Context, db *badger.DB, models wdfab.WdFabIrtModels, config config.CatConfig, filePath string) SessionHandler {
	return SessionHandler{
		db:       db,
		models:   models,
		context:  context,
		filePath: &filePath,
		config:   config,
	}
}

type NewSessionInput struct {
	Sex          wdfab.Sex      `json:"sex"`
	Car          bool           `json:"car"`
	WheelChair   bool           `json:"wheelchair"`
	Physical     bool           `json:"physical"`
	Mental       bool           `json:"mental"`
	RespondentId string         `json:"respondent_id"`
	Transit      bool           `json:"transit"`
	Selector     string         `json:"item_selector" enum:"stochastic,greedy"`
	Language     wdfab.Language `json:"lang"`
}

type NewSessionOutput struct {
	Now        time.Time      `header:"X-Now" json:"-"`
	Sid        string         `json:"session_id"`
	Start      time.Time      `json:"start_time"`
	Expiration time.Time      `json:"expiration_time"`
	Language   wdfab.Language `json:"lang"`
}

func (sh *SessionHandler) NewSessionHandlerIo(ctx context.Context, input NewSessionInput, output *NewSessionOutput) error {
	id := uuid.New()

	output.Sid = "wdfab:" + id.String()
	output.Start = time.Now().Local()
	output.Language = input.Language
	output.Expiration = time.Now().Local().Add(time.Hour * time.Duration(sh.config.ExpirationHours))
	// initialize the CAT session

	energies := map[string](map[string][]float64){
		"pf": make(map[string][]float64, 0),
		"bh": make(map[string][]float64, 0),
	}

	// initiate mental models
	if input.Mental {
		scorers := make(map[string]*irtcat.BayesianScorer, 0)
		for label, m := range sh.models.Mental {
			if m.Scale.IsUnscored() {
				continue
			}
			scorers[label] = irtcat.NewBayesianScorer(
				ndvek.Linspace(-10, 10, 400),
				irtcat.DefaultAbilityPrior,
				*m,
				sh.models.Bcm[label],
			)
			energies["bh"][label] = scorers[label].Running.Energy

		}

	}
	// initiate physical models
	if input.Physical {
		scorers := make(map[string]*irtcat.BayesianScorer, 0)
		for label, m := range sh.models.Physical {

			if m.Scale.IsUnscored() {
				continue
			}
			scorers[label] = irtcat.NewBayesianScorer(
				ndvek.Linspace(-10, 10, 400),
				irtcat.DefaultAbilityPrior,
				*m,
				sh.models.Bcm[label],
			)
			energies["pf"][label] = scorers[label].Running.Energy

		}

	}

	respondent := wdfab.Respondent{
		Car:        input.Car,
		WheelChair: input.WheelChair,
		Id:         input.RespondentId,
		Sex:        input.Sex,
		Physical:   input.Physical,
		Mental:     input.Mental,
		Transit:    input.Transit,
		Language:   input.Language,
	}
	state := wdfab.SessionState{
		SessionId:  output.Sid,
		Respondent: respondent,
		Start:      time.Now().Local(),
		Expiration: output.Expiration,
		Responses:  make(map[string]int, 0),
		Energies: map[string]map[string][]float64{
			"pf": energies["pf"],
			"bh": energies["bh"],
		},
		Excluded: make([]string, 0),
		Language: input.Language,
	}

	// populate exclusions

	state.Excluded = sh.models.GetExclusionsForRespondent(respondent)

	sbyte, _ := state.ByteMarshal()

	if sh.context == nil {
		sh.context = context.Background()
	}
	db := sh.db
	err := db.Update(func(txn *badger.Txn) error {
		e := badger.NewEntry([]byte(state.SessionId), sbyte)
		err := txn.SetEntry(e)
		return err
	})

	if err != nil {
		log.Printf("err: %v\n", err)
		return err
	}

	return nil
}

type deleteSessionInput struct {
	Sid string `path:"session_id"`
}

type deleteSessionOutput struct {
	Now      time.Time `header:"X-Now" json:"-"`
	FileName string    `path:"filename"`
}

func (sh SessionHandler) DeleteSessionIo(ctx context.Context, input deleteSessionInput, output *deleteSessionOutput) error {
	output.Now = time.Now().Local()
	sid, err := url.QueryUnescape(input.Sid)
	if err != nil {
		log.Printf("err: %v\n", err)
	}
	rehydrated, err := wdfab.SessionStateFromId([]byte(sid), sh.db, &sh.context)
	if err != nil {
		log.Printf("err: %v\n", err)
	}

	rehydrated.Expiration = time.Now().Local()
	if sh.filePath != nil {
		// serialize to disk
		output.FileName = *sh.filePath + sid
	}

	txn := sh.db.NewTransaction(true)
	defer txn.Discard()
	err = txn.Delete([]byte(sid))

	return err
}

type SessionSummary struct {
	SessionId      string         `json:"session_id"`
	StartTime      time.Time      `json:"start_time"`
	ExpirationTime time.Time      `json:"expiration_time"`
	Responses      map[string]int `json:"responses"`
	Physical       bool           `json:"physical"`
	Mental         bool           `json:"mental"`
	Car            bool           `json:"car"`
	WheelChair     bool           `json:"wheelchair"`
	Transit        bool           `json:"transit"`
}

type ScoreSummary struct {
	Mean               float64   `json:"mean"`
	Std                float64   `json:"std"`
	Deciles            []float64 `json:"deciles"`
	RawMean            float64   `json:"raw_mean"`
	RawStd             float64   `json:"raw_std"`
	AdjustedRawMean    float64   `json:"adjusted_raw_mean"`
	AdjustedRawStd     float64   `json:"adjusted_raw_std"`
	AdjustedRawDeciles []float64 `json:"adjusted_raw_deciles"`
	AdjustedMean       float64   `json:"adjusted_mean"`
	AdjustedStd        float64   `json:"adjusted_std"`
	AdjustedDeciles    []float64 `json:"adjusted_deciles"`
	// Density []float64 `json:"density"`
	// Grid    []float64 `json:"grid"`
}

func (sh SessionHandler) NewScoreSummary(bs *irtcat.BayesianScore, scale string, administered map[string]bool) *ScoreSummary {
	s, ok := sh.models.ScaleInfo["pf"][scale]
	if !ok {
		s, ok = sh.models.ScaleInfo["bh"][scale]
	}
	if !ok {
		return nil
	}
	rawMean := bs.Mean() // only Energy stored -> Mean() == observed-only mean

	bcm := sh.models.Bcm[scale]
	correct := func(theta float64) float64 {
		if bcm == nil {
			return theta
		}
		return bcm.ApplyByKey(theta, administered)
	}

	correctedMean := correct(rawMean)
	bias := correctedMean - rawMean
	out := &ScoreSummary{
		Mean:    correct(rawMean),
		RawMean: rawMean,
		RawStd:  bs.Std(),
	}

	out.Std = math.Sqrt(out.RawStd*out.RawStd + bias*bias)

	out.AdjustedMean = 50 + (correct(rawMean)-s.Loc)/s.Scale*10

	out.AdjustedStd = math.Sqrt(out.RawStd*out.RawStd+bias*bias) / s.Scale * 10

	out.AdjustedRawMean = 50 + (rawMean-s.Loc)/s.Scale*10
	out.AdjustedRawStd = out.RawStd / s.Scale * 10

	return out

}

type getSessionOutput struct {
	Now     time.Time                             `header:"X-Now" json:"-"`
	Session SessionSummary                        `json:"session"`
	Scores  map[string](map[string]*ScoreSummary) `json:"scores"`
}

type getSessionInput struct {
	Sid string `path:"session_id"`
}

func (sh SessionHandler) GetSessionSummaryIo(ctx context.Context, input getSessionInput, output *getSessionOutput) error {
	output.Now = time.Now().Local()
	sid, err := url.QueryUnescape(input.Sid)
	if err != nil {
		log.Printf("err: %v\n", err)
	}

	rehydrated, err := wdfab.SessionStateFromId([]byte(sid), sh.db, &sh.context)
	if err != nil {
		log.Printf("err: %v\n", sid+" "+err.Error())
		return err
	}
	output.Session.SessionId = sid
	output.Session.StartTime = rehydrated.Start
	output.Session.ExpirationTime = rehydrated.Expiration
	output.Session.Responses = rehydrated.Responses
	output.Session.Car = rehydrated.Respondent.Car
	output.Session.Physical = rehydrated.Respondent.Physical
	output.Session.Mental = rehydrated.Respondent.Mental
	output.Session.Transit = rehydrated.Respondent.Transit

	output.Scores = make(map[string]map[string]*ScoreSummary, 0)
	// Set of answered items across the session. ApplyByKey filters to each
	// scale's own ItemKeys, so passing all responses (both domains) is safe.
	administered := make(map[string]bool, len(rehydrated.Responses))
	for item := range rehydrated.Responses {
		administered[item] = true
	}

	if rehydrated.Respondent.Physical && (len(rehydrated.Energies["pf"]) > 0) {

		output.Scores["pf"] = make(map[string]*ScoreSummary, 0)
		for scale, energy := range rehydrated.Energies["pf"] {

			if StringInSlice("hidden", sh.models.ScaleInfo["pf"][scale].Tags) {
				continue
			}
			bs := &irtcat.BayesianScore{
				Energy: energy,
				Grid:   ndvek.Linspace(-10, 10, 400),
			}
			output.Scores["pf"][scale] = sh.NewScoreSummary(bs, scale, administered)
		}
	}

	if rehydrated.Respondent.Mental {
		output.Scores["bh"] = make(map[string]*ScoreSummary, 0)

		for scale, energy := range rehydrated.Energies["bh"] {

			if StringInSlice("hidden", sh.models.ScaleInfo["bh"][scale].Tags) {
				continue
			}
			bs := &irtcat.BayesianScore{
				Energy: energy,
				Grid:   ndvek.Linspace(-10, 10, 400),
			}
			output.Scores["bh"][scale] = sh.NewScoreSummary(bs, scale, administered)
		}
	}

	return nil
}

type getSessionsInput struct {
	ActiveOnly bool `query:"active_only"`
}

type SessionLs struct {
	Sid        string    `json:"session_id"`
	Start      time.Time `json:"start_time"`
	Expiration time.Time `json:"expiration_time"`
	Exclusions []string  `json:"exclusions"`
}
type getSessionsOutput struct {
	Now      time.Time   `header:"X-Now" json:"-"`
	Sessions []SessionLs `json:"sessions"`
}

func (sh SessionHandler) GetSessionListIo(ctx context.Context, input getSessionsInput, output *getSessionsOutput) error {
	output.Now = time.Now().Local()

	output.Sessions = make([]SessionLs, 0)

	err := sh.db.View(func(txn *badger.Txn) error {
		it := txn.NewIterator(badger.DefaultIteratorOptions)
		defer it.Close()
		prefix := []byte("wdfab:")
		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			item := it.Item()

			err := item.Value(func(v []byte) error {

				rehydrated, err := wdfab.SessionStateByteUnmarshal(v)

				if time.Now().Local().After(rehydrated.Expiration) && (input.ActiveOnly) {
					return nil
				}
				output.Sessions = append(output.Sessions, SessionLs{Sid: rehydrated.SessionId, Start: rehydrated.Start, Expiration: rehydrated.Expiration, Exclusions: rehydrated.Excluded})
				return err
			})
			if err != nil {
				continue
			}

		}
		return nil
	})

	return err
}
