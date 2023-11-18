package main

import "time"

// Snapshot represents a dataset for a home
type Snapshot struct {
	ID               string               `json:"id,omitempty"`
	Home             *TibberHome          `json:"home"                       firestore:"home"`
	ConsumptionNodes []*TibberConsumption `json:"consumptionNodes,omitempty" firestore:"consumptionNodes"`
	PriceNodes       []*TibberPrice       `json:"priceNodes,omitempty"       firestore:"priceNodes"`
	ProfileNodes     []*SVKProfile        `json:"profileNodes,omitempty"     firestore:"profileNodes"`
	CreatedAt        time.Time            `json:"created_at"                 firestore:"created_at"`
}

// IsValid returns false if the data in the structure is invalid
func (s *Snapshot) IsValid() bool {
	if s.Home == nil || !s.Home.IsValid() {
		return false
	}
	for _, n := range s.ConsumptionNodes {
		if !n.IsValid() {
			return false
		}
	}
	for _, n := range s.PriceNodes {
		if !n.IsValid() {
			return false
		}
	}
	for _, n := range s.ProfileNodes {
		if !n.IsValid() {
			return false
		}
	}

	return true
}

// SnapshotPage contains a page of snapshots
type SnapshotPage struct {
	Snapshots []*Snapshot `json:"snapshots"`
	Count     int         `json:"count"`
}

// TibberHome contains an id referece that allows a
// user to find thier previous snapshots
type TibberHome struct {
	ID            string `json:"id,omitempty"   firestore:"id"`
	PriceAreaCode string `json:"priceAreaCode"  firestore:"priceAreaCode"`
	GridAreaCode  string `json:"gridAreaCode"   firestore:"gridAreaCode"`
	// Deprecated, use PriceAreaCode
	Area string `json:"area,omitempty" firestore:"area,omitempty"`
}

// Anonymized returns an anonymized copy of the home
func (t *TibberHome) Anonymized() *TibberHome {
	h := *t
	h.ID = ""
	return &h
}

// IsValid returns false if the data in the structure is invalid
func (t *TibberHome) IsValid() bool {
	if len(t.ID) != 36 {
		return false
	}
	if len(t.GridAreaCode) != 3 {
		return false
	}

	switch t.PriceAreaCode {
	case "SE0", "SE1", "SE2", "SE3", "SE4":
	default:
		return false
	}

	return true
}

type SVKProfile struct {
	// SVK stores time as 2018-11-14 00:00 which won't parse directly
	Time  string  `json:"time"  firestore:"time"`
	Value float64 `json:"value" firestore:"value"`
}

// IsValid returns false if the data in the structure is invalid
func (s *SVKProfile) IsValid() bool {
	return s.Time != ""
}

type TibberConsumption struct {
	From        string  `json:"from"        firestore:"from"`
	To          string  `json:"to"          firestore:"to"`
	UnitCost    float64 `json:"unitCost"    firestore:"unitCost"`
	Consumption float64 `json:"consumption" firestore:"consumption"`
}

// IsValid returns false if the data in the structure is invalid
func (t *TibberConsumption) IsValid() bool {
	return t.From != "" && t.To != ""
}

type TibberPrice struct {
	StartsAt string  `json:"startsAt" firestore:"startsAt"`
	Total    float64 `json:"total"    firestore:"total"`
}

// IsValid returns false if the data in the structure is invalid
func (t *TibberPrice) IsValid() bool {
	return t.StartsAt != ""
}
