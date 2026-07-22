"""
Services d'agrégation pour le dashboard et les rapports.

Aucun paiement : le CA est la somme des montants déclaratifs
des ventes confirmées.
"""

from calendar import month_abbr
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone

from apps.maisons.models import Maison
from apps.terrains.models import Terrain
from apps.ventes.models import Vente

User = get_user_model()


class AnalyticsService:
    @staticmethod
    def overview() -> dict:
        """KPIs de la page Overview / dashboard."""
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        terrains_dispo = Terrain.objects.filter(statut=Terrain.Statut.DISPONIBLE).count()
        maisons_dispo = Maison.objects.filter(statut=Maison.Statut.DISPONIBLE).count()
        clients = User.objects.filter(role=User.Role.CLIENT).count()
        ventes_mois = Vente.objects.filter(
            date_vente__gte=month_start,
            statut=Vente.Statut.CONFIRMEE,
        )
        ca_mois = ventes_mois.aggregate(total=Sum('montant'))['total'] or Decimal('0')

        return {
            'terrains_disponibles': terrains_dispo,
            'maisons_disponibles': maisons_dispo,
            'biens_disponibles': terrains_dispo + maisons_dispo,
            'clients': clients,
            'ventes_mois': ventes_mois.count(),
            'ca_mois': int(ca_mois),
            'terrains_total': Terrain.objects.count(),
            'maisons_total': Maison.objects.count(),
            'ventes_en_attente': Vente.objects.filter(
                statut=Vente.Statut.EN_ATTENTE
            ).count(),
        }

    @staticmethod
    def rapports() -> dict:
        """Données pour la page Rapports (12 mois, répartition, villes)."""
        now = timezone.now()
        start = (now - timedelta(days=365)).replace(day=1)

        # CA mensuel ventes (terrains / maisons)
        qs = (
            Vente.objects.filter(
                statut=Vente.Statut.CONFIRMEE,
                date_vente__gte=start,
            )
            .annotate(mois=TruncMonth('date_vente'))
            .values('mois', 'bien_type')
            .annotate(total=Sum('montant'), count=Count('id'))
            .order_by('mois')
        )

        terrains_par_mois: dict[str, int] = {}
        maisons_par_mois: dict[str, int] = {}
        for row in qs:
            key = row['mois'].strftime('%Y-%m')
            amount = int(row['total'] or 0)
            if row['bien_type'] == Vente.BienType.TERRAIN:
                terrains_par_mois[key] = terrains_par_mois.get(key, 0) + amount
            else:
                maisons_par_mois[key] = maisons_par_mois.get(key, 0) + amount

        # Série 12 mois complète
        series = []
        cursor = start
        for _ in range(12):
            key = cursor.strftime('%Y-%m')
            series.append(
                {
                    'mois': key,
                    'label': f'{month_abbr[cursor.month]} {cursor.year}',
                    'terrains': terrains_par_mois.get(key, 0),
                    'maisons': maisons_par_mois.get(key, 0),
                    'ventes': terrains_par_mois.get(key, 0) + maisons_par_mois.get(key, 0),
                }
            )
            # mois suivant
            if cursor.month == 12:
                cursor = cursor.replace(year=cursor.year + 1, month=1)
            else:
                cursor = cursor.replace(month=cursor.month + 1)

        # Répartition types de maisons
        types_maisons = list(
            Maison.objects.values('type').annotate(count=Count('id')).order_by('-count')
        )

        # Valeur portefeuille par ville (biens disponibles)
        villes_terrains = (
            Terrain.objects.filter(statut=Terrain.Statut.DISPONIBLE)
            .values('ville__nom')
            .annotate(valeur=Sum('prix'), count=Count('id'))
        )
        villes_maisons = (
            Maison.objects.filter(statut=Maison.Statut.DISPONIBLE)
            .values('ville__nom')
            .annotate(valeur=Sum('prix'), count=Count('id'))
        )
        villes: dict[str, dict] = {}
        for row in list(villes_terrains) + list(villes_maisons):
            v = row['ville__nom']
            entry = villes.setdefault(v, {'ville': v, 'valeur': 0, 'count': 0})
            entry['valeur'] += int(row['valeur'] or 0)
            entry['count'] += row['count']

        return {
            'ca_12_mois': series,
            'repartition_types_maisons': types_maisons,
            'valeur_par_ville': sorted(villes.values(), key=lambda x: -x['valeur']),
            'ventes_par_statut': list(
                Vente.objects.values('statut').annotate(count=Count('id'))
            ),
        }

    @staticmethod
    def carte() -> dict:
        """
        Données agrégées pour les pages carte (admin + client).
        Terrains avec bornes + maisons avec localisation.
        """
        terrains = Terrain.objects.exclude(statut=Terrain.Statut.ARCHIVE).values(
            'id',
            'titre',
            'statut',
            'prix',
            'ville__nom',
            'quartier',
            'bornes',
            'surface_m2',
        )
        maisons = Maison.objects.exclude(statut=Maison.Statut.ARCHIVE).values(
            'id',
            'titre',
            'type',
            'statut',
            'prix',
            'ville__nom',
            'quartier',
            'latitude',
            'longitude',
            'surface_m2',
        )
        return {
            'terrains': [
                {**t, 'ville': t.pop('ville__nom')} for t in terrains
            ],
            'maisons': [
                {
                    **{k: v for k, v in m.items() if k not in ('latitude', 'longitude', 'ville__nom')},
                    'ville': m['ville__nom'],
                    'localisation': {
                        'latitude': m['latitude'],
                        'longitude': m['longitude'],
                    },
                }
                for m in maisons
            ],
        }
