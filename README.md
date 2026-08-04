# Camping Manager

Jeu de gestion de camping en 2D isométrique, inspiré de *Camp Manager
Simulator* et des jeux de type *RollerCoaster Tycoon*. React + TypeScript +
Vite, 100% frontend (aucun serveur requis). Interface disponible en français
et en anglais, optimisée pour mobile (tactile, pincer-zoomer, glisser).

## Structure

```
camping_simulator/
└── frontend/   React + TypeScript + Vite, rendu isométrique en canvas 2D
```

## Démarrage rapide

```bash
cd frontend
npm install
npm run dev
```

Ouvre `http://localhost:5173`. La partie est sauvegardée automatiquement dans
le navigateur (`localStorage`) : rafraîchir la page, changer l'orientation de
l'écran ou fermer l'onglet ne fait pas perdre la progression.

### Avec Docker

```bash
cp .env.example .env   # optionnel, pour personnaliser le port
docker compose up --build
```

Ouvre ensuite `http://localhost:8080` (port configurable via `HOST_PORT` dans
`.env`, voir `.env.example`). Pour arrêter : `docker compose down`.

## Gameplay

- **Terrain** : peindre herbe / sable / route.
- **Emplacements** : tente, caravane, mobil-home, chalet — génèrent des revenus
  quand ils sont occupés par des campeurs.
- **Équipements** : accueil, sanitaires, piscine, épicerie, restaurant, aire de
  jeux, laverie, location de vélos, mini-golf, scène de spectacle — augmentent
  la satisfaction et attirent des campeurs.
- **Décoration** : arbres, parterres de fleurs, bancs, feu de camp, lampadaires.
- **Personnel** : agent d'entretien, réceptionniste, maître-nageur — salaire
  quotidien contre bonus de satisfaction.
- **Tarification** : un curseur de prix (50%–200%) permet d'arbitrer entre
  revenu par client et niveau de demande/satisfaction.
- **Statistiques** (📊 dans la barre du haut) : historique de la trésorerie,
  de la satisfaction et du taux d'occupation, détail des revenus/dépenses du
  dernier jour.
- **Simulation** : la demande de campeurs dépend de la saison (haute saison en
  été, quasi nulle en hiver), de la satisfaction du camping, du nombre
  d'équipements et du prix pratiqué. Trésorerie négative prolongée (14 jours)
  → faillite.
- **Vitesse** : pause / normal / rapide / très rapide.
- **Sauvegarde** : automatique en continu, plus des emplacements de sauvegarde
  nommés (💾) pour garder plusieurs parties.
- **Vie du camping** : les campeurs des emplacements occupés se promènent
  dans le camping (animation légère, désactivée automatiquement s'il n'y a
  personne à animer).

## Contrôles

- **Souris** : clic-glisser pour déplacer la caméra, molette pour zoomer,
  clic pour construire / peindre / démolir selon l'outil actif.
- **Tactile (mobile)** : un doigt pour glisser la caméra (mode sélection) ou
  construire/peindre en continu (autres outils), deux doigts pour
  pincer-zoomer et déplacer la caméra simultanément.

## Notes techniques

- Rendu isométrique en `<canvas>` 2D natif (pas de dépendance de rendu
  externe) : chaque bâtiment a une illustration dédiée (tente, caravane,
  piscine, feu de camp, etc.) plutôt qu'un simple cube coloré. Repaint piloté
  par les changements d'état ; une boucle d'animation légère ne s'active que
  lorsque des campeurs se déplacent, pour préserver la batterie sur mobile.
- État du jeu géré avec Zustand, persisté automatiquement en `localStorage`
  (middleware `persist`) ; la logique économique (`simulateDay`) est une
  fonction pure testable indépendamment du store.
- i18n via `react-i18next`, détection automatique de la langue du navigateur,
  bascule manuelle FR/EN dans la barre du haut.
- Aucun backend : toutes les données restent dans le navigateur de
  l'utilisateur.

## Docker

- `frontend/Dockerfile` : build Vite multi-étapes puis image `nginx:alpine`
  servant les fichiers statiques.
- `docker-compose.yml` : lance le conteneur, paramétrable via `.env` (copier
  `.env.example`) — port exposé (`HOST_PORT`), nom/tag de l'image
  (`IMAGE_NAME`, `IMAGE_TAG`).

## CI/CD

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) tourne à
chaque commit (push sur n'importe quelle branche, et pull requests) : `npm
ci`, lint (`oxlint`), typecheck + build (`tsc -b && vite build`). Il sert de
garde-fou avant merge ; il ne publie rien.

Le workflow [`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml)
construit et publie l'image Docker sur GitHub Container Registry (GHCR) à
chaque push d'un tag de version (ex. `1.2`, `1.2.3`, `v1.0.0`) :

- `ghcr.io/<owner>/<repo>:<tag>` et `:latest`

```bash
git tag 1.0.0
git push origin 1.0.0
```

Déclenchable aussi manuellement depuis l'onglet *Actions* de GitHub
(`workflow_dispatch`). Aucun secret à configurer : l'authentification à GHCR
utilise le `GITHUB_TOKEN` fourni automatiquement par Actions (le dépôt doit
autoriser les *packages* en écriture dans ses paramètres si ce n'est pas déjà
le cas).

## Publier sur GitHub Pages

L'application est 100% statique (pas de backend), elle se prête donc
parfaitement à un hébergement gratuit sur GitHub Pages.

1. **Pousser le code sur GitHub** si ce n'est pas déjà fait :
   ```bash
   git remote add origin https://github.com/<votre-compte>/<votre-repo>.git
   git push -u origin main
   ```
2. **Activer Pages** : dans le dépôt GitHub, aller dans *Settings → Pages*, et
   sous *Build and deployment → Source*, choisir **GitHub Actions** (pas
   "Deploy from a branch").
3. **Déclencher le déploiement** : le workflow
   [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
   se lance automatiquement à chaque push sur `main` (et peut aussi être
   lancé manuellement depuis l'onglet *Actions*). Il build le frontend avec
   le bon chemin de base (`/<nom-du-repo>/`, déduit automatiquement du nom du
   dépôt) puis publie `frontend/dist` sur Pages.
4. Une fois le workflow terminé (onglet *Actions*), le site est disponible à
   l'adresse indiquée dans *Settings → Pages*, généralement :
   `https://<votre-compte>.github.io/<votre-repo>/`.

Aucune configuration supplémentaire n'est nécessaire : le chemin de base
(`BASE_PATH`) est calculé automatiquement par le workflow à partir du nom du
dépôt (`vite.config.ts` le lit via `process.env.BASE_PATH`, avec `/` comme
valeur par défaut pour le développement local et Docker). Si le dépôt est
renommé, il suffit de relancer le workflow.
