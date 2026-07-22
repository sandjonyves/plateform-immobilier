"""Serializers — Maisons (forme MaisonPlain frontend)."""

from rest_framework import serializers

from .models import Maison


class MaisonSerializer(serializers.ModelSerializer):
    """
    Expose ``localisation: {latitude, longitude}`` comme le frontend,
    tout en stockant lat/lng en colonnes séparées.
    """

    localisation = serializers.SerializerMethodField()
    created_by_id = serializers.UUIDField(read_only=True)
    agent_id = serializers.SerializerMethodField()

    class Meta:
        model = Maison
        fields = (
            'id',
            'titre',
            'type',
            'statut',
            'prix',
            'ville',
            'quartier',
            'description',
            'surface_m2',
            'surface_terrain_m2',
            'chambres',
            'salles_de_bain',
            'etages',
            'latitude',
            'longitude',
            'localisation',
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
            'localisation',
            'date_ajout',
            'created_by_id',
            'agent_id',
            'created_at',
            'updated_at',
        )

    def get_localisation(self, obj) -> dict:
        return {'latitude': obj.latitude, 'longitude': obj.longitude}

    def get_agent_id(self, obj) -> str | None:
        return str(obj.created_by_id) if obj.created_by_id else None

    def validate_prix(self, value):
        if value <= 0:
            raise serializers.ValidationError('Le prix doit être positif.')
        return value

    def validate_surface_m2(self, value):
        if value <= 0:
            raise serializers.ValidationError('La surface doit être positive.')
        return value

    def validate_titre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Le titre est obligatoire.')
        return value.strip()

    def validate_latitude(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError('Latitude hors plage.')
        return value

    def validate_longitude(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError('Longitude hors plage.')
        return value


class MaisonWriteSerializer(MaisonSerializer):
    """Accepte latitude/longitude à plat (comme le formulaire frontend)."""

    class Meta(MaisonSerializer.Meta):
        pass
