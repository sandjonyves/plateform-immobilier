"""Endpoints analytics / dashboard / carte."""

from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsAdmin

from .services import AnalyticsService


class OverviewView(APIView):
    """KPIs dashboard — admin."""

    permission_classes = [IsAdmin]

    @extend_schema(tags=['Analytics'])
    def get(self, request):
        return Response(AnalyticsService.overview())


class RapportsView(APIView):
    """Données page Rapports — admin."""

    permission_classes = [IsAdmin]

    @extend_schema(tags=['Analytics'])
    def get(self, request):
        return Response(AnalyticsService.rapports())


class CarteView(APIView):
    """
    Géométries pour Cesium / carte.

    Public : exclut les archives (déjà filtré dans le service).
    """

    permission_classes = [AllowAny]

    @extend_schema(tags=['Carte'])
    def get(self, request):
        return Response(AnalyticsService.carte())
