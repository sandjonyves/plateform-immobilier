"""Tests — Services commerciaux."""

import pytest
from rest_framework import status

from apps.services.models import Service

pytestmark = pytest.mark.django_db


@pytest.fixture
def service(db):
    return Service.objects.create(
        titre='Audit test',
        slug='audit-test',
        description='Desc',
        details=['A', 'B'],
        prix_indicatif='100 000 XAF',
        icon='FileSearch',
        categorie=Service.Categorie.AUDIT,
        ordre=1,
        actif=True,
        phare=True,
    )


class TestServicesAPI:
    def test_list_public(self, api, service):
        res = api.get('/api/v1/services/')
        assert res.status_code == status.HTTP_200_OK
        assert res.data['count'] >= 1

    def test_create_admin(self, auth_admin):
        res = auth_admin.post(
            '/api/v1/services/',
            {
                'titre': 'Nouveau service',
                'description': 'Description',
                'details': ['Point 1'],
                'categorie': 'gestion',
                'icon': 'Briefcase',
                'ordre': 5,
                'actif': True,
            },
            format='json',
        )
        assert res.status_code == status.HTTP_201_CREATED
        assert res.data['slug']

    def test_create_forbidden_client(self, auth_client):
        res = auth_client.post(
            '/api/v1/services/',
            {'titre': 'X', 'description': 'Y', 'categorie': 'vente'},
            format='json',
        )
        assert res.status_code == status.HTTP_403_FORBIDDEN
