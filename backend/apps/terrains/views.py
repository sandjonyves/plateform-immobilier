"""Vues API — Terrains."""

from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsAdmin, IsAdminOrReadOnly

from .filters import TerrainFilter
from .models import Terrain
from .serializers import TerrainSerializer, TerrainWriteSerializer
from .services import TerrainService


@extend_schema_view(
    list=extend_schema(tags=['Terrains']),
    retrieve=extend_schema(tags=['Terrains']),
    create=extend_schema(tags=['Terrains']),
    update=extend_schema(tags=['Terrains']),
    partial_update=extend_schema(tags=['Terrains']),
    destroy=extend_schema(tags=['Terrains']),
)
class TerrainViewSet(viewsets.ModelViewSet):
    """
    CRUD Terrains.

    - Lecture publique (catalogue) : biens non archivés
    - Écriture : admin uniquement
    """

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TerrainFilter
    search_fields = ['titre', 'quartier', 'ville__nom', 'description', 'titre_foncier']
    ordering_fields = ['date_ajout', 'prix', 'surface_m2', 'titre']
    ordering = ['-date_ajout']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = Terrain.objects.select_related('created_by')
        # Catalogue public : masquer les archives sauf pour admin authentifié
        user = self.request.user
        if not (user.is_authenticated and getattr(user, 'role', None) == 'admin'):
            qs = qs.exclude(statut=Terrain.Statut.ARCHIVE)
        return qs

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return TerrainWriteSerializer
        return TerrainSerializer

    def perform_create(self, serializer):
        terrain = TerrainService.create(
            data=serializer.validated_data,
            created_by=self.request.user,
        )
        serializer.instance = terrain

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        terrain = TerrainService.create(
            data=serializer.validated_data,
            created_by=request.user,
        )
        out = TerrainSerializer(terrain, context={'request': request})
        return Response(out.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        terrain = TerrainService.update(instance, serializer.validated_data)
        return Response(TerrainSerializer(terrain, context={'request': request}).data)

    @extend_schema(tags=['Terrains'], responses={200: TerrainSerializer})
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def archiver(self, request, pk=None):
        """Archive un terrain (statut=archive)."""
        terrain = self.get_object()
        try:
            TerrainService.archiver(terrain)
        except ValueError as exc:
            return Response(
                {'success': False, 'error': {'detail': str(exc), 'code': 'bad_request'}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(TerrainSerializer(terrain, context={'request': request}).data)
