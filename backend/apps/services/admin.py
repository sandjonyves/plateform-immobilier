from django.contrib import admin

from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('titre', 'categorie', 'ordre', 'actif', 'phare', 'prix_indicatif')
    list_filter = ('categorie', 'actif', 'phare')
    search_fields = ('titre', 'slug', 'description')
    prepopulated_fields = {'slug': ('titre',)}
    ordering = ('ordre', 'titre')
