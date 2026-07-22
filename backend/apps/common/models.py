"""
Mixins et modèles abstraits partagés.
"""

import uuid

from django.db import models


class TimeStampedModel(models.Model):
    """Ajoute created_at / updated_at à tous les modèles métier."""

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Créé le')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Modifié le')

    class Meta:
        abstract = True


class UUIDModel(models.Model):
    """Clé primaire UUID (alignée avec les IDs string du frontend)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True
