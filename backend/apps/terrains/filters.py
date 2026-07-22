"""Filtres terrains."""

import django_filters

from .models import Terrain


class TerrainFilter(django_filters.FilterSet):
    """
    Filtres alignés sur l'UI admin / client :
    statut, ville, prix_max, q (via SearchFilter).
    """

    ville = django_filters.CharFilter(lookup_expr='iexact')
    statut = django_filters.ChoiceFilter(choices=Terrain.Statut.choices)
    prix_max = django_filters.NumberFilter(field_name='prix', lookup_expr='lte')
    prix_min = django_filters.NumberFilter(field_name='prix', lookup_expr='gte')

    class Meta:
        model = Terrain
        fields = ['statut', 'ville', 'prix_max', 'prix_min']
