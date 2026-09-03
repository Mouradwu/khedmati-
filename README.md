# KHEDMATI — خدمتي

> Plateforme intelligente de mise en relation Clients ↔ Artisans ↔ Professionnels en Algérie.
> خدمتك قريبة ليك

Ce dépôt implémente les fondations techniques du cahier des charges KHEDMATI :
un schéma de données complet, une API NestJS fonctionnelle centrée sur la
**validation par appel** (la règle de confiance centrale de la plateforme),
et une homepage Next.js. Il est structuré pour que les prochaines phases
(mobile, téléphonie réelle, IA, paiements) s'ajoutent **sans réécriture**.

## Ce qui est réellement implémenté (pas des écrans fictifs)

| Domaine | État | Détail |
|---|---|---|
| Schéma de données | ✅ Complet | `packages/database/prisma/schema.prisma` — ~50 modèles, toutes les machines à états du cahier des charges |
| Taxonomie métiers | ✅ Fonctionnel | CRUD admin + recherche multilingue (FR/AR/darija/arabizi) avec repli trigramme |
| Auth | ✅ Fonctionnel | Inscription sans blocage téléphonique, JWT, bcrypt |
| Demandes client | ✅ Fonctionnel | Machine à états stricte — **aucune publication automatique** |
| Offres artisan | ✅ Fonctionnel | Même principe de validation obligatoire |
| **Centre d'appels KHEDMATI** | ✅ Fonctionnel | File de priorité, tentatives, callback, résolution → répercussion automatique sur demandes/offres |
| Moteur de matching | ✅ Fonctionnel | Score pondéré configurable (poids en base, pas en dur) |
| Géolocalisation | ✅ Fonctionnel | Distance Haversine, recherche "autour de moi" |
| Réputation | ✅ Fonctionnel | Avis + recalcul de moyenne |
| Messagerie | ✅ Fonctionnel | Déverrouillée seulement après acceptation |
| Facturation | ✅ Architecture prête, **désactivée** | `PAYMENTS_ENABLED=false` par défaut |
| Homepage web | ✅ Fonctionnelle | Recherche live, dictée vocale, grille de catégories |
| Dashboard admin (API) | ✅ Fonctionnel | Statistiques ; **interface visuelle non construite** |
| Mobile (Expo) | ❌ Phase 2 | Voir `apps/mobile/README.md` |
| Téléphonie réelle (IVR) | ❌ Phase 2 | `Call.providerName` prévu pour rester interchangeable |
| IA de compréhension du besoin | ❌ Phase 2 | Champs `structuredSummary` / `aiConfidence` déjà en base, prêts à être remplis |

## Démarrage rapide

```bash
# 1. Dépendances
npm install

# 2. Base de données locale (Postgres + Redis + MinIO)
docker compose up -d

# 3. Config
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 4. Prisma
npm run db:generate
npm run db:migrate    # crée les tables
npm run db:seed       # taxonomie initiale + config de matching

# 5. Lancer API + Web
npm run api:dev        # http://localhost:4000/api/v1
npm run web:dev         # http://localhost:3000
```

## Un exemple concret du flux central

```bash
# Un client soumet une demande — jamais publiée automatiquement
POST /api/v1/requests
{ "rawDescription": "Fuite d'eau sous l'évier", "urgency": "HIGH" }
# → status: CALL_PENDING, un ValidationCase est créé

# Un opérateur (rôle OPERATOR) traite la file
GET  /api/v1/validation/queue
POST /api/v1/validation/cases/:id/start-call
POST /api/v1/validation/calls/:callId/resolve
{ "outcome": "VALIDATED", "summary": "Confirmé par téléphone" }
# → la demande passe automatiquement à VALIDATED

# Publication explicite (jamais implicite)
POST /api/v1/validation/publish { "serviceRequestId": "..." }

# Matching
POST /api/v1/matching/requests/:id/run
```

## Notes de vérification (honnêteté sur ce qui a été testé ici)

Ce projet a été construit dans un environnement sandbox dont le pare-feu
sortant n'autorise qu'une liste restreinte de domaines (npm, GitHub...).
Deux outils ont donc été **impossibles à exécuter tels quels** dans cet
environnement, sans que cela révèle un défaut du code :

- **`prisma generate`** échoue ici car il télécharge son moteur binaire
  depuis `binaries.prisma.sh`, hors-liste. J'ai vérifié la cohérence du
  schéma à la main (noms de relations ambiguës, clés composées utilisées
  dans le code) puis reconstitué localement le *pattern exact* que Prisma
  génère pour ses enums (objet `const` + type dérivé par `typeof`, pas un
  `enum` TypeScript natif) pour faire tourner `tsc --noEmit` sur toute
  l'API : **0 erreur**. Chez toi (accès réseau complet), `npm run
  db:generate` fonctionnera normalement.
- **`next build`** échoue ici car `next/font/google` télécharge les
  polices depuis `fonts.googleapis.com`, hors-liste également. Le build a
  été validé avec des polices système temporaires (✅ compilation, typage
  et génération statique réussis), puis les vraies polices (Fraunces,
  Manrope, Noto Kufi Arabic) ont été restaurées pour la livraison — elles
  se chargeront normalement dans ton environnement.

Autrement dit : le code a été vérifié aussi loin que le sandbox le
permettait, mais je n'ai pas pu faire tourner l'API contre une vraie base
Postgres ici (pas de serveur Postgres démarré dans ce sandbox non plus).
À faire de ton côté avant mise en production : lancer `docker compose up`,
exécuter les migrations, et tester le flux ci-dessus de bout en bout.

## Structure

```text
khedmati/
├── apps/
│   ├── api/      NestJS — cœur métier (voir tableau ci-dessus)
│   ├── web/      Next.js — homepage (section 50)
│   ├── mobile/   Phase 2 — React Native/Expo
│   └── admin/    Phase 2 — interface visuelle (API déjà prête)
├── packages/
│   ├── database/ Schéma Prisma + seed
│   ├── shared/   Utilitaires communs (à peupler)
│   ├── types/    Types d'API partagés frontend
│   └── i18n/     Emplacement des dictionnaires FR/AR (section 51)
├── infrastructure/
│   └── docker/   (docker-compose.yml à la racine)
└── docs/
    └── ARCHITECTURE.md
```

## Prochaines étapes suggérées, par ordre de valeur

1. **Brancher un vrai fournisseur de téléphonie** derrière `Call.providerName`
   (le code de `ValidationService` n'a rien à changer, seul un adaptateur
   à écrire).
2. **Construire l'écran opérateur** (`apps/admin`) — l'API existe déjà en
   entier (section précédente).
3. **App mobile Expo** consommant la même API.
4. **Brancher un LLM** pour remplir `structuredSummary` / `aiConfidence`
   sur `ServiceRequest` avant l'appel de validation (section 52) — l'IA ne
   doit jamais publier elle-même, seulement préparer le travail de
   l'opérateur.
5. Activer `PAYMENTS_ENABLED=true` et peupler la table `Plan` quand le
   moment sera venu (section 33-37) — aucune migration nécessaire.
