from django.contrib import admin

from .models import Evenement


@admin.register(Evenement)
class EvenementAdmin(admin.ModelAdmin):
    list_display = ('titre', 'type', 'date', 'heure', 'lieu')
    list_filter = ('type', 'date')
    search_fields = ('titre', 'lieu')
    raw_id_fields = ('created_by',)
    filter_horizontal = ('participants_users',)
