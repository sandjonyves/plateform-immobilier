"""Routes API — comptes & authentification."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ChangePasswordView,
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    PreferencesView,
    RefreshTokenView,
    RegisterView,
    UserViewSet,
)

router = DefaultRouter()
router.register(r'utilisateurs', UserViewSet, basename='utilisateur')

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='auth-refresh'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/password/change/', ChangePasswordView.as_view(), name='auth-password-change'),
    path('auth/password/reset/', PasswordResetRequestView.as_view(), name='auth-password-reset'),
    path(
        'auth/password/reset/confirm/',
        PasswordResetConfirmView.as_view(),
        name='auth-password-reset-confirm',
    ),
    path('auth/preferences/', PreferencesView.as_view(), name='auth-preferences'),
    # CRUD utilisateurs (admin)
    path('', include(router.urls)),
]
