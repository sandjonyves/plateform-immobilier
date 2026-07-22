"""Helpers journalisation activités admin."""

from .models import ActivityLog


def log_activity(*, acteur, action: str, cible_type: str, cible_id, message: str) -> ActivityLog:
    return ActivityLog.objects.create(
        acteur=acteur if acteur and getattr(acteur, 'is_authenticated', False) else None,
        action=action,
        cible_type=cible_type,
        cible_id=cible_id,
        message=message,
    )
