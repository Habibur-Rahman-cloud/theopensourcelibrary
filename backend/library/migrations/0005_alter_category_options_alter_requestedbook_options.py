# Generated manually - adds missing Meta options for Category and RequestedBook

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0004_requestedbook'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='category',
            options={
                'ordering': ['name'],
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.AlterModelOptions(
            name='requestedbook',
            options={
                'ordering': ['-created_at'],
                'verbose_name': 'Book request',
                'verbose_name_plural': 'Book requests',
            },
        ),
    ]
