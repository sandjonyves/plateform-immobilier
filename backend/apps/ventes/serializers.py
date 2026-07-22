"""Serializers — Ventes (VentePlain frontend)."""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Vente

User = get_user_model()


class VenteSerializer(serializers.ModelSerializer):
    """
    Aligné sur VentePlain :
    id, type, bien_id, bien_type, client_id, montant, statut,
    date_vente, documents.

    ``agent_id`` / ``created_by_id`` : admin qui a saisi le dossier.
    """

    client_id = serializers.UUIDField(read_only=True)
    created_by_id = serializers.UUIDField(read_only=True)
    agent_id = serializers.SerializerMethodField()

    class Meta:
        model = Vente
        fields = (
            'id',
            'type',
            'bien_type',
            'bien_id',
            'client_id',
            'created_by_id',
            'agent_id',
            'montant',
            'statut',
            'date_vente',
            'documents',
            'notes',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'client_id',
            'created_by_id',
            'agent_id',
            'date_vente',
            'created_at',
            'updated_at',
        )

    def get_agent_id(self, obj) -> str | None:
        return str(obj.created_by_id) if obj.created_by_id else None


class VenteWriteSerializer(serializers.ModelSerializer):
    client_id = serializers.UUIDField()

    class Meta:
        model = Vente
        fields = (
            'type',
            'bien_type',
            'bien_id',
            'client_id',
            'montant',
            'statut',
            'documents',
            'notes',
        )

    def validate_montant(self, value):
        if value <= 0:
            raise serializers.ValidationError('Le montant doit être positif.')
        return value

    def validate_client_id(self, value):
        try:
            user = User.objects.get(pk=value)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError('Client introuvable.') from exc
        if user.role != User.Role.CLIENT:
            raise serializers.ValidationError('L\'utilisateur doit être un client.')
        return value

    def validated_data_with_client(self):
        """Remplace client_id par l'instance User (si présent)."""
        data = dict(self.validated_data)
        client_id = data.pop('client_id', None)
        if client_id is not None:
            data['client'] = User.objects.get(pk=client_id)
        return data
