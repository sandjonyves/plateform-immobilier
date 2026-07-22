"""
Tests unitaires — authentification et utilisateurs.
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
def admin_user():
    return User.objects.create_user(
        email='admin@test.cm',
        password='Admin123!',
        prenom='Jean',
        nom='Admin',
        role=User.Role.ADMIN,
        is_staff=True,
    )


@pytest.fixture
def client_user():
    return User.objects.create_user(
        email='client@test.cm',
        password='Client123!',
        prenom='Marie',
        nom='Client',
        role=User.Role.CLIENT,
    )


class TestAuth:
    def test_register_creates_client(self, api):
        res = api.post(
            '/api/v1/auth/register/',
            {
                'prenom': 'Test',
                'nom': 'User',
                'email': 'nouveau@test.cm',
                'telephone': '+237600000000',
                'password': 'Secret1!',
            },
            format='json',
        )
        assert res.status_code == status.HTTP_201_CREATED
        assert res.data['user']['role'] == 'client'
        assert 'access' in res.data['tokens']

    def test_login_ok(self, api, client_user):
        res = api.post(
            '/api/v1/auth/login/',
            {'email': 'client@test.cm', 'password': 'Client123!'},
            format='json',
        )
        assert res.status_code == status.HTTP_200_OK
        assert res.data['tokens']['access']

    def test_login_bad_password(self, api, client_user):
        res = api.post(
            '/api/v1/auth/login/',
            {'email': 'client@test.cm', 'password': 'wrong'},
            format='json',
        )
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_requires_auth(self, api):
        res = api.get('/api/v1/auth/me/')
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_authenticated(self, api, client_user):
        api.force_authenticate(user=client_user)
        res = api.get('/api/v1/auth/me/')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['email'] == 'client@test.cm'


class TestUsersAdmin:
    def test_list_users_admin_only(self, api, admin_user, client_user):
        api.force_authenticate(user=client_user)
        assert api.get('/api/v1/utilisateurs/').status_code == status.HTTP_403_FORBIDDEN

        api.force_authenticate(user=admin_user)
        res = api.get('/api/v1/utilisateurs/')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['count'] >= 2
