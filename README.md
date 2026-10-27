# Projet Genesis

## Description

Ce projet a pour but de créer une application web permettant de créer, intéragir et réutiliser des fiches de personnage dans le cadre de jeux de rôle. L'application est destinée à être utilisée par des maîtres de jeu. Elle est réalisée de le cadre du travail de Bachelor de la HES-SO de Genève en informatique de gestion de Enzo Jolidon Marte et suivi par le directeur de mémoire M. Keller.

## Technologies utilisées

- Frontend: React
- Backend: Next.js
- Base de données: PostgreSQL
- Déploiement: Vercel & Docker

## Installation

### Prérequis

- Node.js 20.0.0 ou ultérieur
- pnpm 8.11.0 ou ultérieur
- Git 2.33.0 ou ultérieur
- Avoir un base de données PostgreSQL

### Instructions

1. Cloner le dépôt

```bash
git clone https://github.com/Tayasaki/projet-genesis.git
```

2. Installer les dépendances

```bash
pnpm install
```

3. Copier `.env.example` vers `.env` à la racine du projet et renseigner les variables d'environnement suivantes

```typescript
DATABASE_URL = "postgresql://user:password@localhost:5432/database";

BETTER_AUTH_URL = "http://localhost:3000";
BETTER_AUTH_SECRET = "votresupersecret"; // Générer avec: openssl rand -base64 32

TRUSTED_ORIGINS = ""; // Optionnel: origines supplémentaires séparées par des virgules (ex: "http://app.dev.local:3000")

AUTH_GITHUB_ID = "votreidgithub";
AUTH_GITHUB_SECRET = "votresecretgithub";

AUTH_DISCORD_ID = "votreiddiscord";
AUTH_DISCORD_SECRET = "votresecretdiscord";

AUTH_GOOGLE_ID = "votreidgoogle";
AUTH_GOOGLE_SECRET = "votresecretgoogle";

OPENAI_API_KEY = "votreapikeyopenai"; // Optionnel
```

`Notez que les variables d'environnement pour les services d'authentification tel que GITHUB_ID, GITHUB_SECRET sont optionnelles. Vous pouvez les laisser vides si vous ne souhaitez pas les utiliser: le fournisseur correspondant n'est alors pas activé côté serveur. Les boutons de login des trois services restent toutefois affichés sur la page de connexion, et la connexion via un service non configuré échouera.`

4. Mettre à jour le schéma de la base de données

```bash
pnpx prisma migrate dev
```

> Il n'existe pas de script de seed : la base de données démarre vide. Les données de test se créent via l'application.

5. Lancer le serveur de développement

```bash
pnpm dev
```

Vous pouvez maintenant accéder à l'application à l'adresse `http://localhost:3000`

6. Lancer les tests

```bash
pnpm test        # exécution unique
pnpm test:coverage # exécution unique + seuils de couverture (lib/utils, src/actions)
pnpm test:watch  # mode watch
```

## Docker

`docker compose up --build` construit l'image de l'application depuis le `Dockerfile` du dépôt et démarre toute la pile en local : PostgreSQL, les migrations Prisma, puis l'application.

### Prérequis

- Docker avec Docker Compose v2 (`docker compose`)
- Les ports 3000 (application) et 5432 (PostgreSQL, exposé uniquement sur `127.0.0.1`) libres, ou d'autres valeurs via `APP_PORT` et `DB_PORT` dans `.env`

### 1. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Compose lit automatiquement `.env`. Renseigner au minimum :

- `BETTER_AUTH_SECRET` : générer avec `openssl rand -base64 32` (une valeur de développement par défaut est utilisée sinon, à ne jamais réutiliser ailleurs)
- les identifiants OAuth (`AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`, `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET`, `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`) : l'application n'a pas de connexion par email, il faut donc configurer au moins un fournisseur (avec `http://localhost:3000/api/auth/callback/<fournisseur>` comme URL de callback) pour pouvoir se connecter

`DATABASE_URL` est ignorée par Compose : la base est jointe via l'hôte `db`. Le mot de passe PostgreSQL de développement se change avec `POSTGRES_PASSWORD` (avant le premier démarrage, voir « Réinitialiser » ci-dessous). Si vous changez le port avec `APP_PORT`, adaptez aussi `BETTER_AUTH_URL`.

### 2. Lancer la pile

```bash
docker compose up --build
```

Ordre de démarrage : `db` (attend `pg_isready`) → `migrate` (exécute `prisma migrate deploy` avec les migrations du dépôt, puis s'arrête) → `app`.

L'application est accessible à l'adresse `http://localhost:3000`

### 3. Arrêter et réinitialiser

```bash
docker compose down        # arrête les conteneurs, conserve la base de données
docker compose down -v     # arrête et supprime aussi la base de données (volume db-data)
```

## Troubleshooting

A noter qu'il faut bien veiller à ce que les ports 3000 et 5432 ne soient pas déjà utilisés par une autre application (sinon définir `APP_PORT` / `DB_PORT` dans `.env`). Après modification du code, relancer `docker compose up --build` pour reconstruire l'image.
