"""Serializers — Agenda."""

from rest_framework import serializers

from .models import Evenement


class EvenementSerializer(serializers.ModelSerializer):
    """
    Aligné sur Evenement frontend :
    id, titre, type, date, heure, lieu, participants[]
    """

    # Accepte string CSV ou liste
    participants = serializers.JSONField(required=False)

    class Meta:
        model = Evenement
        fields = (
            'id',
            'titre',
            'type',
            'date',
            'heure',
            'lieu',
            'participants',
            'created_by',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

    def validate_titre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Le titre est obligatoire.')
        return value.strip()

    def validate_participants(self, value):
        """Normalise CSV string → list[str]."""
        if value is None:
            return []
        if isinstance(value, str):
            return [p.strip() for p in value.split(',') if p.strip()]
        if isinstance(value, list):
            return [str(p).strip() for p in value if str(p).strip()]
        raise serializers.ValidationError('participants doit être une liste ou une chaîne CSV.')
