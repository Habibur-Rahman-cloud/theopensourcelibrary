# Deploy: Cloudflare Pages + Railway

Stack: **React (Vite)** on Cloudflare Pages · **Django REST** on Railway · Domain **`theopensourcelibrary.com`** · API **`api.theopensourcelibrary.com`**.

## 1. Railway (backend)

1. Push this repo to GitHub.
2. [Railway](https://railway.app) → **New Project** → **Deploy from GitHub** → select repo.
3. **Settings → Root Directory** → `backend` (folder with `manage.py`).
4. **New** → **Database** → **PostgreSQL** (attaches `DATABASE_URL`).
5. **Variables** (example production values):

| Variable | Value |
|----------|--------|
| `DEBUG` | `False` |
| `SECRET_KEY` | Long random string (50+ characters) |
| `ALLOWED_HOSTS` | `api.theopensourcelibrary.com,.up.railway.app` |
| `CORS_ALLOWED_ORIGINS` | `https://theopensourcelibrary.com,https://www.theopensourcelibrary.com` |
| `CSRF_TRUSTED_ORIGINS` | `https://api.theopensourcelibrary.com` |
| `FRONTEND_URL` | `https://theopensourcelibrary.com` |
| `DATABASE_URL` | *(injected by Postgres plugin)* |
| `EMAIL_HOST_USER` | *(optional)* |
| `EMAIL_HOST_PASSWORD` | *(optional)* |
| `DEFAULT_FROM_EMAIL` | *(optional)* |

6. **Settings → Networking → Custom Domain** → `api.theopensourcelibrary.com`. Add the **CNAME** Railway shows in **Cloudflare** DNS for `api`.
7. **Deploy**: `Procfile` runs migrate → collectstatic → gunicorn.

Local backend still works with `DEBUG=True` in `backend/.env` (see `backend/.env.example`).

## 2. Cloudflare Pages (frontend)

1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → Connect Git.
2. **Root directory**: `frontend`.
3. **Build**:

| Setting | Value |
|---------|--------|
| Build command | `npm ci && npm run build` |
| Build output directory | `dist` |

4. **Environment variables (Production)**:

| Name | Value |
|------|--------|
| `NODE_VERSION` | `20` |
| `VITE_API_BASE` | `https://api.theopensourcelibrary.com/api/` |

5. **Custom domains**: add `theopensourcelibrary.com` and `www.theopensourcelibrary.com` (Pages will show DNS/CNAME targets).
6. Use **one canonical URL**; add a redirect rule in Cloudflare from `www` → apex or the reverse.

## 3. DNS (Cloudflare)

| Type | Name | Target |
|------|------|--------|
| CNAME | `api` | Railway hostname for the web service |
| CNAME | `@` or `www` | As instructed by Cloudflare Pages |

SSL: **Full (strict)** once origins have valid certificates.

## 4. After deploy

- Open `https://api.theopensourcelibrary.com/api/categories/` (JSON).
- Open `https://theopensourcelibrary.com` and confirm Network tab calls the API domain (not localhost).
- Test PDFs/covers, newsletter, book request, admin.

## 5. First-time production database

Railway Postgres is empty: run **migrations** (done on deploy) then create a **superuser** via Railway **Shell**:

```bash
python manage.py createsuperuser
```

Re-upload media (covers/PDFs) via admin if you were using local SQLite before.
