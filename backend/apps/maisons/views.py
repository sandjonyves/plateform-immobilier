"""Vues API — Maisons."""

from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.common.permissions import IsAdmin

from .filters import MaisonFilter
from .models import Maison
from .serializers import MaisonSerializer, MaisonWriteSerializer
from .services import MaisonService


@extend_schema_view(
    list=extend_schema(tags=['Maisons']),
    retrieve=extend_schema(tags=['Maisons']),
    create=extend_schema(tags=['Maisons']),
    update=extend_schema(tags=['Maisons']),
    partial_update=extend_schema(tags=['Maisons']),
    destroy=extend_schema(tags=['Maisons']),
)
class MaisonViewSet(viewsets.ModelViewSet):
    """CRUD Maisons — lecture publique, écriture admin."""

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MaisonFilter
    search_fields = ['titre', 'quartier', 'ville', 'description']
    ordering_fields = ['date_ajout', 'prix', 'surface_m2', 'titre']
    ordering = ['-date_ajout']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = Maison.objects.select_related('created_by')
        user = self.request.user
        if not (user.is_authenticated and getattr(user, 'role', None) == 'admin'):
            qs = qs.exclude(statut=Maison.Statut.ARCHIVE)
        return qs

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return MaisonWriteSerializer
        return MaisonSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        maison = MaisonService.create(
            data=serializer.validated_data,
            created_by=request.user,
        )
        return Response(
            MaisonSerializer(maison, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        maison = MaisonService.update(instance, serializer.validated_data)
        return Response(MaisonSerializer(maison, context={'request': request}).data)

    @extend_schema(tags=['Maisons'], responses={200: MaisonSerializer})
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def archiver(self, request, pk=None):
        maison = self.get_object()
        try:
            MaisonService.archiver(maison)
        except ValueError as exc:
            return Response(
                {'success': False, 'error': {'detail': str(exc), 'code': 'bad_request'}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(MaisonSerializer(maison, context={'request': request}).data)
