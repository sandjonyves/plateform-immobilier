"""Services métier — Maisons."""

from django.db import transaction

from apps.analytics.activity import log_activity
from apps.analytics.models import ActivityLog

from .models import Maison


class MaisonService:
    @staticmethod
    @transaction.atomic
    def create(*, data: dict, created_by) -> Maison:
        maison = Maison(created_by=created_by, **data)
        maison.save()
        log_activity(
            acteur=created_by,
            action=ActivityLog.Action.MAISON_PUBLIEE,
            cible_type='maison',
            cible_id=maison.id,
            message=f'Maison publiée : {maison.titre}',
        )
        return maison

    @staticmethod
    @transaction.atomic
    def update(maison: Maison, data: dict, *, acteur=None) -> Maison:
        for field, value in data.items():
            setattr(maison, field, value)
        maison.save()
        log_activity(
            acteur=acteur or maison.created_by,
            action=ActivityLog.Action.MAISON_MODIFIEE,
            cible_type='maison',
            cible_id=maison.id,
            message=f'Maison modifiée : {maison.titre}',
        )
        return maison

    @staticmethod
    @transaction.atomic
    def archiver(maison: Maison, *, acteur=None) -> Maison:
        maison.archiver()
        log_activity(
            acteur=acteur or maison.created_by,
            action=ActivityLog.Action.MAISON_ARCHIVEE,
            cible_type='maison',
            cible_id=maison.id,
            message=f'Maison archivée : {maison.titre}',
        )
        return maison
