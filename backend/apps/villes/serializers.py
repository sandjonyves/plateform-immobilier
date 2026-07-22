from rest_framework import serializers

from .models import Ville


class VilleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ville
        fields = ('id', 'nom', 'region', 'slug', 'actif')
