"""Endpoints analytics / dashboard / carte."""

from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
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


class ActivitesView(APIView):
    """Fil d'activités administrateurs — admin."""

    permission_classes = [IsAdmin]

    @extend_schema(tags=['Analytics'])
    def get(self, request):
        limit = int(request.query_params.get('limit', 20))
        return Response(AnalyticsService.activites(limit=min(limit, 50)))


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
