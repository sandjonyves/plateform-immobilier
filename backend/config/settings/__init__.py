"""
Point d'entrée des settings Django.

Par défaut, charge la configuration de développement.
En production, définir DJANGO_SETTINGS_MODULE=config.settings.production.
"""

from .development import *  # noqa: F401, F403
