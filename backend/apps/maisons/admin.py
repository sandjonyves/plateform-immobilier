from django.contrib import admin

from .models import Maison


@admin.register(Maison)
class MaisonAdmin(admin.ModelAdmin):
    list_display = ('titre', 'type', 'ville', 'statut', 'prix', 'chambres', 'date_ajout')
    list_filter = ('type', 'statut', 'ville')
    search_fields = ('titre', 'quartier', 'titre_foncier')
    readonly_fields = ('date_ajout', 'created_at', 'updated_at')
    raw_id_fields = ('created_by',)
