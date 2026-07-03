package versions

import (
	"embed"
)

//go:embed 4.0
var FactorizedWdFab embed.FS

//go:embed autoencoded
var AutoencodedWdFab embed.FS

//go:embed wdfab_final_spa.csv
var Spanish embed.FS