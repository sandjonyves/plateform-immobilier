"""
Endpoint générique d'upload média.

Retourne une URL à stocker dans photos[] / videos[] des biens.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsAdmin
from apps.common.validators import (
    upload_to_medias,
    validate_image_file,
    validate_video_file,
)
from django.core.files.storage import default_storage


class MediaUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    kind = serializers.ChoiceField(choices=['image', 'video'], default='image')


class MediaUploadView(APIView):
    """
    POST multipart : file + kind (image|video)

    Réponse : { "url": "http://.../media/uploads/xxx.jpg" }
    """

    permission_classes = [IsAdmin]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(tags=['Médias'], request=MediaUploadSerializer)
    def post(self, request):
        serializer = MediaUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file = serializer.validated_data['file']
        kind = serializer.validated_data['kind']

        try:
            if kind == 'image':
                validate_image_file(file)
            else:
                validate_video_file(file)
        except Exception as exc:
            return Response(
                {'success': False, 'error': {'detail': str(exc), 'code': 'bad_request'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        path = upload_to_medias(None, file.name)
        saved = default_storage.save(path, file)
        url = request.build_absolute_uri(default_storage.url(saved))
        return Response({'url': url, 'path': saved}, status=status.HTTP_201_CREATED)
