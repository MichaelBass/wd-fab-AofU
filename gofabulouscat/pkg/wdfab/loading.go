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

package wdfab

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"path"
	"strings"

	conf "github.com/CC-RMD-EpiBio/gofabulouscat/config"
	versions "github.com/CC-RMD-EpiBio/gofabulouscat/versions"
	"github.com/CC-RMD-EpiBio/gofluttercat/backend-golang/pkg/biascorrection"
	irtcat "github.com/CC-RMD-EpiBio/gofluttercat/backend-golang/pkg/irtcat"
)

type BcmStore map[string]*biascorrection.BCMConditional

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func LoadScales(conf *conf.Config) map[string](map[string]irtcat.Scale) {
	cached, err := fs.ReadFile(versions.FactorizedWdFab, conf.Cat.InstrumentVersion+"/scales.json")
	check(err)
	scales := make(map[string]Scale, 0)
	if err := json.Unmarshal(cached, &scales); err != nil {
		log.Fatal(err)
	}
	pf_scales := make(map[string]irtcat.Scale, 0)
	bh_scales := make(map[string]irtcat.Scale, 0)
	for name, scale := range scales {
		// irtcat keys each item's ScaleLoadings by the scale code (the JSON
		// object key here, e.g. "CC"), and NewGRM/Prob look those loadings up
		// by Scale.Name. So Name must be the code, not the human-readable
		// scale.Name from scales.json, or no item is calibrated for the scale.
		if scale.Domain == "pf" {
			pf_scales[name] = irtcat.Scale{
				Loc:     scale.Loc,
				Scale:   scale.Scale,
				Name:    name,
				Tags:    scale.Tags,
				Version: scale.Version,
				Diff:    scale.Diff,
			}
			continue
		}
		bh_scales[name] = irtcat.Scale{
			Loc:     scale.Loc,
			Scale:   scale.Scale,
			Name:    name,
			Tags:    scale.Tags,
			Version: scale.Version,
			Diff:    scale.Diff,
		}

	}
	return map[string](map[string]irtcat.Scale){
		"bh": bh_scales,
		"pf": pf_scales,
	}
}

func LoadDomains(conf *conf.Config) map[string]Domain {
	cached, err := fs.ReadFile(versions.FactorizedWdFab, conf.Cat.InstrumentVersion+"/domains.json")
	check(err)
	domains := make(map[string]Domain, 0)
	if err := json.Unmarshal(cached, &domains); err != nil {
		log.Fatal(err)
	}

	return domains
}

func LoadItems(conf *conf.Config) map[string](map[string][]*irtcat.Item) {
	// LoadBehavioral
	cached, err := fs.ReadDir(versions.FactorizedWdFab, conf.Cat.InstrumentVersion+"/items/bh")
	check(err)

	bhitems := make(map[string][]*irtcat.Item, 0)
	var scalenames []string
	for _, file := range cached {
		if file.IsDir() {
			scalenames = append(scalenames, file.Name())
		}
	}
	for _, scale := range scalenames {
		cached, err := fs.ReadDir(versions.FactorizedWdFab, conf.Cat.InstrumentVersion+"/items/bh/"+scale)
		check(err)

		for _, fn := range cached {
			d, err := fs.ReadFile(versions.FactorizedWdFab, conf.Cat.InstrumentVersion+"/items/bh/"+scale+"/"+fn.Name())
			check(err)

			newItem := irtcat.LoadItemS(d, []int{1, 2, 3, 4, 5})
			if newItem != nil {
				bhitems[scale] = append(bhitems[scale], newItem)
			}

		}
	}

	// LoadPhysical
	cached, err = fs.ReadDir(versions.FactorizedWdFab, conf.Cat.InstrumentVersion+"/items/pf")
	check(err)
	pfitems := make(map[string][]*irtcat.Item, 0)

	var pfscales []string
	for _, file := range cached {
		if file.IsDir() {
			pfscales = append(pfscales, file.Name())
		}
	}

	for _, scale := range pfscales {
		cached, err := fs.ReadDir(versions.FactorizedWdFab, conf.Cat.InstrumentVersion+"/items/pf/"+scale)
		check(err)

		for _, fn := range cached {
			d, err := fs.ReadFile(versions.FactorizedWdFab, conf.Cat.InstrumentVersion+"/items/pf/"+scale+"/"+fn.Name())
			check(err)

			newItem := irtcat.LoadItemS(d, []int{1, 2, 3, 4, 5})
			if newItem != nil {
				pfitems[scale] = append(pfitems[scale], newItem)
			}

		}
	}

	items := map[string](map[string][]*irtcat.Item){
		"pf": pfitems,
		"bh": bhitems,
	}

	return items
}

