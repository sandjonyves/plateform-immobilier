"""
Modèle utilisateur Immopro Central.

Deux rôles uniquement : admin | client.
Aucun paiement en ligne — le compte sert à l'accès et au suivi métier.
"""

import uuid

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Utilisateur de la plateforme.

    - ``admin`` : accès back-office complet
    - ``client`` : espace public / catalogue / son dossier
    """

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Administrateur'
        CLIENT = 'client', 'Client'

    class Statut(models.TextChoices):
        ACTIF = 'actif', 'Actif'
        SUSPENDU = 'suspendu', 'Suspendu'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name='Email')
    prenom = models.CharField(max_length=100, verbose_name='Prénom')
    nom = models.CharField(max_length=100, verbose_name='Nom')
    telephone = models.CharField(max_length=30, blank=True, verbose_name='Téléphone')
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CLIENT,
        db_index=True,
        verbose_name='Rôle',
    )
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.ACTIF,
        db_index=True,
        verbose_name='Statut',
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        verbose_name='Avatar',
    )
    ville = models.CharField(max_length=100, blank=True, verbose_name='Ville')

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_inscription = models.DateTimeField(auto_now_add=True, verbose_name="Date d'inscription")
    derniere_connexion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Dernière connexion',
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['prenom', 'nom']

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-date_inscription']
        indexes = [
            models.Index(fields=['role', 'statut']),
            models.Index(fields=['email']),
        ]

    def __str__(self) -> str:
        return f'{self.prenom} {self.nom} <{self.email}>'

    @property
    def full_name(self) -> str:
        return f'{self.prenom} {self.nom}'.strip()

    @property
    def is_admin(self) -> bool:
        return self.role == self.Role.ADMIN and self.statut == self.Statut.ACTIF

    @property
    def is_client(self) -> bool:
        return self.role == self.Role.CLIENT and self.statut == self.Statut.ACTIF


class UserPreference(models.Model):
    """
    Préférences utilisateur (page Paramètres du frontend).

    OneToOne avec User — créé automatiquement à l'inscription via signal.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='preferences',
    )
    langue = models.CharField(max_length=10, default='fr')
    devise = models.CharField(max_length=10, default='XAF')
    format_date = models.CharField(max_length=20, default='DD/MM/YYYY')
    fuseau = models.CharField(max_length=50, default='Africa/Douala')
    dark_mode = models.BooleanField(default=False)
    accent_color = models.CharField(max_length=20, blank=True)

    # Notifications
    notif_ventes = models.BooleanField(default=True)
    notif_messages = models.BooleanField(default=True)
    notif_agenda = models.BooleanField(default=True)
    notif_rapports = models.BooleanField(default=False)
    notif_promotions = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Préférence utilisateur'
        verbose_name_plural = 'Préférences utilisateurs'

    def __str__(self) -> str:
        return f'Préférences de {self.user.email}'
