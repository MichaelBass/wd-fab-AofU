package wdfab

import (
	"github.com/CC-RMD-EpiBio/gofluttercat/backend-golang/pkg/irtcat"
)

type WdFabIrtModels struct {
	Mental     map[string]*irtcat.GradedResponseModel
	Physical   map[string]*irtcat.GradedResponseModel
	ScaleInfo  map[string](map[string]irtcat.Scale)
	DomainInfo map[string]Domain
}

type Scale struct {
	Loc     float64      `yaml:"loc" json:"loc"`
	Scale   float64      `yaml:"scale" json:"scale"`
	Name    string       `yaml:"name" json:"name"`
	Version float32      `yaml:"version" json:"version"`
	Tags    []string     `yaml:"tags" json:"tags"`
	Diff    *irtcat.Diff `yaml:"diff"`
	Domain  string       `json:"domain" yaml:"domain"`
}

type ScaleInfo struct {
	ScaleLoadings map[string]*Scale
}

func (s Scale) IsUnscored() bool {
	return irtcat.StringInSlice("unscored", s.Tags)
}

func (m WdFabIrtModels) GetExclusionsForRespondent(r Respondent) []string {
	exclusions := make([]string, 0)
	if r.Physical {
		for _, model := range m.Physical {
		INNER:
			for _, itm := range model.GetItems() {
				req := itm.Diff.Required
				if req != nil {
					if !r.Car {
						if _, ok := req["car"]; ok {
							exclusions = append(exclusions, itm.Name)
							continue INNER
						}
					}
					if !r.WheelChair {
						if _, ok := req["wheelchair"]; ok {
							exclusions = append(exclusions, itm.Name)
							continue INNER
						}
					}
					if r.WalkingDevice {
						if _, ok := req["wd"]; ok {
							exclusions = append(exclusions, itm.Name)
							continue INNER
						}
					}

				}
				ex := itm.Diff.Excluded
				if ex != nil {
					if r.WalkingDevice {
						if _, ok := ex["wd"]; ok {
							exclusions = append(exclusions, itm.Name)
							continue INNER
						}
					}

					if r.WheelChair {
						if _, ok := ex["wc"]; ok {
							exclusions = append(exclusions, itm.Name)
							continue INNER
						}
					}

				}

			}
		}
	}
	if r.Mental {
		for _, model := range m.Mental {
			for _, itm := range model.GetItems() {
				ex := itm.Diff.Excluded
				if ex != nil {
					// fmt.Printf("ex: %v\n", ex)
				}
				req := itm.Diff.Required
				if req != nil {
					// fmt.Printf("req: %v\n", req)
				}
			}
		}
	}
	return exclusions
}
