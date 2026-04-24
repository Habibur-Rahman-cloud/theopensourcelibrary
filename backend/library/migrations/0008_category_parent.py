from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    """
    Migration 0008: Add self-referencing 'parent' FK to Category.
    This enables the sub-category hierarchy.
    """

    dependencies = [
        ('library', '0007_alter_book_pdf_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='parent',
            field=models.ForeignKey(
                blank=True,
                help_text='Leave blank to make this a top-level category. Select a parent to make this a sub-category.',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='children',
                to='library.category',
                verbose_name='Parent Category',
            ),
        ),
        migrations.AddIndex(
            model_name='category',
            index=models.Index(fields=['slug'], name='library_cat_slug_idx'),
        ),
    ]
