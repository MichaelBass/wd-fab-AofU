package versions

import (
	"embed"
)

//go:embed 3.15
var FactorizedWdFab embed.FS

//go:embed autoencoded
var AutoencodedWdFab embed.FS

//go:embed wdfab_final_spa.csv
var Spanish embed.FS

//go:embed 4.0
var WdFab4 embed.FS