// LoadBCMs parses and validates 4.0/bcm/<SCALE>/bcm_<SCALE>_conditional.json
// for every scale in the embedded tree.
func LoadBCMs(conf *conf.Config) (BcmStore, error) {
	matches, err := fs.Glob(versions.FactorizedWdFab, conf.Cat.InstrumentVersion+"/bcm/*/bcm_*_conditional.json")
	if err != nil {
		return nil, err
	}
	store := make(BcmStore, len(matches))
	for _, p := range matches {
		raw, err := versions.FactorizedWdFab.ReadFile(p)
		if err != nil {
			return nil, fmt.Errorf("read %s: %w", p, err)
		}
		b := &biascorrection.BCMConditional{}
		if err := json.Unmarshal(raw, b); err != nil {
			return nil, fmt.Errorf("parse %s: %w", p, err)
		}
		if err := b.Validate(); err != nil { // n_features == 1 + len(item_keys)
			return nil, fmt.Errorf("validate %s: %w", p, err)
		}
		scale := path.Base(path.Dir(p)) // parent dir name is the scale
		if b.ScaleName != "" && b.ScaleName != scale {
			return nil, fmt.Errorf("%s: scale_name %q != dir %q", p, b.ScaleName, scale)
		}
		store[scale] = b
	}
	if len(store) == 0 {
		return nil, fmt.Errorf("no conditional BCMs under %s/bcm/", conf.Cat.InstrumentVersion)
	}
	return store, nil
}

func Load(conf *conf.Config) WdFabIrtModels {
	items := LoadItems(conf)
	scales := LoadScales(conf)
	domains := LoadDomains(conf)
	bcm, _ := LoadBCMs(conf)

	instrument := WdFabIrtModels{
		DomainInfo: domains,
		ScaleInfo:  scales,
		Bcm:        bcm,
	}

	instrument.Physical = make(map[string]*irtcat.GradedResponseModel, 0)
	instrument.Mental = make(map[string]*irtcat.GradedResponseModel, 0)

	for domain, data := range items {
		for scale, items := range data {
			model := irtcat.NewGRM(items, scales[domain][scale])
			if domain == "pf" {
				instrument.Physical[scale] = &model
			} else {
				instrument.Mental[scale] = &model
			}

		}
	}

	return instrument
}

// LoadTranslations loads the embedded CSV into a translation map
func LoadTranslations() (map[Language]*TranslationMap, error) {
	file, err := versions.Spanish.Open("wdfab_final_spa.csv")
	if err != nil {
		return nil, fmt.Errorf("failed to open wdfab_final_spa.csv: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)

	// Skip header row
	if _, err := reader.Read(); err != nil {
		return nil, fmt.Errorf("failed to read header: %w", err)
	}

	tm := &TranslationMap{
		exact: make(map[string]string),
		keys:  make([]string, 0),
	}

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to read CSV row: %w", err)
		}

		if len(record) < 2 {
			continue
		}

		en := strings.TrimSpace(record[0])
		es := strings.TrimSpace(record[1])

		if en == "" || es == "" {
			continue
		}

		// Store with normalized key
		normalizedKey := normalize(en)
		tm.exact[normalizedKey] = es
		tm.keys = append(tm.keys, en)
	}
	tmmap := make(map[Language]*TranslationMap, 0)
	tmmap[Spanish] = tm
	return tmmap, nil
}

// normalize converts a string to lowercase and removes extra whitespace
func normalize(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

// Translate performs fuzzy case-insensitive lookup
func (tm *TranslationMap) Translate(english string) (string, bool) {
	// Try exact match first (case-insensitive)
	normalized := normalize(english)
	if translation, ok := tm.exact[normalized]; ok {
		return translation, true
	}

	// Try fuzzy matching - look for substring matches
	for _, key := range tm.keys {
		normalizedKey := normalize(key)

		// Check if the input is contained in the key or vice versa
		if strings.Contains(normalizedKey, normalized) || strings.Contains(normalized, normalizedKey) {
			return tm.exact[normalizedKey], true
		}
	}

	return "", false
}

func (tm *TranslationMap) TranslateItem(item *irtcat.Item, lang Language) (string, map[string]irtcat.Choice, error) {
	if item == nil {
		return "nil", nil, fmt.Errorf("no item given")
	}
	if lang == 0 {
		return item.Question, item.Choices, nil
	} else {
		q, ok := tm.Translate(item.Question)
		if !ok {
			return "", nil, fmt.Errorf("unable to translate question")
		}
		translatedChoices := make(map[string]irtcat.Choice, 0)
		for k, choice := range item.Choices {
			text, _ := tm.Translate(choice.Text)
			translatedChoices[k] = irtcat.Choice{
				Text:  text,
				Value: choice.Value,
			}
		}
		return q, translatedChoices, nil
	}
}
