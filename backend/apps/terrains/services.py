"""Services métier — Terrains."""

from django.db import transaction

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
        return terrain

    @staticmethod
    @transaction.atomic
    def update(terrain: Terrain, data: dict) -> Terrain:
        for field, value in data.items():
            setattr(terrain, field, value)
        terrain.save()
        return terrain

    @staticmethod
    def archiver(terrain: Terrain) -> Terrain:
        return terrain.archiver()
