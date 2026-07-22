from rest_framework import serializers

from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Service
        fields = (
            'id',
            'titre',
            'slug',
            'description',
            'details',
            'prix_indicatif',
            'icon',
            'categorie',
            'ordre',
            'actif',
            'phare',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_details(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError('Les détails doivent être une liste.')
        return [str(x).strip() for x in value if str(x).strip()]

    def validate_categorie(self, value):
        if value not in Service.Categorie.values:
            raise serializers.ValidationError('Catégorie invalide.')
        return value
