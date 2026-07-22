"""
Modèle Vente — suivi métier (vente de terrains / maisons).

Aucun paiement en ligne : le montant est déclaratif (dossier),
pas un encaissement traité par la plateforme.
"""

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel


class Vente(UUIDModel, TimeStampedModel):
    """
    Dossier de vente.

    Polymorphisme bien via ``bien_type`` + ``bien_id``
    (terrain ou maison), comme le frontend.
    """

    class Type(models.TextChoices):
        VENTE = 'vente', 'Vente'

    class BienType(models.TextChoices):
        TERRAIN = 'terrain', 'Terrain'
        MAISON = 'maison', 'Maison'

    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        CONFIRMEE = 'confirmee', 'Confirmée'
        ANNULEE = 'annulee', 'Annulée'

    type = models.CharField(max_length=20, choices=Type.choices, db_index=True, default=Type.VENTE)
    bien_type = models.CharField(max_length=20, choices=BienType.choices)
    bien_id = models.UUIDField(db_index=True, help_text='ID du terrain ou de la maison.')

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='ventes_client',
        limit_choices_to={'role': 'client'},
    )
    # Admin qui a enregistré le dossier
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='ventes_creees',
    )

    montant = models.DecimalField(
        max_digits=15,
        decimal_places=0,
        help_text='Montant déclaratif du dossier (pas de paiement en ligne).',
    )
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE,
        db_index=True,
    )
    date_vente = models.DateTimeField(auto_now_add=True, db_index=True)
    documents = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Vente'
        verbose_name_plural = 'Ventes'
        ordering = ['-date_vente']
        indexes = [
            models.Index(fields=['type', 'statut']),
            models.Index(fields=['bien_type', 'bien_id']),
        ]

    def __str__(self) -> str:
        return f'{self.bien_type}:{self.bien_id} — {self.montant}'

    def save(self, *args, **kwargs):
        if self.montant is not None and self.montant <= 0:
            raise ValueError('Le montant doit être positif.')
        super().save(*args, **kwargs)
