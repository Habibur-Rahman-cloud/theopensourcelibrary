from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):
    """
    Migration 0009: Create the Tag model for SEO keywords.
    Tags are shared across books (M2M relationship will be set up in 0010).
    """

    dependencies = [
        ('library', '0008_category_parent'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(blank=True, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.AddIndex(
            model_name='tag',
            index=models.Index(fields=['slug'], name='library_tag_slug_idx'),
        ),
    ]
