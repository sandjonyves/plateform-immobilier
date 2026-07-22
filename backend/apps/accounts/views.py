"""
Vues API — authentification et gestion des utilisateurs.
"""

from django.contrib.auth import authenticate, get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from apps.common.permissions import IsAdmin

from .serializers import (
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
    ChangePasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserPreferenceSerializer,
    UserSerializer,
)
from .services import AuthService, UserService

User = get_user_model()


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------


class RegisterView(APIView):
    """Inscription publique → rôle client."""

    permission_classes = [AllowAny]

    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = AuthService.register_client(
            prenom=data['prenom'],
            nom=data['nom'],
            email=data['email'],
            telephone=data.get('telephone', ''),
            password=data['password'],
        )
        tokens = AuthService.issue_tokens(user)
        return Response(
            {
                'success': True,
                'user': UserSerializer(user, context={'request': request}).data,
                'tokens': tokens,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Connexion email / mot de passe → JWT."""

    permission_classes = [AllowAny]

    @extend_schema(request=LoginSerializer, responses={200: UserSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response(
                {'success': False, 'error': {'detail': 'Identifiants invalides.', 'code': 'unauthorized'}},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if user.statut == User.Statut.SUSPENDU or not user.is_active:
            return Response(
                {'success': False, 'error': {'detail': 'Compte suspendu.', 'code': 'forbidden'}},
                status=status.HTTP_403_FORBIDDEN,
            )

        tokens = AuthService.issue_tokens(user)
        return Response(
            {
                'success': True,
                'user': UserSerializer(user, context={'request': request}).data,
                'tokens': tokens,
            }
        )


class LogoutView(APIView):
    """Déconnexion : blacklist du refresh token."""

    permission_classes = [IsAuthenticated]

    @extend_schema(request=LogoutSerializer, responses={204: None})
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            AuthService.logout(serializer.validated_data['refresh'])
        except Exception:
            return Response(
                {'success': False, 'error': {'detail': 'Token invalide.', 'code': 'bad_request'}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """Profil de l'utilisateur connecté."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)

    @extend_schema(request=ProfileUpdateSerializer, responses={200: UserSerializer})
    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={'request': request}).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=ChangePasswordSerializer, responses={200: None})
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            AuthService.change_password(
                request.user,
                serializer.validated_data['current_password'],
                serializer.validated_data['new_password'],
            )
        except ValueError as exc:
            return Response(
                {'success': False, 'error': {'detail': str(exc), 'code': 'bad_request'}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'success': True, 'detail': 'Mot de passe mis à jour.'})


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=PasswordResetRequestSerializer, responses={200: None})
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.request_password_reset(serializer.validated_data['email'])
        return Response(
            {
                'success': True,
                'detail': 'Si un compte existe pour cet email, un lien a été envoyé.',
            }
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=PasswordResetConfirmSerializer, responses={200: None})
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            AuthService.reset_password(
                serializer.validated_data['uid'],
                serializer.validated_data['token'],
                serializer.validated_data['new_password'],
            )
        except ValueError as exc:
            return Response(
                {'success': False, 'error': {'detail': str(exc), 'code': 'bad_request'}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'success': True, 'detail': 'Mot de passe réinitialisé.'})


class PreferencesView(APIView):
    """Lecture / mise à jour des préférences du compte connecté."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        prefs = request.user.preferences
        return Response(UserPreferenceSerializer(prefs).data)

    def patch(self, request):
        prefs = request.user.preferences
        serializer = UserPreferenceSerializer(prefs, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Admin CRUD utilisateurs
# ---------------------------------------------------------------------------


@extend_schema_view(
    list=extend_schema(tags=['Utilisateurs']),
    retrieve=extend_schema(tags=['Utilisateurs']),
    create=extend_schema(tags=['Utilisateurs']),
    update=extend_schema(tags=['Utilisateurs']),
    partial_update=extend_schema(tags=['Utilisateurs']),
    destroy=extend_schema(tags=['Utilisateurs']),
)
class UserViewSet(viewsets.ModelViewSet):
    """
    Gestion des utilisateurs — réservée aux admins.

    Filtres : role, statut — Recherche : prenom, nom, email.
    """

    permission_classes = [IsAdmin]
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'statut']
    search_fields = ['prenom', 'nom', 'email', 'telephone']
    ordering_fields = ['date_inscription', 'nom', 'prenom', 'derniere_connexion']
    ordering = ['-date_inscription']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        return User.objects.all().select_related('preferences')

    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        if self.action in ('update', 'partial_update'):
            return AdminUserUpdateSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = AdminUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = UserService.create_user(
            prenom=data['prenom'],
            nom=data['nom'],
            email=data['email'],
            telephone=data.get('telephone', ''),
            role=data['role'],
            statut=data.get('statut', User.Statut.ACTIF),
            password=data.get('password') or None,
        )
        return Response(
            UserSerializer(user, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def perform_update(self, serializer):
        user = serializer.save()
        # Synchronise is_active / is_staff avec role & statut
        user.is_active = user.statut == User.Statut.ACTIF
        user.is_staff = user.role == User.Role.ADMIN
        user.save(update_fields=['is_active', 'is_staff'])

    @action(detail=True, methods=['post'])
    def suspendre(self, request, pk=None):
        """Raccourci pour suspendre un compte."""
        user = self.get_object()
        UserService.update_statut(user, User.Statut.SUSPENDU)
        return Response(UserSerializer(user, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def activer(self, request, pk=None):
        """Raccourci pour réactiver un compte."""
        user = self.get_object()
        UserService.update_statut(user, User.Statut.ACTIF)
        return Response(UserSerializer(user, context={'request': request}).data)


# Expose TokenRefreshView sous un nom local pour urls.py
RefreshTokenView = TokenRefreshView
