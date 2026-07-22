"""
Helpers pour l'upload sécurisé de fichiers média.
"""

import uuid
from pathlib import Path

from django.core.exceptions import ValidationError


ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm', '.mov', '.avi'}
ALLOWED_DOCUMENT_EXTENSIONS = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'}

MAX_IMAGE_SIZE = 10 * 1024 * 1024   # 10 Mo
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 Mo
MAX_DOCUMENT_SIZE = 20 * 1024 * 1024  # 20 Mo


def upload_to_medias(instance, filename: str) -> str:
    """Génère un chemin unique sous media/uploads/YYYY/MM/."""
    ext = Path(filename).suffix.lower()
    unique = uuid.uuid4().hex
    return f'uploads/{unique}{ext}'


def validate_image_file(file) -> None:
    """Valide extension et taille d'une image."""
    ext = Path(file.name).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            f'Extension image non autorisée ({ext}). '
            f'Autorisées : {", ".join(sorted(ALLOWED_IMAGE_EXTENSIONS))}'
        )
    if file.size > MAX_IMAGE_SIZE:
        raise ValidationError('Image trop volumineuse (max 10 Mo).')


def validate_video_file(file) -> None:
    """Valide extension et taille d'une vidéo."""
    ext = Path(file.name).suffix.lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise ValidationError(
            f'Extension vidéo non autorisée ({ext}). '
            f'Autorisées : {", ".join(sorted(ALLOWED_VIDEO_EXTENSIONS))}'
        )
    if file.size > MAX_VIDEO_SIZE:
        raise ValidationError('Vidéo trop volumineuse (max 100 Mo).')


def validate_document_file(file) -> None:
    """Valide extension et taille d'un document."""
    ext = Path(file.name).suffix.lower()
    if ext not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise ValidationError(f'Extension document non autorisée ({ext}).')
    if file.size > MAX_DOCUMENT_SIZE:
        raise ValidationError('Document trop volumineux (max 20 Mo).')
