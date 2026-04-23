package wdfab

const (
	Unknown Sex = iota
	Male
	Female
	Other
)

func (s Sex) String() string {
	switch s {
	case Male:
		return "Male"
	case Female:
		return "Female"
	case Other:
		return "Other"
	default:
		return "Unknown"
	}
}

type Domain struct {
	Name         string   `json:"name"`
	Instructions []string `json:"instructions"`
}

type Respondent struct {
	Id            string   `json:"id"`
	Car           bool     `json:"car"`
	Sex           Sex      `json:"sex"`
	Physical      bool     `json:"physical"`
	Mental        bool     `json:"mental"`
	WheelChair    bool     `json:"wheelchair"`
	WalkingDevice bool     `json:"walkingdevice"`
	Transit       bool     `json:"transit"`
	Language      Language `json:"lang"`
}

type Sex int
