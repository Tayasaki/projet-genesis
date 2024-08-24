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

3. Ajouter un fichier `.env` à la racine du projet avec les variables d'environnement suivantes

```typescript
DATABASE_URL = "postgresql://user:password@localhost:5432/database";

NEXTAUTH_URL = "http://localhost:3000";
AUTH_SECRET = "votresupersecret";

AUTH_GITHUB_ID = "votreidgithub";
AUTH_GITHUB_SECRET = "votresecretgithub";

AUTH_DISCORD_ID = "votreiddiscord";
AUTH_DISCORD_SECRET = "votresecretdiscord";

AUTH_GOOGLE_ID = "votreidgoogle";
AUTH_GOOGLE_SECRET = "votresecretgoogle";

OPENAI_API_KEY = "votreapikeyopenai"; // Optionnel
```

`Notez que les variables d'environnement pour les services d'authentification tel que GITHUB_ID, GITHUB_SECRET sont optionnelles. Vous pouvez les laisser vide si vous ne souhaitez pas les utiliser mais les fonctionnalités de login pour les service en question ne seront pas disponible.`

4. Mettre à jour le schéma de la base de données

```bash
pnpx prisma migrate dev
```

5. Lancer le serveur de développement

```bash
pnpm dev
```

Vous pouvez maintenant accéder à l'application à l'adresse `http://localhost:3000`

## Docker

Dans le cadre de ce projet, une image Docker de l'application est disponible pour faciliter le déploiement. Pour lancer l'application avec Docker, suivez les instructions suivantes:

### 1. Récupérer l'image Docker depuis la registry

```bash
docker pull ghcr.io/tayasaki/projet-genesis:latest
```

### 2. Modifier les variables d'environnement si nécessaire

```yml
###...
app:
  container_name: projet-genesis-app
  image: ghcr.io/tayasaki/projet-genesis:latest
  ports:
    - 3000:3000
  command: sh -c "npx prisma db push --skip-generate && node server.js"
  environment:
    - DATABASE_URL=postgresql://postgres:mysecretpassword@db:5432/projet-genesis # Remplacer les valeurs par celles de votre base de données
    - NEXTAUTH_URL=http://localhost:3000
    - NEXTAUTH_SECRET=votresupersecret
    - AUTH_GITHUB_ID=votregithubid # Credentials pour les services d'authentification
    - AUTH_GITHUB_SECRET=votregithubsecret # Credentials pour les services d'authentification
    - AUTH_DISCORD_ID=votrediscordid # Credentials pour les services d'authentification
    - AUTH_DISCORD_SECRET=votrediscordsecret # Credentials pour les services d'authentification
###...
```

### 2. Lancer le conteneur

```bash
docker compose up
```

L'application est maintenant accessible à l'adresse `http://localhost:3000`

## Troubleshooting

A noter qu'il faut bien veilier à ce que le port 3000 ne soit pas déjà utilisé par une autre application. Aussi prenez soin de vérifier que vous aillez bien les droits pour accéder à l'image Docker dans la registry.
