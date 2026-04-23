package tests

import (
	"fmt"
	"testing"

	conf "github.com/CC-RMD-EpiBio/gofabulouscat/config"
	"github.com/CC-RMD-EpiBio/gofabulouscat/pkg/wdfab"
	"github.com/CC-RMD-EpiBio/gofluttercat/backend-golang/pkg/irtcat"

	"github.com/mederrata/ndvek"
)

func Test_grm(t *testing.T) {
	conf := conf.GetConfig()
	instrument := wdfab.Load(conf)
	energies := map[string](map[string][]float64){
		"pf": make(map[string][]float64, 0),
		"bh": make(map[string][]float64, 0),
	}
	scorers := make(map[string]*irtcat.BayesianScorer, 0)
	for label, m := range instrument.Mental {
		scorers[label] = irtcat.NewBayesianScorer(ndvek.Linspace(-10, 10, 400), irtcat.DefaultAbilityPrior, *m)
		energies["bh"][label] = scorers[label].Running.Energy
	}
	kselector := irtcat.NewEntropySelector(1.)
	item := kselector.NextItem(scorers["CC"])
	fmt.Printf("item: %v\n", item)
}

func Test_exclusions(t *testing.T) {
	conf := conf.GetConfig()
	instrument := wdfab.Load(conf)
	energies := map[string](map[string][]float64){
		"pf": make(map[string][]float64, 0),
		"bh": make(map[string][]float64, 0),
	}
	scorers := make(map[string]*irtcat.BayesianScorer, 0)
	for label, m := range instrument.Mental {
		scorers[label] = irtcat.NewBayesianScorer(ndvek.Linspace(-10, 10, 400), irtcat.DefaultAbilityPrior, *m)
		energies["bh"][label] = scorers[label].Running.Energy
	}
	respondent := wdfab.Respondent{
		Car:        false,
		Transit:    true,
		WheelChair: false,
		Physical:   true,
		Mental:     true,
	}
	exclusions := instrument.GetExclusionsForRespondent(respondent)
	fmt.Printf("exclusions: %v\n", exclusions)
}
