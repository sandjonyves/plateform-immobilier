"""
Permissions DRF réutilisables.

Rôles Immopro : admin | client uniquement.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Accès réservé aux utilisateurs avec role=admin et statut=actif."""

    message = 'Accès réservé aux administrateurs.'

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, 'role', None) == 'admin'
            and getattr(user, 'statut', None) == 'actif'
        )


class IsClient(BasePermission):
    """Accès réservé aux clients actifs."""

    message = 'Accès réservé aux clients.'

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, 'role', None) == 'client'
            and getattr(user, 'statut', None) == 'actif'
        )


class IsAdminOrReadOnly(BasePermission):
    """
    Lecture pour tous (y compris anonyme),
    écriture réservée aux admins.
    """

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, 'role', None) == 'admin'
            and getattr(user, 'statut', None) == 'actif'
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Objet accessible par son propriétaire (attribut `owner_field`)
    ou par un admin.
    """

    owner_field = 'created_by'

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, 'role', None) == 'admin':
            return True
        owner = getattr(obj, getattr(view, 'owner_field', self.owner_field), None)
        return owner == user
