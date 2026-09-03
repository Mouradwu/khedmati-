# apps/admin — Phase 2 (interface)

Le **backend** du dashboard admin existe déjà et est fonctionnel :
- `GET /api/v1/admin/stats` (apps/api/src/admin) — statistiques (section 38).
- `GET/POST /api/v1/categories/*` — gestion de la taxonomie (section 12).
- `GET /api/v1/validation/queue` + endpoints associés — centre d'appels
  (section 39), déjà utilisable via n'importe quel client HTTP/Postman.

Il manque l'**interface visuelle** pour les opérateurs et administrateurs.
Deux options pour la suite, sans changement d'API :
1. Une app Next.js séparée ici (`apps/admin`), déployée indépendamment de
   `apps/web` avec ses propres droits d'accès.
2. Des routes protégées (`/admin/*`) directement dans `apps/web`.

Recommandation : commencer par l'écran "file d'appels" (section 39) qui
consomme directement `GET /validation/queue`, `POST /validation/cases/:id/start-call`
et `POST /validation/calls/:callId/resolve` — c'est l'écran qui a le plus
de valeur immédiate pour l'équipe KHEDMATI.
