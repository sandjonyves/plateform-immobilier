"""Tests supplémentaires — Maisons (list public, archive, permissions)."""

import pytest
from rest_framework import status

from apps.maisons.models import Maison

pytestmark = pytest.mark.django_db


@pytest.fixture
def maison(admin_user, ville_yaounde):
    return Maison.objects.create(
        titre='Villa Existante',
        type=Maison.Type.VILLA,
        statut=Maison.Statut.DISPONIBLE,
        prix=50_000_000,
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


class TestMaisonsAPI:
    def test_list_public(self, api, maison):
        res = api.get('/api/v1/maisons/')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['count'] >= 1

    def test_create_forbidden_client(self, auth_client):
        res = auth_client.post(
            '/api/v1/maisons/',
            {
                'titre': 'X',
                'type': 'villa',
                'prix': 1,
                'ville': 'Y',
                'quartier': 'Z',
                'surface_m2': 10,
                'chambres': 1,
                'salles_de_bain': 1,
                'etages': 1,
                'latitude': 3.8,
                'longitude': 11.5,
            },
            format='json',
        )
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_archiver(self, auth_admin, maison):
        res = auth_admin.post(f'/api/v1/maisons/{maison.id}/archiver/')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['statut'] == 'archive'

    def test_retrieve(self, api, maison):
        res = api.get(f'/api/v1/maisons/{maison.id}/')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['titre'] == 'Villa Existante'
