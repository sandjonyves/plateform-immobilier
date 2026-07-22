"""
Services métier — authentification et gestion des utilisateurs.

La logique métier reste hors des vues (Separation of Concerns).
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings

User = get_user_model()


class AuthService:
    """Opérations d'authentification (register, login, password)."""

    @staticmethod
    def register_client(*, prenom: str, nom: str, email: str, telephone: str, password: str) -> User:
        """
        Inscrit un nouveau client.

        Le rôle est forcé à ``client`` — les admins ne s'inscrivent pas publiquement.
        """
        validate_password(password)
        user = User.objects.create_user(
            email=email,
            password=password,
            prenom=prenom,
            nom=nom,
            telephone=telephone or '',
            role=User.Role.CLIENT,
            statut=User.Statut.ACTIF,
        )
        return user

    @staticmethod
    def issue_tokens(user: User) -> dict:
        """Génère access + refresh JWT et met à jour derniere_connexion."""
        user.derniere_connexion = timezone.now()
        user.save(update_fields=['derniere_connexion'])
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }

    @staticmethod
    def logout(refresh_token: str) -> None:
        """Blacklist le refresh token (déconnexion)."""
        token = RefreshToken(refresh_token)
        token.blacklist()

    @staticmethod
    def change_password(user: User, current_password: str, new_password: str) -> None:
        """Change le mot de passe après vérification de l'ancien."""
        if not user.check_password(current_password):
            raise ValueError('Mot de passe actuel incorrect.')
        validate_password(new_password, user)
        user.set_password(new_password)
        user.save(update_fields=['password'])

    @staticmethod
    def request_password_reset(email: str) -> None:
        """
        Envoie un email de réinitialisation si le compte existe.

        Ne révèle pas si l'email est connu (anti-énumération).
        """
        try:
            user = User.objects.get(email__iexact=email, statut=User.Statut.ACTIF)
        except User.DoesNotExist:
            return

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f'{settings.FRONTEND_URL}/auth?reset={uid}&token={token}'

        send_mail(
            subject='Réinitialisation de votre mot de passe — Immopro',
            message=(
                f'Bonjour {user.prenom},\n\n'
                f'Pour réinitialiser votre mot de passe, ouvrez ce lien :\n{reset_url}\n\n'
                'Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet email.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )

    @staticmethod
    def reset_password(uidb64: str, token: str, new_password: str) -> User:
        """Valide le token et définit le nouveau mot de passe."""
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as exc:
            raise ValueError('Lien de réinitialisation invalide.') from exc

        if not default_token_generator.check_token(user, token):
            raise ValueError('Lien de réinitialisation expiré ou invalide.')

        validate_password(new_password, user)
        user.set_password(new_password)
        user.save(update_fields=['password'])
        return user


class UserService:
    """CRUD utilisateurs côté admin."""

    @staticmethod
    def create_user(*, prenom, nom, email, telephone, role, statut, password=None) -> User:
        """
        Crée un utilisateur (admin ou client) depuis le back-office.

        Si aucun mot de passe n'est fourni, un mot de passe aléatoire est généré
        (l'utilisateur devra le réinitialiser).
        """
        if role not in (User.Role.ADMIN, User.Role.CLIENT):
            raise ValueError('Rôle invalide. Valeurs autorisées : admin, client.')

        raw_password = password or User.objects.make_random_password()
        user = User.objects.create_user(
            email=email,
            password=raw_password,
            prenom=prenom,
            nom=nom,
            telephone=telephone or '',
            role=role,
            statut=statut or User.Statut.ACTIF,
            is_staff=(role == User.Role.ADMIN),
        )
        return user

    @staticmethod
    def update_statut(user: User, statut: str) -> User:
        """Active ou suspend un compte."""
        if statut not in User.Statut.values:
            raise ValueError('Statut invalide.')
        user.statut = statut
        user.is_active = statut == User.Statut.ACTIF
        user.save(update_fields=['statut', 'is_active'])
        return user
