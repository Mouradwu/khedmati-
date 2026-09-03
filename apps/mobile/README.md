# apps/mobile — Phase 2

Non démarré dans cette livraison. Prévu conformément à la section 43 :

- **React Native + Expo**, Android + iOS.
- Consomme la même API NestJS (`apps/api`) que `apps/web` — aucune logique
  métier dupliquée, tout passe par `/api/v1/*`.
- Écrans prioritaires pour un premier MVP mobile : accueil (recherche +
  catégories), création de demande (texte libre + photos), suivi de
  statut de demande, chat post-acceptation, profil artisan (inscription +
  édition + galerie).
- Réutiliser `packages/types` et `packages/i18n` pour partager les types
  d'API et les traductions FR/AR avec `apps/web`.
