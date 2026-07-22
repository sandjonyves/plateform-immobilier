"""Services — Ventes (suivi métier, pas de paiement)."""

from django.contrib.auth import get_user_model
from django.db import transaction as db_transaction

from apps.maisons.models import Maison
from apps.terrains.models import Terrain

from .models import Vente

User = get_user_model()


class VenteService:
    @staticmethod
    def _assert_bien_exists(bien_type: str, bien_id) -> None:
        if bien_type == Vente.BienType.TERRAIN:
            if not Terrain.objects.filter(pk=bien_id).exists():
                raise ValueError('Terrain introuvable.')
        elif bien_type == Vente.BienType.MAISON:
            if not Maison.objects.filter(pk=bien_id).exists():
                raise ValueError('Maison introuvable.')
        else:
            raise ValueError('Type de bien invalide.')

    @staticmethod
    @db_transaction.atomic
    def create(*, data: dict, created_by) -> Vente:
        client = data['client']
        if isinstance(client, str):
            client = User.objects.get(pk=client)

        if client.role != User.Role.CLIENT:
            raise ValueError('Le client doit avoir le rôle client.')

        VenteService._assert_bien_exists(data['bien_type'], data['bien_id'])

        vente = Vente(
            type=data.get('type', Vente.Type.VENTE),
            bien_type=data['bien_type'],
            bien_id=data['bien_id'],
            client=client,
            created_by=created_by,
            montant=data['montant'],
            statut=data.get('statut', Vente.Statut.EN_ATTENTE),
            documents=data.get('documents', []),
            notes=data.get('notes', ''),
        )
        vente.save()
        return vente

    @staticmethod
    @db_transaction.atomic
    def update(vente: Vente, data: dict) -> Vente:
        if 'client' in data:
            client = data['client']
            if isinstance(client, str):
                client = User.objects.get(pk=client)
            data = {**data, 'client': client}
        if 'bien_type' in data or 'bien_id' in data:
            bien_type = data.get('bien_type', vente.bien_type)
            bien_id = data.get('bien_id', vente.bien_id)
            VenteService._assert_bien_exists(bien_type, bien_id)
        for field, value in data.items():
            setattr(vente, field, value)
        vente.save()
        return vente
