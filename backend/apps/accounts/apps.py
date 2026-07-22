from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """Gestion des utilisateurs Immopro (admin / client)."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    label = 'accounts'
    verbose_name = 'Comptes'

    def ready(self):
        # Enregistre les signaux (dernière connexion, etc.)
        from . import signals  # noqa: F401
