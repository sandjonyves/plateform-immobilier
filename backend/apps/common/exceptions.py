"""
Gestionnaire d'exceptions DRF personnalisé.

Uniformise le format des réponses d'erreur JSON.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Enrichit la réponse d'erreur DRF avec un format cohérent :

    {
        "success": false,
        "error": { "detail": "...", "code": "...", "fields": {...} }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        data = {
            'success': False,
            'error': {
                'detail': _extract_detail(response.data),
                'code': _status_to_code(response.status_code),
            },
        }
        # Erreurs de validation par champ
        if isinstance(response.data, dict) and any(
            isinstance(v, (list, dict)) for v in response.data.values()
        ):
            data['error']['fields'] = response.data

        response.data = data

    return response


def _extract_detail(data):
    """Extrait un message lisible depuis les données d'erreur DRF."""
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        # Première erreur de champ
        for key, value in data.items():
            if isinstance(value, list) and value:
                return f'{key}: {value[0]}'
            return f'{key}: {value}'
    if isinstance(data, list) and data:
        return str(data[0])
    return str(data)


def _status_to_code(status_code: int) -> str:
    """Mappe un code HTTP vers un code symbolique."""
    mapping = {
        status.HTTP_400_BAD_REQUEST: 'bad_request',
        status.HTTP_401_UNAUTHORIZED: 'unauthorized',
        status.HTTP_403_FORBIDDEN: 'forbidden',
        status.HTTP_404_NOT_FOUND: 'not_found',
        status.HTTP_405_METHOD_NOT_ALLOWED: 'method_not_allowed',
        status.HTTP_409_CONFLICT: 'conflict',
        status.HTTP_429_TOO_MANY_REQUESTS: 'throttled',
    }
    return mapping.get(status_code, 'error')
