"""Journal d'activités administrateurs (dashboard)."""

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel


class ActivityLog(UUIDModel, TimeStampedModel):
    """Action admin sur un bien (création, modification, archive)."""

    class Action(models.TextChoices):
        TERRAIN_PUBLIE = 'terrain_publie', 'Terrain publié'
        TERRAIN_MODIFIE = 'terrain_modifie', 'Terrain modifié'
        TERRAIN_ARCHIVE = 'terrain_archive', 'Terrain archivé'
        MAISON_PUBLIEE = 'maison_publiee', 'Maison publiée'
        MAISON_MODIFIEE = 'maison_modifiee', 'Maison modifiée'
        MAISON_ARCHIVEE = 'maison_archivee', 'Maison archivée'

    acteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='activites',
    )
    action = models.CharField(max_length=40, choices=Action.choices, db_index=True)
    cible_type = models.CharField(max_length=20, db_index=True)  # terrain | maison
    cible_id = models.UUIDField(db_index=True)
    message = models.CharField(max_length=255)

    class Meta:
        verbose_name = 'Activité'
        verbose_name_plural = 'Activités'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.message
