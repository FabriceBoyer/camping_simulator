package model

import (
	"encoding/json"
	"time"
)

// SaveRecord is a full persisted game save, including the opaque game state
// blob produced by the frontend.
type SaveRecord struct {
	ID        string          `json:"id"`
	Name      string          `json:"name"`
	UpdatedAt time.Time       `json:"updatedAt"`
	State     json.RawMessage `json:"state"`
}

// SaveMeta is the lightweight listing view, without the (potentially large)
// state payload.
type SaveMeta struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (r SaveRecord) Meta() SaveMeta {
	return SaveMeta{ID: r.ID, Name: r.Name, UpdatedAt: r.UpdatedAt}
}
