# Generated manually — rename notif_transactions → notif_ventes

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='userpreference',
            old_name='notif_transactions',
            new_name='notif_ventes',
        ),
    ]
