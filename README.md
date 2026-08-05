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
- **Déplacement d'objets** (✋) : reprendre un bâtiment déjà posé et le
  glisser vers un nouvel emplacement libre, sans avoir à le démolir/reconstruire.
- **Mode Info** (ℹ️) : toucher/cliquer un bâtiment existant affiche un panneau
  détaillé (catégorie, coût, revenu, entretien, satisfaction, statut
  d'occupation) avec accès rapide à Déplacer/Démolir. Le mode Sélection sert
  uniquement à naviguer sur la carte.
- **Météo** : ensoleillé / nuageux / pluie / orage, tirée chaque jour selon la
  saison ; influence la demande et la satisfaction (pluie visible à l'écran).
- **Événements spéciaux** (⚡ dans les statistiques) : déclencher incendie,
  tornade ou éruption volcanique — détruit des bâtiments au hasard autour d'un
  épicentre visible sur la carte (fumée, tourbillon, lave selon l'événement),
  fait chuter la satisfaction et réduit la demande pendant quelques jours.
- **Journal de bord** (📜) : historique horodaté de toutes les actions
  (constructions, démolitions, déplacements, personnel, emprunts,
  remboursements, campagnes marketing, catastrophes, faillite).
- **Banque** : emprunter jusqu'à 6000 €, avec intérêts (2 %/jour) qui
  s'accumulent sur la dette jusqu'au remboursement.
- **Marketing** : lancer une campagne payante pour booster temporairement la
  demande.
- **Annuler/Rétablir** (↩️/↪️, ou Ctrl+Z / Ctrl+Y) : toutes les actions du
  joueur (construction, démolition, déplacement, peinture de terrain,
  personnel, emprunt, marketing, catastrophe) sont annulables/rétablissables.
- **Vie du camping** : les campeurs des emplacements occupés se promènent
  dans le camping et s'arrêtent parfois pour une activité (baignade à la
  piscine, assis au coin du feu ou au restaurant, jeu à l'aire de jeux/au
  mini-golf/à la scène) ; feu de camp et piscine ont une animation continue
  (flammes, reflets de l'eau) ; nuages qui dérivent en fond. Tout cela reste
  désactivé tant qu'il n'y a rien à animer (ni campeurs, ni pluie, ni feu de
  camp/piscine construits), pour préserver la batterie.

## Contrôles

- **Souris** : clic-glisser pour déplacer la caméra, molette pour zoomer,
  clic pour construire / démolir selon l'outil actif, glisser-déposer pour
  déplacer un objet en mode ✋.
- **Tactile (mobile)** : un doigt pour glisser la caméra (mode sélection) ou
  agir avec l'outil actif (un seul objet posé par geste, pour éviter d'en
  placer plusieurs par erreur en glissant le doigt — peinture de terrain et
  démolition restent à glisser-continu), deux doigts pour pincer-zoomer et
  déplacer la caméra simultanément. Un bouton ✕ apparaît en haut à droite du
  plan pour quitter rapidement l'outil actif.

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
