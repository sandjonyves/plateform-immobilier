import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, viewsets
from rest_framework.parsers import FormParser, MultiPartParser

from apps.common.permissions import IsAdmin

from .models import Document
from .serializers import DocumentSerializer


class DocumentFilter(django_filters.FilterSet):
    type = django_filters.ChoiceFilter(choices=Document.Type.choices)
    bien_type = django_filters.ChoiceFilter(choices=Document.BienType.choices)

    class Meta:
        model = Document
        fields = ['type', 'bien_type', 'bien_id']


@extend_schema_view(
    list=extend_schema(tags=['Documents']),
    retrieve=extend_schema(tags=['Documents']),
    create=extend_schema(tags=['Documents']),
    destroy=extend_schema(tags=['Documents']),
)
class DocumentViewSet(viewsets.ModelViewSet):
    """CRUD documents — admin. Upload multipart."""

    permission_classes = [IsAdmin]
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]
    queryset = Document.objects.select_related('ajoute_par').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DocumentFilter
    search_fields = ['nom', 'bien_associe']
    ordering_fields = ['date_ajout', 'nom', 'taille_kb']
    ordering = ['-date_ajout']
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def perform_create(self, serializer):
        serializer.save(ajoute_par=self.request.user)
