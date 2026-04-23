package wdfab

type Language int

const (
	English Language = iota
	Spanish
)

// String implements the Stringer interface for Language
func (l Language) String() string {
	switch l {
	case English:
		return "English"
	case Spanish:
		return "Spanish"
	default:
		return "Unknown"
	}
}

// Code returns the ISO 639-1 language code
func (l Language) Code() string {
	switch l {
	case English:
		return "en"
	case Spanish:
		return "es"
	default:
		return ""
	}
}

// TranslationMap holds the English to Spanish translations
type TranslationMap struct {
	exact map[string]string // normalized key -> Spanish translation
	keys  []string          // original English keys for fuzzy matching
}
