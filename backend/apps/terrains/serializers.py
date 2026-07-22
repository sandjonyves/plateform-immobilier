"""Serializers — Terrains (forme TerrainPlain frontend)."""

from rest_framework import serializers

from apps.common.geo import valider_bornes

from .models import Terrain


class BorneSerializer(serializers.Serializer):
    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)


class TerrainSerializer(serializers.ModelSerializer):
    """
    Aligné sur TerrainPlain :
    id, titre, bornes, surface_m2, statut, prix, ville, quartier,
    description, titre_foncier, photos, videos, documents, date_ajout
    + created_by (remplace agent_id).
    """

    created_by_id = serializers.UUIDField(read_only=True)
    # Alias rétrocompat frontend (agent_id → created_by)
    agent_id = serializers.SerializerMethodField()

    class Meta:
        model = Terrain
        fields = (
            'id',
            'titre',
            'bornes',
            'surface_m2',
            'statut',
            'prix',
            'ville',
            'quartier',
            'description',
            'titre_foncier',
            'photos',
            'videos',
            'documents',
            'date_ajout',
            'created_by_id',
            'agent_id',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'surface_m2',
            'date_ajout',
            'created_by_id',
            'agent_id',
            'created_at',
            'updated_at',
        )

    def get_agent_id(self, obj) -> str | None:
        """Compatibilité front : agent_id = created_by."""
        return str(obj.created_by_id) if obj.created_by_id else None

    def validate_bornes(self, value):
        try:
            return valider_bornes(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc

    def validate_prix(self, value):
        if value <= 0:
            raise serializers.ValidationError('Le prix doit être positif.')
        return value

    def validate_titre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Le titre est obligatoire.')
        return value.strip()


class TerrainWriteSerializer(TerrainSerializer):
    """Écriture : bornes validées, surface non fournie."""

    bornes = BorneSerializer(many=True)

    def validate_bornes(self, value):
        return valider_bornes([dict(b) for b in value])
