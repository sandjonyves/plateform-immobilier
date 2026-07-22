"""
Utilitaires géographiques.

Calcul de surface d'un polygone GPS via la formule du lacet (Shoelace),
adaptée aux coordonnées WGS84 (approximation plane locale).
"""

from math import cos, radians
from typing import Sequence


def calculer_surface_m2(bornes: Sequence[dict]) -> float:
    """
    Calcule la surface approximative en m² d'un polygone GPS.

    Args:
        bornes: liste de dicts ``{"latitude": float, "longitude": float}``
                (minimum 3 points).

    Returns:
        Surface arrondie à 2 décimales.

    Raises:
        ValueError: si moins de 3 bornes.
    """
    if len(bornes) < 3:
        raise ValueError('Un polygone nécessite au minimum 3 bornes GPS.')

    # Conversion locale mètres autour du centroïde
    lats = [float(b['latitude']) for b in bornes]
    lngs = [float(b['longitude']) for b in bornes]
    lat0 = sum(lats) / len(lats)

    meters_per_deg_lat = 111_320.0
    meters_per_deg_lng = 111_320.0 * cos(radians(lat0))

    xs = [(lng - lngs[0]) * meters_per_deg_lng for lng in lngs]
    ys = [(lat - lats[0]) * meters_per_deg_lat for lat in lats]

    # Formule du lacet
    area = 0.0
    n = len(xs)
    for i in range(n):
        j = (i + 1) % n
        area += xs[i] * ys[j]
        area -= xs[j] * ys[i]

    return round(abs(area) / 2.0, 2)


def valider_bornes(bornes: Sequence[dict]) -> list[dict]:
    """
    Valide et normalise une liste de bornes GPS.

    Raises:
        ValueError: si format invalide ou moins de 3 points.
    """
    if not isinstance(bornes, (list, tuple)) or len(bornes) < 3:
        raise ValueError('Au minimum 3 bornes GPS sont requises.')

    result = []
    for i, b in enumerate(bornes):
        if not isinstance(b, dict):
            raise ValueError(f'Borne #{i + 1}: format invalide.')
        try:
            lat = float(b['latitude'])
            lng = float(b['longitude'])
        except (KeyError, TypeError, ValueError) as exc:
            raise ValueError(
                f'Borne #{i + 1}: latitude et longitude numériques requises.'
            ) from exc
        if not -90 <= lat <= 90:
            raise ValueError(f'Borne #{i + 1}: latitude hors plage [-90, 90].')
        if not -180 <= lng <= 180:
            raise ValueError(f'Borne #{i + 1}: longitude hors plage [-180, 180].')
        result.append({'latitude': lat, 'longitude': lng})

    return result
