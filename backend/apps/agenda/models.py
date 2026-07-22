"""
Événements d'agenda — alignés sur Evenement du frontend.
Types : visite | signature | reunion
"""

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel


class Evenement(UUIDModel, TimeStampedModel):
    class Type(models.TextChoices):
        VISITE = 'visite', 'Visite'
        SIGNATURE = 'signature', 'Signature'
        REUNION = 'reunion', 'Réunion'

    titre = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=Type.choices, db_index=True)
    date = models.DateField(db_index=True)
    heure = models.TimeField()
    lieu = models.CharField(max_length=255, blank=True)
    # Noms libres comme le frontend (CSV → list) ; M2M optionnel via participants_users
    participants = models.JSONField(default=list, blank=True)
    participants_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='evenements',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='evenements_crees',
    )

    class Meta:
        verbose_name = 'Événement'
        verbose_name_plural = 'Événements'
        ordering = ['date', 'heure']

    def __str__(self) -> str:
        return f'{self.titre} ({self.date} {self.heure})'
