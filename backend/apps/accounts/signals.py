"""Signaux liés aux comptes utilisateurs."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User, UserPreference


@receiver(post_save, sender=User)
def create_user_preferences(sender, instance: User, created: bool, **kwargs):
    """Crée les préférences par défaut à l'inscription."""
    if created:
        UserPreference.objects.get_or_create(user=instance)
