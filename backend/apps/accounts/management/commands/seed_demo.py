"""
Commande de seed — peuplement initial proche des mocks frontend.

Usage :
    python manage.py seed_demo
"""

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from django.core.files.base import ContentFile

from apps.agenda.models import Evenement
from apps.documents.models import Document
from apps.maisons.models import Maison
from apps.terrains.models import Terrain
from apps.villes.models import Ville
from apps.ventes.models import Vente

User = get_user_model()

# Rond-Point / Poste centrale de Yaoundé (Bd du 20 Mai) — WGS84
# Réf. approx. Open Location Code VG6C+J64 → 3.8607°N, 11.5185°E
POSTE_CENTRALE_LAT = 3.8607
POSTE_CENTRALE_LNG = 11.5185


def _bornes_autour(lat: float, lng: float, scale: float = 1.0) -> list[dict]:
    """Polygone 4 bornes autour d'un point (visible en Cesium 3D)."""
    d = 0.00055 * scale  # ~60 m
    return [
        {'latitude': lat - d, 'longitude': lng - d},
        {'latitude': lat - d, 'longitude': lng + d * 1.2},
        {'latitude': lat + d * 1.1, 'longitude': lng + d},
        {'latitude': lat + d * 0.9, 'longitude': lng - d * 0.8},
    ]


