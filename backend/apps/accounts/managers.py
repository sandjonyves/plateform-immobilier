"""
Managers du modèle User personnalisé.
"""

from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    """Manager pour User basé sur l'email (pas de username)."""

    def create_user(self, email, password=None, **extra_fields):
        """Crée un utilisateur standard (client par défaut)."""
        if not email:
            raise ValueError("L'adresse email est obligatoire.")
        email = self.normalize_email(email)
        extra_fields.setdefault('role', 'client')
        extra_fields.setdefault('statut', 'actif')
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Crée un superutilisateur Django + rôle admin Immopro."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('statut', 'actif')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superutilisateur doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superutilisateur doit avoir is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

    def actifs(self):
        """Retourne uniquement les utilisateurs au statut actif."""
        return self.filter(statut='actif')

    def admins(self):
        return self.filter(role='admin', statut='actif')

    def clients(self):
        return self.filter(role='client', statut='actif')
