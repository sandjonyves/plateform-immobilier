from django.urls import path

from .views import ActivitesView, CarteView, OverviewView, RapportsView

urlpatterns = [
    path('analytics/overview/', OverviewView.as_view(), name='analytics-overview'),
    path('analytics/activites/', ActivitesView.as_view(), name='analytics-activites'),
    path('analytics/rapports/', RapportsView.as_view(), name='analytics-rapports'),
    path('carte/', CarteView.as_view(), name='carte'),
]
