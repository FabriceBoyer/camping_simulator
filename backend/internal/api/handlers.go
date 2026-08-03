package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"

	"camping-simulator/backend/internal/store"
)

var validID = regexp.MustCompile(`^[a-f0-9]{4,64}$`)

type Handlers struct {
	Store *store.FileStore
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func (h *Handlers) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *Handlers) ListSaves(w http.ResponseWriter, r *http.Request) {
	metas, err := h.Store.List()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list saves")
		return
	}
	writeJSON(w, http.StatusOK, metas)
}

type saveRequest struct {
	Name  string          `json:"name"`
	State json.RawMessage `json:"state"`
}

func (h *Handlers) CreateSave(w http.ResponseWriter, r *http.Request) {
	var req saveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		req.Name = "Camping"
	}
	if len(req.Name) > 80 {
		req.Name = req.Name[:80]
	}
	if len(req.State) == 0 {
		writeError(w, http.StatusBadRequest, "missing state")
		return
	}
	rec, err := h.Store.Upsert("", req.Name, req.State)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not save game")
		return
	}
	writeJSON(w, http.StatusCreated, rec)
}

func (h *Handlers) GetSave(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !validID.MatchString(id) {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	rec, err := h.Store.Get(id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "save not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not read save")
		return
	}
	writeJSON(w, http.StatusOK, rec)
}

func (h *Handlers) UpdateSave(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !validID.MatchString(id) {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if _, err := h.Store.Get(id); errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "save not found")
		return
	}
	var req saveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		req.Name = "Camping"
	}
	if len(req.State) == 0 {
		writeError(w, http.StatusBadRequest, "missing state")
		return
	}
	rec, err := h.Store.Upsert(id, req.Name, req.State)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not update save")
		return
	}
	writeJSON(w, http.StatusOK, rec)
}

func (h *Handlers) DeleteSave(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !validID.MatchString(id) {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.Store.Delete(id); errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "save not found")
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete save")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
