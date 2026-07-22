from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MaisonViewSet

router = DefaultRouter()
router.register(r'maisons', MaisonViewSet, basename='maison')

urlpatterns = [
    path('', include(router.urls)),
]
