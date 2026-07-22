"""Importe / met à jour le catalogue des services commerciaux."""

from django.core.management.base import BaseCommand

from apps.services.data.seed import SERVICES_SEED
from apps.services.models import Service


class Command(BaseCommand):
    help = 'Importe les services commerciaux (seed Immopro).'

    def handle(self, *args, **options):
        created = updated = 0
        for (
            slug,
            titre,
            description,
            details,
            prix,
            icon,
            categorie,
            ordre,
            phare,
        ) in SERVICES_SEED:
            _, was_created = Service.objects.update_or_create(
                slug=slug,
                defaults={
                    'titre': titre,
                    'description': description,
                    'details': details,
                    'prix_indicatif': prix,
                    'icon': icon,
                    'categorie': categorie,
                    'ordre': ordre,
                    'phare': phare,
                    'actif': True,
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1
        self.stdout.write(
            self.style.SUCCESS(f'Services : {created} créés, {updated} mis à jour.')
        )
