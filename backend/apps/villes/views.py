from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny

from .models import Ville
from .serializers import VilleSerializer


@extend_schema_view(
    list=extend_schema(tags=['Villes']),
    retrieve=extend_schema(tags=['Villes']),
)
class VilleViewSet(viewsets.ReadOnlyModelViewSet):
    """Liste publique des villes camerounaises actives."""

    permission_classes = [AllowAny]
    serializer_class = VilleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['region', 'actif']
    search_fields = ['nom', 'region']
    ordering_fields = ['nom', 'region']
    ordering = ['nom']

    def get_queryset(self):
        qs = Ville.objects.all()
        if self.request.query_params.get('all') != '1':
            qs = qs.filter(actif=True)
        return qs
