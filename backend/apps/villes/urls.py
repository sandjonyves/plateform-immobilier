from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import VilleViewSet

router = DefaultRouter()
router.register(r'villes', VilleViewSet, basename='ville')

urlpatterns = [
    path('', include(router.urls)),
]
