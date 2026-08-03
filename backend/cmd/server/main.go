package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"camping-simulator/backend/internal/api"
	"camping-simulator/backend/internal/store"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8787"
	}
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		dataDir = "./data/saves"
	}

	st, err := store.NewFileStore(dataDir)
	if err != nil {
		log.Fatalf("could not initialize save store: %v", err)
	}

	handler := api.NewRouter(st)

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	log.Printf("Camping Manager API listening on :%s (data dir: %s)", port, dataDir)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