class Command(BaseCommand):
    help = 'Peuple la base avec des données de démonstration Immopro (autour Poste centrale Yaoundé).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset-biens',
            action='store_true',
            help='Supprime terrains/maisons existants avant de re-seed (GPS Poste centrale).',
        )

    def handle(self, *args, **options):
        self.stdout.write('Seed Immopro Central…')
        self.stdout.write(
            f'  Ancrage GPS Poste centrale Yaoundé : '
            f'{POSTE_CENTRALE_LAT}, {POSTE_CENTRALE_LNG}'
        )

        if options.get('reset_biens'):
            Vente.objects.all().delete()
            Terrain.objects.all().delete()
            Maison.objects.all().delete()
            self.stdout.write(self.style.WARNING('  Terrains / maisons / ventes réinitialisés.'))

        admin, _ = User.objects.get_or_create(
            email='jean.tchoumi@immopro.cm',
            defaults={
                'prenom': 'Jean',
                'nom': 'Tchoumi',
                'telephone': '+237 690000001',
                'role': User.Role.ADMIN,
                'statut': User.Statut.ACTIF,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        # Toujours réaligner le mot de passe démo (évite « Identifiants invalides »).
        admin.set_password('Admin123!')
        admin.role = User.Role.ADMIN
        admin.statut = User.Statut.ACTIF
        admin.is_staff = True
        admin.is_superuser = True
        admin.is_active = True
        admin.save()

        clients_data = [
            ('aminatou.bello@immopro.cm', 'Aminatou', 'Bello'),
            ('eric.fotso@immopro.cm', 'Eric', 'Fotso'),
            ('linda.kamga@immopro.cm', 'Linda', 'Kamga'),
            ('patrick.onana@immopro.cm', 'Patrick', 'Onana'),
        ]
        clients = []
        for email, prenom, nom in clients_data:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'prenom': prenom,
                    'nom': nom,
                    'telephone': '+237 690000000',
                    'role': User.Role.CLIENT,
                    'statut': User.Statut.SUSPENDU if 'linda' in email else User.Statut.ACTIF,
                },
            )
            if created or not user.has_usable_password() or email == 'aminatou.bello@immopro.cm':
                user.set_password('Client123!')
                user.save()
            clients.append(user)

        # Cluster dense autour de la Poste centrale (test carte )
        lat0, lng0 = POSTE_CENTRALE_LAT, POSTE_CENTRALE_LNG
        terrains_spec = [
            # Point d'ancrage exact Poste centrale
            (
                'Parcelle Poste Centrale',
                'Yaoundé',
                'Centre-ville',
                95_000_000,
                Terrain.Statut.DISPONIBLE,
                lat0,
                lng0,
                1.0,
            ),
            (
                'Terrain Bd 20 Mai Nord',
                'Yaoundé',
                'Centre-ville',
                72_000_000,
                Terrain.Statut.EN_NEGOCIATION,
                lat0 + 0.0012,
                lng0 + 0.0004,
                0.9,
            ),
            (
                'Lot Avenue Kennedy',
                'Yaoundé',
                'Centre-ville',
                110_000_000,
                Terrain.Statut.DISPONIBLE,
                lat0 - 0.0009,
                lng0 + 0.0011,
                1.1,
            ),
            (
                'Terrain Marché Central',
                'Yaoundé',
                'Centre-ville',
                58_000_000,
                Terrain.Statut.DISPONIBLE,
                lat0 + 0.0006,
                lng0 - 0.0014,
                0.85,
            ),
            (
                'Parcelle Hippodrome',
                'Yaoundé',
                'Hippodrome',
                48_000_000,
                Terrain.Statut.DISPONIBLE,
                lat0 + 0.0045,
                lng0 + 0.0020,
                1.0,
            ),
            (
                'Terrain Bastos Nord',
                'Yaoundé',
                'Bastos',
                85_000_000,
                Terrain.Statut.DISPONIBLE,
                lat0 + 0.0288,
                lng0 - 0.0011,
                1.2,
            ),
            (
                'Parcelle Nlongkak',
                'Yaoundé',
                'Nlongkak',
                42_000_000,
                Terrain.Statut.EN_NEGOCIATION,
                lat0 + 0.0163,
                lng0 - 0.0005,
                1.0,
            ),
        ]
        from django.core.management import call_command
        call_command('seed_villes')
        yaounde = Ville.objects.get(nom='Yaoundé')

        terrains = []
        for titre, ville_nom, quartier, prix, statut, lat, lng, scale in terrains_spec:
            ville_obj = Ville.objects.filter(nom__iexact=ville_nom).first() or yaounde
            bornes = _bornes_autour(lat, lng, scale)
            t, created = Terrain.objects.get_or_create(
                titre=titre,
                defaults={
                    'bornes': bornes,
                    'statut': statut,
                    'prix': Decimal(prix),
                    'ville': ville_obj,
                    'quartier': quartier,
                    'description': (
                        f'Terrain à {quartier}, {ville_obj.nom}. '
                        f'Ancré près de la Poste centrale ({POSTE_CENTRALE_LAT}, {POSTE_CENTRALE_LNG}).'
                    ),
                    'titre_foncier': f'TF-{titre[:10].replace(" ", "")}-2024',
                    'photos': [],
                    'videos': [],
                    'documents': [],
                    'created_by': admin,
                },
            )
            # Toujours rafraîchir le GPS pour le test 3D
            t.bornes = bornes
            t.statut = statut
            t.prix = Decimal(prix)
            t.ville = ville_obj
            t.quartier = quartier
            t.save()
            terrains.append(t)
            mark = 'créé' if created else 'GPS mis à jour'
            self.stdout.write(f'  · Terrain « {titre} » ({lat:.4f}, {lng:.4f}) — {mark}')

        maisons_spec = [
            (
                'Immeuble Poste Centrale',
                'bureau',
                Maison.Statut.DISPONIBLE,
                'Yaoundé',
                'Centre-ville',
                280_000_000,
                0,
                4,
                680,
                6,
                lat0 + 0.00025,
                lng0 + 0.00035,
            ),
            (
                'Appartement Bd 20 Mai',
                'appartement',
                Maison.Statut.DISPONIBLE,
                'Yaoundé',
                'Centre-ville',
                95_000_000,
                3,
                2,
                125,
                4,
                lat0 + 0.0008,
                lng0 - 0.0006,
            ),
            (
                'Studio près Poste Centrale',
                'studio',
                Maison.Statut.LOUE,
                'Yaoundé',
                'Centre-ville',
                280_000,
                1,
                1,
                42,
                3,
                lat0 - 0.0005,
                lng0 + 0.0007,
            ),
            (
                'Villa moderne Bastos',
                'villa',
                Maison.Statut.DISPONIBLE,
                'Yaoundé',
                'Bastos',
                350_000_000,
                5,
                4,
                420,
                2,
                lat0 + 0.0283,
                lng0 - 0.0015,
            ),
            (
                'Duplex Hippodrome',
                'duplex',
                Maison.Statut.DISPONIBLE,
                'Yaoundé',
                'Hippodrome',
                165_000_000,
                4,
                3,
                260,
                2,
                lat0 + 0.0050,
                lng0 + 0.0025,
            ),
            (
                'Bureau Avenue Kennedy',
                'bureau',
                Maison.Statut.EN_TRAVAUX,
                'Yaoundé',
                'Centre-ville',
                120_000_000,
                0,
                2,
                310,
                5,
                lat0 - 0.0011,
                lng0 + 0.0013,
            ),
        ]
        maisons = []
        for titre, typ, statut, ville_nom, quartier, prix, ch, sdb, surf, etages, lat, lng in maisons_spec:
            ville_obj = Ville.objects.filter(nom__iexact=ville_nom).first() or yaounde
            m, created = Maison.objects.get_or_create(
                titre=titre,
                defaults={
                    'type': typ,
                    'statut': statut,
                    'prix': Decimal(prix),
                    'ville': ville_obj,
                    'quartier': quartier,
                    'description': (
                        f'{typ} à {quartier}. Visible depuis la Poste centrale de Yaoundé.'
                    ),
                    'surface_m2': surf,
                    'chambres': ch,
                    'salles_de_bain': sdb,
                    'etages': etages,
                    'latitude': lat,
                    'longitude': lng,
                    'photos': [],
                    'videos': [],
                    'documents': [],
                    'created_by': admin,
                },
            )
            m.type = typ
            m.statut = statut
            m.prix = Decimal(prix)
            m.ville = ville_obj
            m.quartier = quartier
            m.surface_m2 = surf
            m.chambres = ch
            m.salles_de_bain = sdb
            m.etages = etages
            m.latitude = lat
            m.longitude = lng
            m.save()
            maisons.append(m)
            mark = 'créée' if created else 'GPS mis à jour'
            self.stdout.write(f'  · Maison « {titre} » ({lat:.4f}, {lng:.4f}) — {mark}')

        # Ventes (suivi métier — pas de paiement)
        if terrains and maisons and clients:
            vente_specs = [
                (Vente.Type.VENTE, 'terrain', terrains[0], clients[0], 95_000_000, Vente.Statut.EN_ATTENTE),
                (Vente.Type.VENTE, 'maison', maisons[0], clients[1], 280_000_000, Vente.Statut.EN_ATTENTE),
                (Vente.Type.VENTE, 'maison', maisons[2], clients[3], 185_000_000, Vente.Statut.CONFIRMEE),
                (Vente.Type.VENTE, 'terrain', terrains[1], clients[0], 72_000_000, Vente.Statut.EN_ATTENTE),
                (Vente.Type.VENTE, 'terrain', terrains[5], clients[1], 85_000_000, Vente.Statut.EN_ATTENTE),
            ]
            for typ, bien_type, bien, client, montant, statut in vente_specs:
                Vente.objects.get_or_create(
                    type=typ,
                    bien_type=bien_type,
                    bien_id=bien.id,
                    client=client,
                    defaults={
                        'created_by': admin,
                        'montant': Decimal(montant),
                        'statut': statut,
                        'documents': [],
                    },
                )

        if not Evenement.objects.exists():
            today = timezone.localdate()
            Evenement.objects.create(
                titre='Visite Parcelle Poste Centrale',
                type=Evenement.Type.VISITE,
                date=today,
                heure='10:00',
                lieu='Poste centrale, Bd du 20 Mai, Yaoundé',
                participants=['Aminatou Bello', 'Jean Tchoumi'],
                created_by=admin,
            )
            Evenement.objects.create(
                titre='Signature Immeuble Poste Centrale',
                type=Evenement.Type.SIGNATURE,
                date=today,
                heure='15:30',
                lieu='Notaire Centre-ville Yaoundé',
                participants=['Eric Fotso'],
                created_by=admin,
            )

        if not Document.objects.exists() and terrains and maisons:
            docs = [
                ('TF-Poste-Centrale-2024.pdf', Document.Type.TITRE_FONCIER, 'Parcelle Poste Centrale'),
                ('Contrat_immeuble_Poste.pdf', Document.Type.CONTRAT, 'Immeuble Poste Centrale'),
                ('Plan_cadastral_Bd20Mai.pdf', Document.Type.AUTRE, 'Terrain Bd 20 Mai Nord'),
                ('Permis_Kennedy.pdf', Document.Type.PERMIS, 'Bureau Avenue Kennedy'),
                ('Contrat_studio_Poste.pdf', Document.Type.CONTRAT, 'Studio près Poste Centrale'),
            ]
            for nom, typ, bien in docs:
                doc = Document(
                    nom=nom,
                    type=typ,
                    bien_type=Document.BienType.AUCUN,
                    bien_associe=bien,
                    ajoute_par=admin,
                )
                doc.fichier.save(nom, ContentFile(b'%PDF-1.4\n% Immopro demo document\n'), save=False)
                doc.save()

        self.stdout.write(self.style.SUCCESS('Seed terminé.'))
        self.stdout.write(
            f'  Carte 3D : zoomez sur Poste centrale ({POSTE_CENTRALE_LAT}, {POSTE_CENTRALE_LNG})'
        )
        self.stdout.write('  Admin  : jean.tchoumi@immopro.cm / Admin123!')
        self.stdout.write('  Client : aminatou.bello@immopro.cm / Client123!')
