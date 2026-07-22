from django.contrib import admin

from .models import Terrain


@admin.register(Terrain)
class TerrainAdmin(admin.ModelAdmin):
    list_display = ('titre', 'ville', 'quartier', 'statut', 'prix', 'surface_m2', 'date_ajout')
    list_filter = ('statut', 'ville')
    search_fields = ('titre', 'quartier', 'titre_foncier')
    readonly_fields = ('surface_m2', 'date_ajout', 'created_at', 'updated_at')
    raw_id_fields = ('created_by',)
