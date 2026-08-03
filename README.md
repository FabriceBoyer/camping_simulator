# Camping Manager

Jeu de gestion de camping en 2D isométrique, inspiré de *Camp Manager Simulator*
et des jeux de type *RollerCoaster Tycoon*. Frontend React + TypeScript + Vite,
backend Go pour la sauvegarde des parties. Interface disponible en français et
en anglais, optimisée pour mobile (tactile, pincer-zoomer, glisser).

## Structure

```
camping_simulator/
├── frontend/   React + TypeScript + Vite, rendu isométrique en canvas 2D
└── backend/    API Go (stdlib net/http) pour la sauvegarde des parties
```

## Démarrage rapide

### Backend (API de sauvegarde)

```bash
cd backend
go run ./cmd/server
```

Écoute par défaut sur `:8787` (modifiable via `PORT`). Les sauvegardes sont
stockées en JSON dans `backend/data/saves/`. Aucune base de données requise.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Ouvre `http://localhost:5173`. L'URL de l'API est configurée dans
`frontend/.env` (`VITE_API_URL`, par défaut `http://localhost:8787`).

Le jeu fonctionne aussi **sans backend** : les sauvegardes locales (navigateur,
`localStorage`) restent disponibles ; seul l'onglet "sauvegardes en ligne"
affichera une erreur si le serveur Go n'est pas lancé.

### Avec Docker

```bash
docker compose up --build
```

Lance les deux services :
- `backend` : API Go, exposée sur `http://localhost:8787` (sauvegardes
  persistées dans le volume nommé `backend-data`).
- `frontend` : build de production servi par nginx sur `http://localhost:8080`,
  qui proxy les requêtes `/api/*` vers le conteneur `backend` (pas besoin de
  configurer `VITE_API_URL`, le frontend utilise un chemin relatif).

Ouvre ensuite `http://localhost:8080`. Pour arrêter : `docker compose down`
(ajouter `-v` pour aussi supprimer les sauvegardes du volume).

## Gameplay

- **Terrain** : peindre herbe / sable / route.
- **Emplacements** : tente, caravane, mobil-home, chalet — génèrent des revenus
  quand ils sont occupés par des campeurs.
- **Équipements** : accueil, sanitaires, piscine, épicerie, restaurant, aire de
  jeux, laverie — augmentent la satisfaction et attirent des campeurs.
- **Décoration** : arbres, fleurs, bancs, feu de camp.
- **Personnel** : agent d'entretien, réceptionniste, maître-nageur — salaire
  quotidien contre bonus de satisfaction.
- **Simulation** : la demande de campeurs dépend de la saison (haute saison en
  été, quasi nulle en hiver), de la satisfaction du camping et du nombre
  d'équipements. Trésorerie négative prolongée (14 jours) → faillite.
- **Vitesse** : pause / normal / rapide / très rapide.
- **Sauvegarde** : locale (navigateur) ou en ligne (serveur Go), à tout moment.

## Contrôles

- **Souris** : clic-glisser pour déplacer la caméra, molette pour zoomer,
  clic pour construire / peindre / démolir selon l'outil actif.
- **Tactile (mobile)** : un doigt pour glisser la caméra (mode sélection) ou
  construire/peindre en continu (autres outils), deux doigts pour
  pincer-zoomer et déplacer la caméra simultanément.

## Notes techniques

- Rendu isométrique en `<canvas>` 2D natif (pas de dépendance de rendu externe),
  projection classique 2:1, avec repaint piloté par les changements d'état
  (pas de boucle `requestAnimationFrame` continue) pour préserver la batterie
  sur mobile.
- État du jeu géré avec Zustand ; la logique économique (`simulateDay`) est une
  fonction pure testable indépendamment du store.
- i18n via `react-i18next`, détection automatique de la langue du navigateur,
  bascule manuelle FR/EN dans la barre du haut.
- API Go sans dépendance externe (bibliothèque standard uniquement),
  sauvegardes en fichiers JSON, CORS configurable via `ALLOWED_ORIGINS`.

## Docker

- `backend/Dockerfile` : build multi-étapes, image finale `distroless`
  (non-root, sans shell), binaire Go statique.
- `frontend/Dockerfile` : build Vite puis image `nginx:alpine` servant les
  fichiers statiques et proxyant `/api/*` vers le service `backend`.
- `docker-compose.yml` : orchestre les deux services pour un lancement local
  en une commande (voir ci-dessus).

## CI/CD

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) tourne à
chaque commit (push sur n'importe quelle branche, et pull requests) :
- **frontend** : `npm ci`, lint (`oxlint`), typecheck + build (`tsc -b && vite build`)
- **backend** : vérification du formatage (`gofmt`), `go vet`, `go build`

Il sert de garde-fou avant merge ; il ne publie rien.

Le workflow [`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml)
construit et publie les deux images sur GitHub Container Registry (GHCR)
à chaque push d'un tag de version (ex. `1.2`, `1.2.3`, `v1.0.0`) :

- `ghcr.io/<owner>/<repo>-backend:<tag>` et `:latest`
- `ghcr.io/<owner>/<repo>-frontend:<tag>` et `:latest`

Pour publier une nouvelle version :

```bash
git tag 1.0.0
git push origin 1.0.0
```

Le workflow peut aussi être déclenché manuellement depuis l'onglet *Actions*
de GitHub (`workflow_dispatch`). Aucun secret à configurer : l'authentification
à GHCR utilise le `GITHUB_TOKEN` fourni automatiquement par Actions (le dépôt
doit autoriser les *packages* en écriture dans ses paramètres si ce n'est pas
déjà le cas).
