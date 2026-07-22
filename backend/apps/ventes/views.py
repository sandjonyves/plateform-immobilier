"""Vues API — Ventes (admin). Pas de paiement en ligne."""

import csv

from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.permissions import IsAdmin

from .filters import VenteFilter
from .models import Vente
from .serializers import VenteSerializer, VenteWriteSerializer
from .services import VenteService


@extend_schema_view(
    list=extend_schema(tags=['Ventes']),
    retrieve=extend_schema(tags=['Ventes']),
    create=extend_schema(tags=['Ventes']),
    update=extend_schema(tags=['Ventes']),
    partial_update=extend_schema(tags=['Ventes']),
    destroy=extend_schema(tags=['Ventes']),
)
class VenteViewSet(viewsets.ModelViewSet):
    """CRUD ventes — réservé aux admins."""

    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VenteFilter
    search_fields = ['bien_id', 'notes', 'client__email', 'client__nom', 'client__prenom']
    ordering_fields = ['date_vente', 'montant', 'statut']
    ordering = ['-date_vente']

    def get_queryset(self):
        return Vente.objects.select_related('client', 'created_by')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return VenteWriteSerializer
        return VenteSerializer

    def create(self, request, *args, **kwargs):
        serializer = VenteWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            vente = VenteService.create(
                data=serializer.validated_data_with_client(),
                created_by=request.user,
            )
        except ValueError as exc:
            return Response(
                {'success': False, 'error': {'detail': str(exc), 'code': 'bad_request'}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            VenteSerializer(vente, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = VenteWriteSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        try:
            vente = VenteService.update(instance, serializer.validated_data_with_client())
        except ValueError as exc:
            return Response(
                {'success': False, 'error': {'detail': str(exc), 'code': 'bad_request'}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(VenteSerializer(vente, context={'request': request}).data)

    @extend_schema(tags=['Ventes'])
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export CSV des ventes (bouton Exporter du frontend)."""
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="ventes.csv"'
        writer = csv.writer(response)
        writer.writerow(
            ['id', 'type', 'bien_type', 'bien_id', 'client', 'montant', 'statut', 'date']
        )
        for vente in self.filter_queryset(self.get_queryset()):
            writer.writerow(
                [
                    str(vente.id),
                    vente.type,
                    vente.bien_type,
                    str(vente.bien_id),
                    vente.client.email,
                    vente.montant,
                    vente.statut,
                    vente.date_vente.isoformat(),
                ]
            )
        return response
