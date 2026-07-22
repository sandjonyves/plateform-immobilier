from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TerrainViewSet

router = DefaultRouter()
router.register(r'terrains', TerrainViewSet, basename='terrain')

urlpatterns = [
    path('', include(router.urls)),
]
