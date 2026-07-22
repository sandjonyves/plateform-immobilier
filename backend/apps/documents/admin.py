from django.contrib import admin

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('nom', 'type', 'taille_kb', 'bien_associe', 'ajoute_par', 'date_ajout')
    list_filter = ('type', 'bien_type')
    search_fields = ('nom', 'bien_associe')
    raw_id_fields = ('ajoute_par',)
