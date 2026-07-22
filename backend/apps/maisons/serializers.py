"""Serializers — Maisons (forme MaisonPlain frontend)."""

from rest_framework import serializers

from apps.villes.models import Ville

from .models import Maison


def resolve_ville(attrs, data):
    if attrs.get('ville') is not None and not isinstance(attrs.get('ville'), str):
        return attrs
    raw = data.get('ville_id') or data.get('ville')
    if not raw:
        raise serializers.ValidationError({'ville_id': 'La ville est obligatoire.'})
    try:
        attrs['ville'] = Ville.objects.get(pk=raw, actif=True)
        return attrs
    except (Ville.DoesNotExist, ValueError, TypeError):
        pass
    try:
        attrs['ville'] = Ville.objects.get(nom__iexact=str(raw), actif=True)
    except Ville.DoesNotExist as exc:
        raise serializers.ValidationError({'ville': f'Ville inconnue : {raw}'}) from exc
    return attrs


class MaisonSerializer(serializers.ModelSerializer):
    localisation = serializers.SerializerMethodField()
    created_by_id = serializers.UUIDField(read_only=True)
    agent_id = serializers.SerializerMethodField()
    ville = serializers.CharField(source='ville.nom', read_only=True)
    ville_id = serializers.UUIDField(source='ville_id', read_only=True)

    class Meta:
        model = Maison
        fields = (
            'id',
            'titre',
            'type',
            'statut',
            'prix',
            'ville',
            'ville_id',
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
            'ville',
            'ville_id',
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


class MaisonWriteSerializer(serializers.ModelSerializer):
    ville_id = serializers.UUIDField(required=False)
    ville = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = Maison
        fields = (
            'titre',
            'type',
            'statut',
            'prix',
            'ville',
            'ville_id',
            'quartier',
            'description',
            'surface_m2',
            'surface_terrain_m2',
            'chambres',
            'salles_de_bain',
            'etages',
            'latitude',
            'longitude',
            'titre_foncier',
            'photos',
            'videos',
            'documents',
        )

    def validate_prix(self, value):
        if value <= 0:
            raise serializers.ValidationError('Le prix doit être positif.')
        return value

    def validate_surface_m2(self, value):
        if value <= 0:
            raise serializers.ValidationError('La surface doit être positive.')
        return value

    def validate(self, attrs):
        resolve_ville(attrs, self.initial_data)
        attrs.pop('ville_id', None)
        return attrs
