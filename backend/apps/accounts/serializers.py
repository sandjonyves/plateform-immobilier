"""Serializers — comptes utilisateurs et authentification."""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import UserPreference

User = get_user_model()


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Préférences (page Paramètres)."""

    class Meta:
        model = UserPreference
        exclude = ('user',)


class UserSerializer(serializers.ModelSerializer):
    """
    Représentation alignée sur ``UtilisateurPlain`` du frontend.

    Champs exposés : id, nom, prenom, email, telephone, role, statut,
    avatar, date_inscription, derniere_connexion.
    """

    avatar = serializers.SerializerMethodField()
    preferences = UserPreferenceSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'prenom',
            'nom',
            'email',
            'telephone',
            'role',
            'statut',
            'avatar',
            'ville',
            'date_inscription',
            'derniere_connexion',
            'preferences',
        )
        read_only_fields = ('id', 'date_inscription', 'derniere_connexion', 'preferences')

    def get_avatar(self, obj) -> str | None:
        if obj.avatar:
            request = self.context.get('request')
            url = obj.avatar.url
            return request.build_absolute_uri(url) if request else url
        return None


class RegisterSerializer(serializers.Serializer):
    """Inscription publique — crée toujours un client."""

    prenom = serializers.CharField(max_length=100)
    nom = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    telephone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Cet email est déjà utilisé.')
        return value.lower()


class LoginSerializer(serializers.Serializer):
    """Connexion email + mot de passe."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=6, write_only=True)
    confirm_password = serializers.CharField(min_length=6, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {'confirm_password': 'Les mots de passe ne correspondent pas.'}
            )
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6, write_only=True)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class AdminUserCreateSerializer(serializers.Serializer):
    """Création / invitation d'utilisateur par un admin."""

    prenom = serializers.CharField(max_length=100)
    nom = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    telephone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.Role.choices)
    statut = serializers.ChoiceField(
        choices=User.Statut.choices,
        default=User.Statut.ACTIF,
    )
    password = serializers.CharField(min_length=6, required=False, allow_blank=True)

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Cet email est déjà utilisé.')
        return value.lower()


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Mise à jour partielle d'un utilisateur (admin)."""

    class Meta:
        model = User
        fields = ('prenom', 'nom', 'telephone', 'role', 'statut', 'ville')

    def validate_role(self, value):
        if value not in User.Role.values:
            raise serializers.ValidationError('Rôle invalide (admin ou client).')
        return value


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Mise à jour du profil connecté (pas de changement de rôle)."""

    class Meta:
        model = User
        fields = ('prenom', 'nom', 'telephone', 'ville', 'avatar')
