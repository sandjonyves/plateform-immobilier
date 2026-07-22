"""Charge le référentiel des villes camerounaises."""

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.villes.data.cameroun import VILLES_CAMEROUN
from apps.villes.models import Ville


class Command(BaseCommand):
    help = 'Importe / met à jour la liste des villes du Cameroun.'

    def handle(self, *args, **options):
        created = updated = 0
        for nom, region in VILLES_CAMEROUN:
            obj, was_created = Ville.objects.update_or_create(
                nom=nom,
                defaults={
                    'region': region,
                    'slug': slugify(nom),
                    'actif': True,
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1
        self.stdout.write(
            self.style.SUCCESS(f'Villes : {created} créées, {updated} mises à jour.')
        )
