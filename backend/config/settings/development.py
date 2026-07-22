"""
Settings de développement.

Active le mode DEBUG, CORS permissif et SQLite par défaut si USE_SQLITE n'est
pas explicitement défini à False avec une config PostgreSQL.
"""

from .base import *  # noqa: F401, F403
from .base import env

DEBUG = True

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1', '0.0.0.0'])

# Origines frontend TanStack / Vite en local (ports 8080, 5173, 3000)
CORS_ALLOWED_ORIGINS = env.list(
    'CORS_ALLOWED_ORIGINS',
    default=[
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],
)
# En DEBUG uniquement : évite les blocages CORS (LAN / IP locale)
CORS_ALLOW_ALL_ORIGINS = True

# En dev, SQLite par défaut pour démarrer sans Docker.
if env('USE_SQLITE', default=True):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',  # noqa: F405
        }
    }
