"""Tests supplémentaires — Ventes (permissions, export)."""

import pytest
from rest_framework import status

from apps.ventes.models import Vente

pytestmark = pytest.mark.django_db


class TestVentesAPI:
    def test_list_admin_only(self, api, admin_user, client_user):
        api.force_authenticate(user=client_user)
        assert api.get('/api/v1/ventes/').status_code == status.HTTP_403_FORBIDDEN
        api.force_authenticate(user=admin_user)
        res = api.get('/api/v1/ventes/')
        assert res.status_code == status.HTTP_200_OK

    def test_create_forbidden_client(self, auth_client, client_user, terrain):
        res = auth_client.post(
            '/api/v1/ventes/',
            {
                'type': 'vente',
                'bien_type': 'terrain',
                'bien_id': str(terrain.id),
                'client_id': str(client_user.id),
                'montant': 1_000_000,
                'statut': 'en_attente',
            },
            format='json',
        )
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_export_csv(self, auth_admin, admin_user, client_user, terrain):
        Vente.objects.create(
            type=Vente.Type.VENTE,
            bien_type='terrain',
            bien_id=terrain.id,
            client=client_user,
            created_by=admin_user,
            montant=5_000_000,
            statut=Vente.Statut.EN_ATTENTE,
        )
        res = auth_admin.get('/api/v1/ventes/export/')
        assert res.status_code == status.HTTP_200_OK
        assert 'text/csv' in res['Content-Type'] or res.content.startswith(b't') or b'montant' in res.content.lower()

    def test_invalid_client_role(self, auth_admin, admin_user, terrain):
        res = auth_admin.post(
            '/api/v1/ventes/',
            {
                'type': 'vente',
                'bien_type': 'terrain',
                'bien_id': str(terrain.id),
                'client_id': str(admin_user.id),
                'montant': 1_000_000,
                'statut': 'en_attente',
            },
            format='json',
        )
        assert res.status_code == status.HTTP_400_BAD_REQUEST
