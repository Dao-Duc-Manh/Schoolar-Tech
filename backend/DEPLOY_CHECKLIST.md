# Phase 5 Deploy Checklist

## Local Docker
- [ ] `docker compose up --build -d`
- [ ] `docker compose logs backend`
- [ ] localhost:3000/api/health ✅
- [ ] localhost (frontend) ✅
- [ ] pgadmin localhost:5050 (admin/admin)

## GitHub CI
- [ ] Push main → Actions tab run test/Docker
- [ ] Add secrets DOCKERHUB_USERNAME TOKEN

## Render Deploy
- [ ] render.com account
- [ ] New PostgreSQL → Internal DB URL
- [ ] New Web Service backend (Docker repo) env vars DB_*
- [ ] New Static Site frontend
- [ ] Custom domain optional

## Monitoring
- [ ] Render logs/metrics
- [ ] Sentry.io DSN env (optional)

## Production Ready
- [ ] .env.prod template
- [ ] SSL auto
- [ ] Backups cron Postgres

`docker compose up` test now!
