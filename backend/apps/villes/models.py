"""Référentiel des villes du Cameroun."""

from django.db import models
from django.utils.text import slugify

from apps.common.models import TimeStampedModel, UUIDModel


class Ville(UUIDModel, TimeStampedModel):
    """Ville / commune camerounaise (sélection obligatoire sur les biens)."""

    nom = models.CharField(max_length=120, unique=True, db_index=True)
    region = models.CharField(max_length=80, blank=True, db_index=True)
    slug = models.SlugField(max_length=140, unique=True)
    actif = models.BooleanField(default=True, db_index=True)

    class Meta:
        verbose_name = 'Ville'
        verbose_name_plural = 'Villes'
        ordering = ['nom']

    def __str__(self) -> str:
        return self.nom

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nom)
        super().save(*args, **kwargs)
