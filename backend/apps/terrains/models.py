"""
Modèle Terrain — aligné sur TerrainPlain du frontend.

Particularités :
- bornes GPS (JSON, ≥ 3 points)
- surface_m2 calculée automatiquement
- photos ET vidéos (comme les maisons)
- created_by (admin) à la place de agent_id
"""

from django.conf import settings
from django.db import models

from apps.common.geo import calculer_surface_m2, valider_bornes
from apps.common.models import TimeStampedModel, UUIDModel


class Terrain(UUIDModel, TimeStampedModel):
    """Parcellaire / terrain à vendre."""

    class Statut(models.TextChoices):
        DISPONIBLE = 'disponible', 'Disponible'
        EN_NEGOCIATION = 'en_negociation', 'En négociation'
        VENDU = 'vendu', 'Vendu'
        ARCHIVE = 'archive', 'Archivé'

    titre = models.CharField(max_length=255)
    bornes = models.JSONField(
        help_text='Liste de {latitude, longitude} — minimum 3 points.',
    )
    surface_m2 = models.FloatField(
        editable=False,
        help_text='Surface calculée automatiquement depuis les bornes.',
    )
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
        related_name='terrains',
        db_index=True,
    )
    quartier = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    titre_foncier = models.CharField(max_length=100, blank=True)

    # Médias : listes d'URLs (upload via endpoint dédié)
    photos = models.JSONField(default=list, blank=True)
    videos = models.JSONField(default=list, blank=True)
    documents = models.JSONField(default=list, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='terrains_crees',
        verbose_name='Créé par',
    )
    date_ajout = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = 'Terrain'
        verbose_name_plural = 'Terrains'
        ordering = ['-date_ajout']
        indexes = [
            models.Index(fields=['statut', 'ville']),
            models.Index(fields=['prix']),
        ]

    def __str__(self) -> str:
        return f'{self.titre} ({self.ville.nom if self.ville_id else "—"})'

    def clean(self):
        from django.core.exceptions import ValidationError

        if not self.titre or not self.titre.strip():
            raise ValidationError({'titre': 'Le titre est obligatoire.'})
        if self.prix is not None and self.prix <= 0:
            raise ValidationError({'prix': 'Le prix doit être positif.'})
        try:
            self.bornes = valider_bornes(self.bornes or [])
        except ValueError as exc:
            raise ValidationError({'bornes': str(exc)}) from exc

    def save(self, *args, **kwargs):
        """Valide les bornes et recalcule la surface avant persistance."""
        self.bornes = valider_bornes(self.bornes or [])
        self.surface_m2 = calculer_surface_m2(self.bornes)
        if self.prix is not None and self.prix <= 0:
            raise ValueError('Le prix doit être positif.')
        if not self.titre or not str(self.titre).strip():
            raise ValueError('Le titre est obligatoire.')
        super().save(*args, **kwargs)

    def archiver(self) -> 'Terrain':
        """Passe le terrain en statut archive."""
        if self.statut == self.Statut.ARCHIVE:
            raise ValueError('Ce terrain est déjà archivé.')
        self.statut = self.Statut.ARCHIVE
        self.save(update_fields=['statut', 'updated_at'])
        return self
