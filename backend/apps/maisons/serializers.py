"""Serializers — Maisons (forme MaisonPlain frontend)."""

from rest_framework import serializers

from apps.villes.models import Ville

from .models import Maison


class MaisonSerializer(serializers.ModelSerializer):
    localisation = serializers.SerializerMethodField()
    created_by_id = serializers.UUIDField(read_only=True)
    agent_id = serializers.SerializerMethodField()
    ville = serializers.CharField(source='ville.nom', read_only=True)
    ville_id = serializers.UUIDField(read_only=True)

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
            'date_ajout',
            'created_by_id',
            'agent_id',
            'created_at',
            'updated_at',
            'ville',
            'ville_id',
        )

    def get_localisation(self, obj):
        return {'latitude': obj.latitude, 'longitude': obj.longitude}

    def get_agent_id(self, obj):
        return str(obj.created_by_id) if obj.created_by_id else None


class MaisonWriteSerializer(serializers.ModelSerializer):
    ville_id = serializers.PrimaryKeyRelatedField(
        source='ville',
        queryset=Ville.objects.filter(actif=True),
        required=False,
        pk_field=serializers.UUIDField(),
    )

    class Meta:
        model = Maison
        fields = (
            'titre',
            'type',
            'statut',
            'prix',
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
