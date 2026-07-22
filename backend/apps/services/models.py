"""Offres de services immobiliers (catalogue client dynamique)."""

from django.db import models
from django.utils.text import slugify

from apps.common.models import TimeStampedModel, UUIDModel


class Service(UUIDModel, TimeStampedModel):
    """Service commercial proposé aux clients (audit, vente, gestion…)."""

    class Categorie(models.TextChoices):
        AUDIT = 'audit', 'Audit & expertise'
        VENTE = 'vente', 'Vente'
        GESTION = 'gestion', 'Gestion & accompagnement'

    titre = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField()
    details = models.JSONField(
        default=list,
        blank=True,
        help_text='Liste de points clés (chaînes).',
    )
    prix_indicatif = models.CharField(max_length=120, blank=True)
    icon = models.CharField(
        max_length=60,
        default='Briefcase',
        help_text='Nom d’icône Lucide (ex. FileSearch, Home, Ruler).',
    )
    categorie = models.CharField(
        max_length=20,
        choices=Categorie.choices,
        db_index=True,
    )
    ordre = models.PositiveIntegerField(default=0, db_index=True)
    actif = models.BooleanField(default=True, db_index=True)
    phare = models.BooleanField(
        default=False,
        help_text='Affiché en avant sur la page d’accueil.',
    )

    class Meta:
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
        ordering = ['ordre', 'titre']

    def __str__(self) -> str:
        return self.titre

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.titre) or 'service'
            slug = base
            n = 1
            while Service.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                n += 1
                slug = f'{base}-{n}'
            self.slug = slug
        if not isinstance(self.details, list):
            self.details = list(self.details or [])
        super().save(*args, **kwargs)
