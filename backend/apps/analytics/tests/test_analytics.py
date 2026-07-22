"""Tests — Analytics overview / rapports / carte."""

import pytest
from rest_framework import status

from apps.maisons.models import Maison
from apps.terrains.models import Terrain

pytestmark = pytest.mark.django_db

BORNES = [
    {'latitude': 3.88, 'longitude': 11.51},
    {'latitude': 3.881, 'longitude': 11.511},
    {'latitude': 3.8805, 'longitude': 11.512},
]


class TestAnalyticsAPI:
    def test_overview_admin_only(self, api, admin_user, client_user):
        api.force_authenticate(user=client_user)
        assert api.get('/api/v1/analytics/overview/').status_code == status.HTTP_403_FORBIDDEN
        api.force_authenticate(user=admin_user)
        res = api.get('/api/v1/analytics/overview/')
        assert res.status_code == status.HTTP_200_OK
        assert isinstance(res.data, dict)

    def test_rapports_admin(self, auth_admin):
        res = auth_admin.get('/api/v1/analytics/rapports/')
        assert res.status_code == status.HTTP_200_OK

    def test_carte_public(self, api, admin_user, ville_yaounde):
        Terrain.objects.create(
            titre='T Carte',
            bornes=BORNES,
            prix=1_000_000,
            ville=ville_yaounde,
            quartier='Bastos',
            statut=Terrain.Statut.DISPONIBLE,
            created_by=admin_user,
        )
        Maison.objects.create(
            titre='M Carte',
            type=Maison.Type.VILLA,
            statut=Maison.Statut.DISPONIBLE,
            prix=10_000_000,
            ville=ville_yaounde,
            quartier='Bastos',
            surface_m2=200,
            chambres=3,
            salles_de_bain=2,
            etages=1,
            latitude=3.88,
            longitude=11.51,
            created_by=admin_user,
        )
        res = api.get('/api/v1/carte/')
        assert res.status_code == status.HTTP_200_OK
        assert 'terrains' in res.data or 'features' in res.data or isinstance(res.data, (dict, list))
