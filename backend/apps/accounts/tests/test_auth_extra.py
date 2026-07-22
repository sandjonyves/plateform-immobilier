"""Tests — logout, refresh, préférences, password, utilisateurs admin."""

import pytest
from rest_framework import status

pytestmark = pytest.mark.django_db


class TestAuthExtra:
    def test_logout_blacklists_refresh(self, api, client_user):
        login = api.post(
            '/api/v1/auth/login/',
            {'email': 'client@test.cm', 'password': 'Client123!'},
            format='json',
        )
        refresh = login.data['tokens']['refresh']
        access = login.data['tokens']['access']
        api.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        res = api.post('/api/v1/auth/logout/', {'refresh': refresh}, format='json')
        assert res.status_code == status.HTTP_204_NO_CONTENT

        refresh_res = api.post('/api/v1/auth/refresh/', {'refresh': refresh}, format='json')
        assert refresh_res.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_refresh_token(self, api, client_user):
        login = api.post(
            '/api/v1/auth/login/',
            {'email': 'client@test.cm', 'password': 'Client123!'},
            format='json',
        )
        refresh = login.data['tokens']['refresh']
        res = api.post('/api/v1/auth/refresh/', {'refresh': refresh}, format='json')
        assert res.status_code == status.HTTP_200_OK
        assert 'access' in res.data

    def test_preferences_get_patch(self, auth_client):
        res = auth_client.get('/api/v1/auth/preferences/')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['langue'] == 'fr'

        patch = auth_client.patch(
            '/api/v1/auth/preferences/',
            {'dark_mode': True, 'devise': 'EUR'},
            format='json',
        )
        assert patch.status_code == status.HTTP_200_OK
        assert patch.data['dark_mode'] is True
        assert patch.data['devise'] == 'EUR'

    def test_change_password(self, auth_client, client_user):
        res = auth_client.post(
            '/api/v1/auth/password/change/',
            {
                'current_password': 'Client123!',
                'new_password': 'Nouveau1!',
                'confirm_password': 'Nouveau1!',
            },
            format='json',
        )
        assert res.status_code == status.HTTP_200_OK

        api = auth_client
        api.force_authenticate(user=None)
        bad = api.post(
            '/api/v1/auth/login/',
            {'email': 'client@test.cm', 'password': 'Client123!'},
            format='json',
        )
        assert bad.status_code == status.HTTP_401_UNAUTHORIZED
        ok = api.post(
            '/api/v1/auth/login/',
            {'email': 'client@test.cm', 'password': 'Nouveau1!'},
            format='json',
        )
        assert ok.status_code == status.HTTP_200_OK

    def test_suspended_cannot_login(self, api, client_user):
        client_user.statut = client_user.Statut.SUSPENDU
        client_user.save(update_fields=['statut'])
        res = api.post(
            '/api/v1/auth/login/',
            {'email': 'client@test.cm', 'password': 'Client123!'},
            format='json',
        )
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_create_and_suspend_user(self, auth_admin):
        create = auth_admin.post(
            '/api/v1/utilisateurs/',
            {
                'prenom': 'Paul',
                'nom': 'Test',
                'email': 'paul.test@immopro.cm',
                'telephone': '+237690000099',
                'role': 'client',
                'statut': 'actif',
                'password': 'Client123!',
            },
            format='json',
        )
        assert create.status_code == status.HTTP_201_CREATED
        uid = create.data['id']

        suspend = auth_admin.post(f'/api/v1/utilisateurs/{uid}/suspendre/')
        assert suspend.status_code == status.HTTP_200_OK
        assert suspend.data['statut'] == 'suspendu'

        activate = auth_admin.post(f'/api/v1/utilisateurs/{uid}/activer/')
        assert activate.status_code == status.HTTP_200_OK
        assert activate.data['statut'] == 'actif'


class TestMePatch:
    def test_patch_profile(self, auth_client):
        res = auth_client.patch(
            '/api/v1/auth/me/',
            {'prenom': 'Mariette', 'ville': 'Douala'},
            format='json',
        )
        assert res.status_code == status.HTTP_200_OK
        assert res.data['prenom'] == 'Mariette'
        assert res.data['ville'] == 'Douala'
