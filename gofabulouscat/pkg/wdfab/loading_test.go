package wdfab

import (
	"fmt"
	"testing"
)

func Test_Translation(t *testing.T) {
	translations, err := LoadTranslations()
	if err != nil {
		panic("Could not load translations")
	}
	fmt.Printf("translations[Spanish]: %v\n", translations[Spanish])
}
