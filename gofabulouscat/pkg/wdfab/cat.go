package wdfab

import (
	"bytes"
	"context"
	"encoding/gob"
	"time"

	"github.com/dgraph-io/badger/v4"
)

type SessionSettings struct {
	ItemExclusions     []string
	Randomize          bool
	AdministerUnscored bool
	AdministerValidity bool
}

type SessionState struct {
	SessionId  string                            `json:"session_id"`
	Respondent Respondent                        `json:"respondent"`
	Energies   map[string](map[string][]float64) `json:"energies"`
	EmEnergies map[string](map[string][]float64) `json:"em_energies"`
	Excluded   []string                          `json:"excluded"`
	Responses  map[string]int                    `json:"responses"`
	Start      time.Time                         `json:"start_time"`
	Expiration time.Time                         `json:"expiration_time"`
	Language   Language                          `json:"lang"`
}

func (s SessionState) ByteMarshal() ([]byte, error) {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	err := enc.Encode(s)
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func SessionStateByteUnmarshal(sessionState []byte) (*SessionState, error) {
	var ss SessionState
	dec := gob.NewDecoder(bytes.NewReader(sessionState))
	err := dec.Decode(&ss)
	if err != nil {
		return nil, err
	}
	return &ss, nil
}

func SessionStateFromId(sid []byte, db *badger.DB, ctx *context.Context) (*SessionState, error) {
	var bArray []byte
	err := db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(sid)
		if err != nil {
			return err
		}
		err = item.Value(func(val []byte) error {
			// This func with val would only be called if item.Value encounters no error.

			// Copying or parsing val is valid.
			bArray = append(bArray, val...)

			// Assigning val slice to another variable is NOT OK.
			return nil
		})
		return err
	})

	if err != nil {
		return nil, err
	}
	rehyrdrated, _ := SessionStateByteUnmarshal(bArray)
	return rehyrdrated, nil
}
