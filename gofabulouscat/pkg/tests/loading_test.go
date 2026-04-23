package tests

import (
	"fmt"
	"testing"

	conf "github.com/CC-RMD-EpiBio/gofabulouscat/config"

	"github.com/CC-RMD-EpiBio/gofabulouscat/pkg/wdfab"
)

func Test_scale_unmarshal(t *testing.T) {
	conf := conf.GetConfig()
	scales := wdfab.LoadScales(conf)
	fmt.Printf("scales: %v\n", scales)
}

func Test_item_unmarshal(t *testing.T) {
	conf := conf.GetConfig()

	items := wdfab.LoadItems(conf)
	fmt.Printf("len(items): %v\n", len(items))
	fmt.Printf("items: %v\n", items)
}

func Test_instrument_load(t *testing.T) {
	conf := conf.GetConfig()

	instrument := wdfab.Load(conf)
	fmt.Printf("instrument: %v\n", instrument)
}
