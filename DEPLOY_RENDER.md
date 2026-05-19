# Deploy Scholar Tech to Render.com (Free Tier)

## Prerequisites
- GitHub repo with Dockerfiles/docker-compose
- Render.com account (free)

## 1. Backend Deploy
1. render.com → New → Web Service
2. Connect GitHub repo
3. Docker (build: Dockerfile)
4. Env vars:
```
DB_HOST=... (PostgreSQL internal URL)
DB_NAME=scholar_tech_db
DB_USER=postgres
DB_PASSWORD=...
JWT_SECRET=superlongsecret
CORS_ORIGIN=https://your-frontend.onrender.com
PORT=10000  # Render default
NODE_ENV=production
EMAIL_HOST=smtp.ethereal.email
```
5. Create Postgres DB (New PostgreSQL):
  - External DB URL → Backend env DB_CONNECTION_STRING → parse to DB_HOST etc.

## 2. Frontend Deploy
1. New → Static Site
2. Connect repo
3. Root: frontend/
4. Build: npm install && npm run build
5. Publish: dist/
6. Env CORS_ORIGIN=backend.onrender.com

## 3. Custom Domain (Optional)
- Render dashboard → Custom Domains
- Add yourdomain.com
- SSL auto

## 4. Test
- Backend: /api/health
- Frontend: yoursite.onrender.com (proxy /api)
- Pgadmin local docker compose or Render logs

**Cost:** Free (0.5GB RAM, sleep idle).

**Next:** Push GitHub → auto deploy.

docker compose up test local first!
