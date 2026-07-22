# plateform-immobilier

Plateforme immobilière Immopro Central — vente de terrains et de maisons.

## Structure

- `frontend/` — application web (React / TanStack)
- `backend/` — API Django REST

## Démarrage rapide

### Backend

```bash
cd backend
source env/bin/activate
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
