"""
Tests — Maisons.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()
pytestmark = pytest.mark.django_db


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


def test_create_maison(api, admin):
    api.force_authenticate(user=admin)
    res = api.post(
        '/api/v1/maisons/',
        {
            'titre': 'Villa Test',
            'type': 'villa',
            'statut': 'disponible',
            'prix': 100_000_000,
            'ville': 'Yaoundé',
            'quartier': 'Bastos',
            'description': 'Belle villa',
            'surface_m2': 300,
            'chambres': 4,
            'salles_de_bain': 3,
            'etages': 2,
            'latitude': 3.88,
            'longitude': 11.51,
            'photos': [],
            'videos': [],
            'documents': [],
        },
        format='json',
    )
    assert res.status_code == status.HTTP_201_CREATED
    assert res.data['localisation']['latitude'] == 3.88
