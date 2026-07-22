"""Tests — Agenda (événements admin)."""

import pytest
from rest_framework import status

pytestmark = pytest.mark.django_db


class TestAgendaAPI:
    def test_list_admin_only(self, api, admin_user, client_user):
        api.force_authenticate(user=client_user)
        assert api.get('/api/v1/evenements/').status_code == status.HTTP_403_FORBIDDEN
        api.force_authenticate(user=admin_user)
        res = api.get('/api/v1/evenements/')
        assert res.status_code == status.HTTP_200_OK

    def test_create_evenement(self, auth_admin):
        res = auth_admin.post(
            '/api/v1/evenements/',
            {
                'titre': 'Visite Villa Test',
                'type': 'visite',
                'date': '2026-07-20',
                'heure': '10:00',
                'lieu': 'Bastos, Yaoundé',
                'participants': 'Marie Client, Jean Admin',
            },
            format='json',
        )
        assert res.status_code == status.HTTP_201_CREATED
        assert res.data['titre'] == 'Visite Villa Test'
        assert len(res.data['participants']) == 2

    def test_create_requires_auth(self, api):
        res = api.post(
            '/api/v1/evenements/',
            {'titre': 'X', 'type': 'visite', 'date': '2026-07-20', 'heure': '10:00', 'lieu': 'Y'},
            format='json',
        )
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_filter_by_type(self, auth_admin):
        auth_admin.post(
            '/api/v1/evenements/',
            {
                'titre': 'Signature',
                'type': 'signature',
                'date': '2026-07-21',
                'heure': '15:00',
                'lieu': 'Notaire',
                'participants': [],
            },
            format='json',
        )
        res = auth_admin.get('/api/v1/evenements/?type=signature')
        assert res.status_code == status.HTTP_200_OK
        assert all(e['type'] == 'signature' for e in res.data['results'])
