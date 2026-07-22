# Generated manually — CharField ville → FK Ville

import django.db.models.deletion
from django.db import migrations, models


def forwards_maisons(apps, schema_editor):
    Maison = apps.get_model('maisons', 'Maison')
    Ville = apps.get_model('villes', 'Ville')
    default = Ville.objects.filter(nom='Yaoundé').first() or Ville.objects.first()
    if default is None:
        return
    for m in Maison.objects.all():
        nom = getattr(m, 'ville_legacy', None) or 'Yaoundé'
        ville = Ville.objects.filter(nom__iexact=nom).first() or default
        m.ville_id = ville.id
        m.save(update_fields=['ville_id'])


class Migration(migrations.Migration):

    dependencies = [
        ('maisons', '0001_initial'),
        ('villes', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='maison',
            old_name='ville',
            new_name='ville_legacy',
        ),
        migrations.AddField(
            model_name='maison',
            name='ville',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='maisons',
                to='villes.ville',
            ),
        ),
        migrations.RunPython(forwards_maisons, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='maison',
            name='ville',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='maisons',
                to='villes.ville',
            ),
        ),
        migrations.RemoveField(
            model_name='maison',
            name='ville_legacy',
        ),
    ]
