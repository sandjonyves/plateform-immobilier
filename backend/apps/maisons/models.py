"""
Modèle Maison — aligné sur MaisonPlain du frontend.
"""

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel


class Maison(UUIDModel, TimeStampedModel):
    """Bien immobilier bâti (villa, appartement, etc.)."""

    class Type(models.TextChoices):
        VILLA = 'villa', 'Villa'
        APPARTEMENT = 'appartement', 'Appartement'
        DUPLEX = 'duplex', 'Duplex'
        STUDIO = 'studio', 'Studio'
        BUREAU = 'bureau', 'Bureau'

    class Statut(models.TextChoices):
        DISPONIBLE = 'disponible', 'Disponible'
        LOUE = 'loue', 'Loué'
        VENDU = 'vendu', 'Vendu'
        EN_TRAVAUX = 'en_travaux', 'En travaux'
        ARCHIVE = 'archive', 'Archivé'

    titre = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=Type.choices, db_index=True)
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.DISPONIBLE,
        db_index=True,
    )
    prix = models.DecimalField(max_digits=15, decimal_places=0)
    ville = models.ForeignKey(
        'villes.Ville',
        on_delete=models.PROTECT,
        related_name='maisons',
        db_index=True,
    )
    quartier = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    surface_m2 = models.FloatField()
    surface_terrain_m2 = models.FloatField(null=True, blank=True)
    chambres = models.PositiveIntegerField(default=0)
    salles_de_bain = models.PositiveIntegerField(default=0)
    etages = models.PositiveIntegerField(default=1)
    latitude = models.FloatField()
    longitude = models.FloatField()
    titre_foncier = models.CharField(max_length=100, blank=True)

    photos = models.JSONField(default=list, blank=True)
    videos = models.JSONField(default=list, blank=True)
    documents = models.JSONField(default=list, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='maisons_creees',
    )
    date_ajout = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = 'Maison'
        verbose_name_plural = 'Maisons'
        ordering = ['-date_ajout']
        indexes = [
            models.Index(fields=['type', 'statut']),
            models.Index(fields=['ville', 'statut']),
        ]

    def __str__(self) -> str:
        return f'{self.titre} ({self.type})'

    def save(self, *args, **kwargs):
        if not self.titre or not str(self.titre).strip():
            raise ValueError('Le titre est obligatoire.')
        if self.prix is not None and self.prix <= 0:
            raise ValueError('Le prix doit être positif.')
        if self.surface_m2 is not None and self.surface_m2 <= 0:
            raise ValueError('La surface doit être positive.')
        if not -90 <= float(self.latitude) <= 90:
            raise ValueError('Latitude invalide.')
        if not -180 <= float(self.longitude) <= 180:
            raise ValueError('Longitude invalide.')
        super().save(*args, **kwargs)

    def archiver(self) -> 'Maison':
        if self.statut == self.Statut.ARCHIVE:
            raise ValueError('Cette maison est déjà archivée.')
        self.statut = self.Statut.ARCHIVE
        self.save(update_fields=['statut', 'updated_at'])
        return self
