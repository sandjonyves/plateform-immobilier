"""
Documents attachés aux biens ou au dossier global.

Types : contrat | titre_foncier | permis | photo | autre
"""

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel
from apps.common.validators import upload_to_medias, validate_document_file


class Document(UUIDModel, TimeStampedModel):
    class Type(models.TextChoices):
        CONTRAT = 'contrat', 'Contrat'
        TITRE_FONCIER = 'titre_foncier', 'Titre foncier'
        PERMIS = 'permis', 'Permis'
        PHOTO = 'photo', 'Photo'
        AUTRE = 'autre', 'Autre'

    class BienType(models.TextChoices):
        TERRAIN = 'terrain', 'Terrain'
        MAISON = 'maison', 'Maison'
        AUCUN = 'aucun', 'Aucun'

    nom = models.CharField(max_length=255)
    type = models.CharField(max_length=30, choices=Type.choices, db_index=True)
    fichier = models.FileField(
        upload_to=upload_to_medias,
        validators=[validate_document_file],
    )
    taille_kb = models.PositiveIntegerField(editable=False, default=0)
    bien_type = models.CharField(
        max_length=20,
        choices=BienType.choices,
        default=BienType.AUCUN,
    )
    bien_id = models.UUIDField(null=True, blank=True, db_index=True)
    bien_associe = models.CharField(
        max_length=255,
        blank=True,
        help_text='Libellé libre (compat frontend mock).',
    )
    ajoute_par = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='documents_ajoutes',
    )
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-date_ajout']

    def __str__(self) -> str:
        return self.nom

    def save(self, *args, **kwargs):
        if self.fichier:
            self.taille_kb = max(1, self.fichier.size // 1024)
        super().save(*args, **kwargs)
