# Generated manually — CharField ville → FK Ville

import django.db.models.deletion
from django.db import migrations, models


def forwards_terrains(apps, schema_editor):
    Terrain = apps.get_model('terrains', 'Terrain')
    Ville = apps.get_model('villes', 'Ville')
    default = Ville.objects.filter(nom='Yaoundé').first() or Ville.objects.first()
    if default is None:
        return
    for t in Terrain.objects.all():
        nom = getattr(t, 'ville_legacy', None) or 'Yaoundé'
        ville = Ville.objects.filter(nom__iexact=nom).first() or default
        t.ville_id = ville.id
        t.save(update_fields=['ville_id'])


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
        ('terrains', '0001_initial'),
        ('villes', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='terrain',
            old_name='ville',
            new_name='ville_legacy',
        ),
        migrations.AddField(
            model_name='terrain',
            name='ville',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='terrains',
                to='villes.ville',
            ),
        ),
        migrations.RunPython(forwards_terrains, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='terrain',
            name='ville',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='terrains',
                to='villes.ville',
            ),
        ),
        migrations.RemoveField(
            model_name='terrain',
            name='ville_legacy',
        ),
    ]
