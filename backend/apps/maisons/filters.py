import django_filters

from .models import Maison


class MaisonFilter(django_filters.FilterSet):
    ville = django_filters.CharFilter(field_name='ville__nom', lookup_expr='iexact')
    ville_id = django_filters.UUIDFilter(field_name='ville_id')
    type = django_filters.ChoiceFilter(choices=Maison.Type.choices)
    statut = django_filters.ChoiceFilter(choices=Maison.Statut.choices)
    prix_max = django_filters.NumberFilter(field_name='prix', lookup_expr='lte')
    prix_min = django_filters.NumberFilter(field_name='prix', lookup_expr='gte')

    class Meta:
        model = Maison
        fields = ['type', 'statut', 'ville', 'ville_id', 'prix_max', 'prix_min']
