"""Vues API — Agenda (admin)."""

import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema_view, extend_schema
from rest_framework import filters, viewsets

from apps.common.permissions import IsAdmin

from .models import Evenement
from .serializers import EvenementSerializer


class EvenementFilter(django_filters.FilterSet):
    date = django_filters.DateFilter()
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    type = django_filters.ChoiceFilter(choices=Evenement.Type.choices)
    month = django_filters.NumberFilter(field_name='date', lookup_expr='month')
    year = django_filters.NumberFilter(field_name='date', lookup_expr='year')

    class Meta:
        model = Evenement
        fields = ['date', 'date_from', 'date_to', 'type', 'month', 'year']


@extend_schema_view(
    list=extend_schema(tags=['Agenda']),
    retrieve=extend_schema(tags=['Agenda']),
    create=extend_schema(tags=['Agenda']),
    update=extend_schema(tags=['Agenda']),
    partial_update=extend_schema(tags=['Agenda']),
    destroy=extend_schema(tags=['Agenda']),
)
class EvenementViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class = EvenementSerializer
    queryset = Evenement.objects.select_related('created_by').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EvenementFilter
    search_fields = ['titre', 'lieu']
    ordering_fields = ['date', 'heure', 'titre']
    ordering = ['date', 'heure']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
