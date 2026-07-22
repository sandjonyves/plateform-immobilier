"""Fixtures partagées pour les tests Immopro."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.terrains.models import Terrain
from apps.villes.models import Ville

User = get_user_model()

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
def ville_yaounde(db):
    return Ville.objects.get_or_create(
        nom='Yaoundé',
        defaults={'region': 'Centre', 'slug': 'yaounde', 'actif': True},
    )[0]


@pytest.fixture
def ville_douala(db):
    return Ville.objects.get_or_create(
        nom='Douala',
        defaults={'region': 'Littoral', 'slug': 'douala', 'actif': True},
    )[0]


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email='admin@test.cm',
        password='Admin123!',
        prenom='Jean',
        nom='Admin',
        role=User.Role.ADMIN,
        is_staff=True,
    )


@pytest.fixture
def client_user(db):
    return User.objects.create_user(
        email='client@test.cm',
        password='Client123!',
        prenom='Marie',
        nom='Client',
        role=User.Role.CLIENT,
    )


@pytest.fixture
def auth_admin(api, admin_user):
    api.force_authenticate(user=admin_user)
    return api


@pytest.fixture
def auth_client(api, client_user):
    api.force_authenticate(user=client_user)
    return api


@pytest.fixture
def terrain(admin_user, ville_yaounde):
    return Terrain.objects.create(
        titre='Terrain Test',
        bornes=BORNES,
        prix=10_000_000,
        ville=ville_yaounde,
        quartier='Bastos',
        created_by=admin_user,
    )
