"""Services métier — Maisons."""

from django.db import transaction

from .models import Maison


class MaisonService:
    @staticmethod
    @transaction.atomic
    def create(*, data: dict, created_by) -> Maison:
        maison = Maison(created_by=created_by, **data)
        maison.save()
        return maison

    @staticmethod
    @transaction.atomic
    def update(maison: Maison, data: dict) -> Maison:
        for field, value in data.items():
            setattr(maison, field, value)
        maison.save()
        return maison

    @staticmethod
    def archiver(maison: Maison) -> Maison:
        return maison.archiver()
