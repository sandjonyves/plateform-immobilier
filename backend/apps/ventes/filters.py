import django_filters

from .models import Vente


class VenteFilter(django_filters.FilterSet):
    type = django_filters.ChoiceFilter(choices=Vente.Type.choices)
    statut = django_filters.ChoiceFilter(choices=Vente.Statut.choices)
    bien_type = django_filters.ChoiceFilter(choices=Vente.BienType.choices)
    client_id = django_filters.UUIDFilter(field_name='client_id')

    class Meta:
        model = Vente
        fields = ['type', 'statut', 'bien_type', 'client_id']
