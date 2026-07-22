"""Serializers — Terrains (forme TerrainPlain frontend)."""

from rest_framework import serializers

from apps.common.geo import valider_bornes
from apps.villes.models import Ville

from .models import Terrain


class BorneSerializer(serializers.Serializer):
    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)


def resolve_ville(attrs, data):
    """Résout ville_id (UUID) ou ville (nom) vers une instance Ville."""
    existing = attrs.get('ville')
    if isinstance(existing, Ville):
        return attrs
    raw = data.get('ville_id') or data.get('ville') or existing
    if not raw:
        raise serializers.ValidationError({'ville_id': 'La ville est obligatoire.'})
    if isinstance(raw, Ville):
        attrs['ville'] = raw
        return attrs
    # UUID ?
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


class TerrainSerializer(serializers.ModelSerializer):
    created_by_id = serializers.UUIDField(read_only=True)
    agent_id = serializers.SerializerMethodField()
    ville = serializers.CharField(source='ville.nom', read_only=True)
    ville_id = serializers.UUIDField(read_only=True)

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
            'ville_id',
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
            'ville',
            'ville_id',
            'date_ajout',
            'created_by_id',
            'agent_id',
            'created_at',
            'updated_at',
        )

    def get_agent_id(self, obj) -> str | None:
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


class TerrainWriteSerializer(serializers.ModelSerializer):
    bornes = BorneSerializer(many=True)
    ville_id = serializers.PrimaryKeyRelatedField(
        source='ville',
        queryset=Ville.objects.filter(actif=True),
        required=False,
        pk_field=serializers.UUIDField(),
    )

    class Meta:
        model = Terrain
        fields = (
            'titre',
            'bornes',
            'statut',
            'prix',
            'ville_id',
            'quartier',
            'description',
            'titre_foncier',
            'photos',
            'videos',
            'documents',
        )

    def validate_bornes(self, value):
        return valider_bornes([dict(b) for b in value])

    def validate_prix(self, value):
        if value <= 0:
            raise serializers.ValidationError('Le prix doit être positif.')
        return value

    def validate(self, attrs):
        if isinstance(attrs.get('ville'), Ville):
            return attrs
        nom = self.initial_data.get('ville')
        if nom:
            try:
                attrs['ville'] = Ville.objects.get(nom__iexact=str(nom), actif=True)
            except Ville.DoesNotExist as exc:
                raise serializers.ValidationError({'ville': f'Ville inconnue : {nom}'}) from exc
            return attrs
        raise serializers.ValidationError({'ville_id': 'La ville est obligatoire.'})
