from rest_framework import serializers

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    fichier_url = serializers.SerializerMethodField()
    ajoute_par_nom = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = (
            'id',
            'nom',
            'type',
            'fichier',
            'fichier_url',
            'taille_kb',
            'bien_type',
            'bien_id',
            'bien_associe',
            'ajoute_par',
            'ajoute_par_nom',
            'date_ajout',
        )
        read_only_fields = (
            'id',
            'taille_kb',
            'ajoute_par',
            'ajoute_par_nom',
            'fichier_url',
            'date_ajout',
        )

    def get_fichier_url(self, obj) -> str | None:
        if not obj.fichier:
            return None
        request = self.context.get('request')
        url = obj.fichier.url
        return request.build_absolute_uri(url) if request else url

    def get_ajoute_par_nom(self, obj) -> str | None:
        if obj.ajoute_par:
            return obj.ajoute_par.full_name
        return None
