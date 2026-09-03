# Décisions d'architecture

## Pourquoi une machine à états explicite plutôt que des booléens

Chaque transition de `ServiceRequest.status` et `ProfessionalOffer.status`
passe par une table `ALLOWED_TRANSITIONS` vérifiée côté serveur
(`requests.service.ts`, `offers.service.ts`). C'est délibéré : le cahier
des charges interdit explicitement la publication automatique d'une
demande (section 5, 7). Un simple champ `isPublished: boolean` aurait
permis à n'importe quel appelant de basculer l'état par erreur. La table
de transitions rend cette règle impossible à contourner par accident,
même par un futur développeur pressé.

## Pourquoi le module `validation` ne connaît pas Prisma directement pour les transitions

`ValidationService` appelle `RequestsService.transitionStatus(...)` et
`OffersService.transitionStatus(...)` plutôt que d'écrire directement en
base. Ainsi, la logique de transition valide (et donc la garantie
« jamais de publication automatique ») reste à un seul endroit, même si
demain un troisième module (ex: un futur module `phone-verification` IVR)
doit lui aussi faire avancer une demande.

## Pourquoi la taxonomie n'est jamais codée en dur

`Category` / `Profession` / `Specialty` / `Service` sont des tables, pas
des enums. Le seed (`packages/database/prisma/seed.ts`) peuple une base de
départ mais n'importe quel champ y est modifiable depuis
`/api/v1/categories` (protégé par rôle ADMIN). Le champ `synonyms: String[]`
sur `Profession` est ce qui permet à la recherche d'absorber le
multilingue (section 25) sans logique NLP lourde au MVP — un vrai moteur
NLP/IA peut être branché plus tard en complément, jamais en remplacement
de cette base structurée.

## Pourquoi la facturation existe en base mais est désactivée en code

Toutes les tables de la section 36 (`Plan`, `Subscription`, `Payment`,
`Wallet`, `Invoice`, `Coupon`, `Promotion`...) sont présentes dès ce MVP.
`BillingService.subscribe()` refuse cependant l'action tant que
`PAYMENTS_ENABLED !== "true"`. Activer la monétisation plus tard ne
nécessite donc aucune migration de schéma — seulement un changement de
configuration et le remplissage de la table `Plan`.

## Pourquoi le moteur de matching est un service, pas un job caché

`MatchingService.runMatching()` est déclenché explicitement (par un
opérateur/admin après validation, ou plus tard par un job planifié) plutôt
que déclenché automatiquement à chaque changement de statut. Cela garde
une trace explicite de qui a lancé le matching et évite les effets de bord
en cascade entre modules (`requests` → `validation` → `matching` →
`requests`...).

## Limite connue : recherche géographique en mémoire

`LocationsService.findProfessionalsNear()` charge les profils candidats
puis filtre/trie en mémoire avec la formule de Haversine. Suffisant pour
un MVP avec quelques milliers d'artisans. Au-delà, remplacer par une
requête PostGIS (`ST_DWithin` + index GiST) exécutée directement en base —
le schéma Prisma le permet déjà (voir le commentaire sur le modèle
`Location`), seul `LocationsService` aurait à changer.

## Limite connue : conversations à clé synthétique

`ConversationsService.unlockAfterAcceptance()` construit l'identifiant de
conversation par concaténation (`${requestId}_${professionalUserId}`)
plutôt que de chercher un enregistrement existant. Fonctionnel pour un
MVP à faible volume ; à remplacer par une vraie recherche
`findFirst({ where: { requestId, professionalId } })` avant mise à
l'échelle, pour éviter toute collision improbable de clé.
