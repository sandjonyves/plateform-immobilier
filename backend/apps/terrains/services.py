"""Services métier — Terrains."""

from django.db import transaction

from apps.analytics.activity import log_activity
from apps.analytics.models import ActivityLog

from .models import Terrain


class TerrainService:
    """Opérations métier sur les terrains."""

    @staticmethod
    @transaction.atomic
    def create(*, data: dict, created_by) -> Terrain:
        """Crée un terrain (surface calculée dans Terrain.save)."""
        terrain = Terrain(
            titre=data['titre'],
            bornes=data['bornes'],
            statut=data.get('statut', Terrain.Statut.DISPONIBLE),
            prix=data['prix'],
            ville=data['ville'],
            quartier=data['quartier'],
            description=data.get('description', ''),
            titre_foncier=data.get('titre_foncier', ''),
            photos=data.get('photos', []),
            videos=data.get('videos', []),
            documents=data.get('documents', []),
            created_by=created_by,
        )
        terrain.save()
        log_activity(
            acteur=created_by,
            action=ActivityLog.Action.TERRAIN_PUBLIE,
            cible_type='terrain',
            cible_id=terrain.id,
            message=f'Terrain publié : {terrain.titre}',
        )
        return terrain

    @staticmethod
    @transaction.atomic
    def update(terrain: Terrain, data: dict, *, acteur=None) -> Terrain:
        for field, value in data.items():
            setattr(terrain, field, value)
        terrain.save()
        log_activity(
            acteur=acteur or terrain.created_by,
            action=ActivityLog.Action.TERRAIN_MODIFIE,
            cible_type='terrain',
            cible_id=terrain.id,
            message=f'Terrain modifié : {terrain.titre}',
        )
        return terrain

    @staticmethod
    @transaction.atomic
    def archiver(terrain: Terrain, *, acteur=None) -> Terrain:
        terrain.archiver()
        log_activity(
            acteur=acteur or terrain.created_by,
            action=ActivityLog.Action.TERRAIN_ARCHIVE,
            cible_type='terrain',
            cible_id=terrain.id,
            message=f'Terrain archivé : {terrain.titre}',
        )
        return terrain
