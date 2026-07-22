"""Tests — Documents (upload multipart admin)."""

import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status

from apps.documents.models import Document

pytestmark = pytest.mark.django_db


def _pdf(name='test.pdf', content=b'%PDF-1.4 fake'):
    return SimpleUploadedFile(name, content, content_type='application/pdf')


class TestDocumentsAPI:
    def test_list_admin_only(self, api, admin_user, client_user):
        api.force_authenticate(user=client_user)
        assert api.get('/api/v1/documents/').status_code == status.HTTP_403_FORBIDDEN
        api.force_authenticate(user=admin_user)
        res = api.get('/api/v1/documents/')
        assert res.status_code == status.HTTP_200_OK

    def test_upload_document(self, auth_admin, admin_user):
        res = auth_admin.post(
            '/api/v1/documents/',
            {
                'nom': 'Contrat_test.pdf',
                'type': 'contrat',
                'fichier': _pdf(),
                'bien_type': 'aucun',
                'bien_associe': 'Lot Test',
            },
            format='multipart',
        )
        assert res.status_code == status.HTTP_201_CREATED
        assert res.data['nom'] == 'Contrat_test.pdf'
        assert res.data['taille_kb'] >= 1
        assert Document.objects.filter(ajoute_par=admin_user).count() == 1

    def test_delete_document(self, auth_admin, admin_user):
        doc = Document.objects.create(
            nom='a-supprimer.pdf',
            type=Document.Type.AUTRE,
            fichier=_pdf('a-supprimer.pdf'),
            bien_associe='X',
            ajoute_par=admin_user,
        )
        res = auth_admin.delete(f'/api/v1/documents/{doc.id}/')
        assert res.status_code == status.HTTP_204_NO_CONTENT
        assert not Document.objects.filter(pk=doc.id).exists()

    def test_filter_by_type(self, auth_admin, admin_user):
        Document.objects.create(
            nom='tf.pdf',
            type=Document.Type.TITRE_FONCIER,
            fichier=_pdf('tf.pdf'),
            ajoute_par=admin_user,
        )
        Document.objects.create(
            nom='c.pdf',
            type=Document.Type.CONTRAT,
            fichier=_pdf('c.pdf'),
            ajoute_par=admin_user,
        )
        res = auth_admin.get('/api/v1/documents/?type=contrat')
        assert res.status_code == status.HTTP_200_OK
        assert all(d['type'] == 'contrat' for d in res.data['results'])
