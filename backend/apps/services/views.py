from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny

from apps.common.permissions import IsAdmin

from .models import Service
from .serializers import ServiceSerializer


@extend_schema_view(
    list=extend_schema(tags=['Services']),
    retrieve=extend_schema(tags=['Services']),
    create=extend_schema(tags=['Services']),
    update=extend_schema(tags=['Services']),
    partial_update=extend_schema(tags=['Services']),
    destroy=extend_schema(tags=['Services']),
)
class ServiceViewSet(viewsets.ModelViewSet):
    """
    Catalogue des services commerciaux.

    - Lecture publique : services actifs
    - Écriture : admin uniquement
    """

    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categorie', 'actif', 'phare']
    search_fields = ['titre', 'description', 'slug']
    ordering_fields = ['ordre', 'titre', 'created_at']
    ordering = ['ordre', 'titre']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = Service.objects.all()
        user = self.request.user
        is_admin = (
            user.is_authenticated
            and getattr(user, 'role', None) == 'admin'
        )
        # Catalogue public : actifs seulement (sauf admin qui demande ?all=1)
        if not is_admin or self.request.query_params.get('all') != '1':
            if self.action in ('list', 'retrieve'):
                qs = qs.filter(actif=True)
        return qs
