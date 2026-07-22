from django.contrib import admin

from .models import Vente


@admin.register(Vente)
class VenteAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'bien_type', 'montant', 'statut', 'client', 'date_vente')
    list_filter = ('type', 'statut', 'bien_type')
    search_fields = ('bien_id', 'client__email')
    raw_id_fields = ('client', 'created_by')
    readonly_fields = ('date_vente', 'created_at', 'updated_at')
