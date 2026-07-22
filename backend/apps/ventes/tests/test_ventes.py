"""Tests — Ventes (suivi métier, pas de paiement)."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from apps.terrains.models import Terrain

User = get_user_model()
pytestmark = pytest.mark.django_db

BORNES = [
    {'latitude': 3.88, 'longitude': 11.51},
    {'latitude': 3.881, 'longitude': 11.511},
    {'latitude': 3.8805, 'longitude': 11.512},
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


@pytest.fixture
def client_user():
    return User.objects.create_user(
        email='client@test.cm',
        password='Client123!',
        prenom='C',
        nom='Client',
        role=User.Role.CLIENT,
    )


@pytest.fixture
def terrain(admin):
    return Terrain.objects.create(
        titre='T',
        bornes=BORNES,
        prix=10_000_000,
        ville='Yaoundé',
        quartier='Bastos',
        created_by=admin,
    )


def test_create_vente(api, admin, client_user, terrain):
    api.force_authenticate(user=admin)
    res = api.post(
        '/api/v1/ventes/',
        {
            'type': 'vente',
            'bien_type': 'terrain',
            'bien_id': str(terrain.id),
            'client_id': str(client_user.id),
            'montant': 10_000_000,
            'statut': 'en_attente',
        },
        format='json',
    )
    assert res.status_code == status.HTTP_201_CREATED
    assert res.data['montant'] == '10000000' or res.data['montant'] == 10000000
