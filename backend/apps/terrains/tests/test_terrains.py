"""
Tests — Terrains (bornes, surface, archive, permissions).
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from apps.common.geo import calculer_surface_m2
from apps.terrains.models import Terrain

User = get_user_model()
pytestmark = pytest.mark.django_db

BORNES = [
    {'latitude': 3.8895, 'longitude': 11.5174},
    {'latitude': 3.8903, 'longitude': 11.5183},
    {'latitude': 3.8897, 'longitude': 11.5189},
    {'latitude': 3.8889, 'longitude': 11.5182},
]


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def admin():
    return User.objects.create_user(
        email='admin@test.cm',
        password='Admin123!',
        prenom='A',
        nom='Admin',
        role=User.Role.ADMIN,
        is_staff=True,
    )


class TestGeo:
    def test_surface_positive(self):
        s = calculer_surface_m2(BORNES)
        assert s > 0

    def test_moins_de_3_bornes(self):
        with pytest.raises(ValueError):
            calculer_surface_m2(BORNES[:2])


class TestTerrainsAPI:
    def test_list_public(self, api, admin):
        Terrain.objects.create(
            titre='Terrain Test',
            bornes=BORNES,
            statut=Terrain.Statut.DISPONIBLE,
            prix=10_000_000,
            ville='Yaoundé',
            quartier='Bastos',
            created_by=admin,
        )
        res = api.get('/api/v1/terrains/')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['count'] >= 1

    def test_create_admin(self, api, admin):
        api.force_authenticate(user=admin)
        res = api.post(
            '/api/v1/terrains/',
            {
                'titre': 'Nouveau terrain',
                'bornes': BORNES,
                'statut': 'disponible',
                'prix': 50_000_000,
                'ville': 'Douala',
                'quartier': 'Akwa',
                'description': 'Test',
                'titre_foncier': 'TF-1',
                'photos': [],
                'videos': ['https://example.com/v.mp4'],
                'documents': [],
            },
            format='json',
        )
        assert res.status_code == status.HTTP_201_CREATED
        assert res.data['surface_m2'] > 0
        assert len(res.data['videos']) == 1

    def test_create_forbidden_anon(self, api):
        res = api.post(
            '/api/v1/terrains/',
            {'titre': 'X', 'bornes': BORNES, 'prix': 1, 'ville': 'Y', 'quartier': 'Z'},
            format='json',
        )
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_archiver(self, api, admin):
        t = Terrain.objects.create(
            titre='À archiver',
            bornes=BORNES,
            statut=Terrain.Statut.DISPONIBLE,
            prix=1_000_000,
            ville='Yaoundé',
            quartier='Odza',
            created_by=admin,
        )
        api.force_authenticate(user=admin)
        res = api.post(f'/api/v1/terrains/{t.id}/archiver/')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['statut'] == 'archive'
