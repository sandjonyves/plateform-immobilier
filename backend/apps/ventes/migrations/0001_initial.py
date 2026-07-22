# Generated manually — app ventes (remplace transactions)

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Vente',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Créé le')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Modifié le')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('type', models.CharField(choices=[('vente', 'Vente')], db_index=True, default='vente', max_length=20)),
                ('bien_type', models.CharField(choices=[('terrain', 'Terrain'), ('maison', 'Maison')], max_length=20)),
                ('bien_id', models.UUIDField(db_index=True, help_text='ID du terrain ou de la maison.')),
                ('montant', models.DecimalField(decimal_places=0, help_text='Montant déclaratif du dossier (pas de paiement en ligne).', max_digits=15)),
                ('statut', models.CharField(choices=[('en_attente', 'En attente'), ('confirmee', 'Confirmée'), ('annulee', 'Annulée')], db_index=True, default='en_attente', max_length=20)),
                ('date_vente', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('documents', models.JSONField(blank=True, default=list)),
                ('notes', models.TextField(blank=True)),
                ('client', models.ForeignKey(limit_choices_to={'role': 'client'}, on_delete=django.db.models.deletion.PROTECT, related_name='ventes_client', to=settings.AUTH_USER_MODEL)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ventes_creees', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Vente',
                'verbose_name_plural': 'Ventes',
                'ordering': ['-date_vente'],
            },
        ),
        migrations.AddIndex(
            model_name='vente',
            index=models.Index(fields=['type', 'statut'], name='ventes_vente_type_stat_idx'),
        ),
        migrations.AddIndex(
            model_name='vente',
            index=models.Index(fields=['bien_type', 'bien_id'], name='ventes_vente_bien_ty_idx'),
        ),
    ]
