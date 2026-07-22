from django.contrib import admin

from .models import Ville


@admin.register(Ville)
class VilleAdmin(admin.ModelAdmin):
    list_display = ('nom', 'region', 'actif', 'slug')
    list_filter = ('region', 'actif')
    search_fields = ('nom', 'region')
    prepopulated_fields = {'slug': ('nom',)}
