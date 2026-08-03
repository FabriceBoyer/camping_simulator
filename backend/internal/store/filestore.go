// Package store provides a simple JSON-file-backed persistence layer for
// game saves. It intentionally avoids a database dependency: each save is a
// single JSON file on disk, guarded by an in-process mutex.
package store

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"

	"camping-simulator/backend/internal/model"
)

var ErrNotFound = errors.New("save not found")

type FileStore struct {
	dir string
	mu  sync.RWMutex
}

func NewFileStore(dir string) (*FileStore, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}
	return &FileStore{dir: dir}, nil
}

func (s *FileStore) path(id string) string {
	return filepath.Join(s.dir, id+".json")
}

func newID() string {
	buf := make([]byte, 8)
	_, _ = rand.Read(buf)
	return hex.EncodeToString(buf)
}

func (s *FileStore) List() ([]model.SaveMeta, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	entries, err := os.ReadDir(s.dir)
	if err != nil {
		return nil, err
	}

	metas := make([]model.SaveMeta, 0, len(entries))
	for _, e := range entries {
		if e.IsDir() || filepath.Ext(e.Name()) != ".json" {
			continue
		}
		data, err := os.ReadFile(filepath.Join(s.dir, e.Name()))
		if err != nil {
			continue
		}
		var rec model.SaveRecord
		if err := json.Unmarshal(data, &rec); err != nil {
			continue
		}
		metas = append(metas, rec.Meta())
	}

	sort.Slice(metas, func(i, j int) bool {
		return metas[i].UpdatedAt.After(metas[j].UpdatedAt)
	})
	return metas, nil
}

func (s *FileStore) Get(id string) (*model.SaveRecord, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	data, err := os.ReadFile(s.path(id))
	if errors.Is(err, os.ErrNotExist) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	var rec model.SaveRecord
	if err := json.Unmarshal(data, &rec); err != nil {
		return nil, err
	}
	return &rec, nil
}

// Upsert creates a new save (when id is empty) or overwrites an existing one.
func (s *FileStore) Upsert(id, name string, state json.RawMessage) (*model.SaveRecord, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if id == "" {
		id = newID()
	}
	rec := model.SaveRecord{
		ID:        id,
		Name:      name,
		UpdatedAt: time.Now().UTC(),
		State:     state,
	}
	data, err := json.Marshal(rec)
	if err != nil {
		return nil, err
	}
	if err := os.WriteFile(s.path(id), data, 0o644); err != nil {
		return nil, err
	}
	return &rec, nil
}

func (s *FileStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	err := os.Remove(s.path(id))
	if errors.Is(err, os.ErrNotExist) {
		return ErrNotFound
	}
	return err
}
