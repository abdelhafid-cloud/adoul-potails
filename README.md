# Adoul AI

Plateforme SaaS professionnelle pour les adouls marocains — gestion de dossiers, calculs d'héritage, assistant IA et génération de documents.

## Stack

| Couche | Technologies |
|--------|-------------|
| Frontend | Next.js 15, TypeScript, Tailwind, Shadcn UI, React Query, Zustand |
| Backend | Flask, SQLAlchemy, PostgreSQL, JWT, Celery, Redis |
| IA | OpenAI, LangChain, Qdrant, OCR, RAG |
| Infra | Docker, Nginx, GitHub Actions |

## Démarrage rapide

```bash
# Copier les variables d'environnement
cp .env.example .env

# Lancer tous les services
docker compose up -d

# Migrations
docker compose exec backend flask db upgrade

# Frontend (dev local)
cd frontend && npm install && npm run dev

# Backend (dev local — Python 3.12 recommandé, compatible Docker)
cd backend
py -3.12 -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
flask run
```

## URLs

- Frontend : http://localhost:3000
- API : http://localhost:5000/api/v1
- Swagger : http://localhost:5000/api/v1/docs

## Structure

```
adoulportail/
├── frontend/          # Next.js App Router
├── backend/           # Flask REST API
├── nginx/             # Reverse proxy
├── docker-compose.yml
└── .github/workflows/
```

## Rôles

- **Super Admin** — Administration globale
- **Cabinet Owner** — Gestion du cabinet
- **Adoul** — Fonctionnalités métier
- **Assistant** — Permissions limitées

## Licence

Propriétaire — Tous droits réservés.
