"""
URL racine Immopro Central API.

Documentation Swagger : /api/docs/
Schema OpenAPI      : /api/schema/
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='schema'),
        name='swagger-ui',
    ),
    # API v1
    path('api/v1/', include('apps.accounts.urls')),
    path('api/v1/', include('apps.villes.urls')),
    path('api/v1/', include('apps.terrains.urls')),
    path('api/v1/', include('apps.maisons.urls')),
    path('api/v1/', include('apps.ventes.urls')),
    path('api/v1/', include('apps.agenda.urls')),
    path('api/v1/', include('apps.documents.urls')),
    path('api/v1/', include('apps.analytics.urls')),
    path('api/v1/', include('apps.services.urls')),
    path('api/v1/', include('apps.common.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
