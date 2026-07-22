from django.apps import AppConfig


class CommonConfig(AppConfig):
    """Configuration de l'app commune (pagination, exceptions, mixins)."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.common'
    label = 'common'
    verbose_name = 'Commun'
