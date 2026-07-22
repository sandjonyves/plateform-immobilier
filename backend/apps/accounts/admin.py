"""Admin Django — utilisateurs Immopro."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, UserPreference


class UserPreferenceInline(admin.StackedInline):
    model = UserPreference
    can_delete = False
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'prenom', 'nom', 'role', 'statut', 'is_staff', 'date_inscription')
    list_filter = ('role', 'statut', 'is_staff')
    search_fields = ('email', 'prenom', 'nom', 'telephone')
    ordering = ('-date_inscription',)
    inlines = [UserPreferenceInline]

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Identité', {'fields': ('prenom', 'nom', 'telephone', 'ville', 'avatar')}),
        ('Rôles', {'fields': ('role', 'statut', 'is_active', 'is_staff', 'is_superuser')}),
        ('Dates', {'fields': ('date_inscription', 'derniere_connexion', 'last_login')}),
        ('Permissions', {'fields': ('groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('email', 'prenom', 'nom', 'role', 'password1', 'password2'),
            },
        ),
    )
    readonly_fields = ('date_inscription', 'derniere_connexion', 'last_login')
    filter_horizontal = ('groups', 'user_permissions')
