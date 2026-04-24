from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    """
    Migration 0010: Expand the Book model with:
    - categories (M2M → Category)  -- the new primary category system
    - tags (M2M → Tag)             -- SEO keywords
    - author (CharField)
    - published_year (PositiveSmallIntegerField)
    - meta_title / meta_description (SEO fields)
    - updated_at (auto_now timestamp)
    - Make old `category` FK nullable (backward compat — it's now LEGACY)
    """

    dependencies = [
        ('library', '0009_tag'),
    ]

    operations = [
        # New author / publication fields
        migrations.AddField(
            model_name='book',
            name='author',
            field=models.CharField(
                blank=True, default='', max_length=255,
                help_text='Book author name'
            ),
        ),
        migrations.AddField(
            model_name='book',
            name='published_year',
            field=models.PositiveSmallIntegerField(
                null=True, blank=True,
                help_text='Year of original publication'
            ),
        ),
        # SEO fields
        migrations.AddField(
            model_name='book',
            name='meta_title',
            field=models.CharField(
                max_length=70, blank=True,
                help_text='SEO meta title (≤70 chars). Leave blank to use the book title automatically.'
            ),
        ),
        migrations.AddField(
            model_name='book',
            name='meta_description',
            field=models.TextField(
                max_length=160, blank=True,
                help_text='SEO meta description (≤160 chars). Leave blank to use the first 160 chars of the summary.'
            ),
        ),
        # Timestamp
        migrations.AddField(
            model_name='book',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        # Make the legacy FK nullable (SET_NULL — it stays for backward compat)
        migrations.AlterField(
            model_name='book',
            name='category',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='books_legacy',
                to='library.category',
                help_text='[LEGACY] Single category FK. Use categories (M2M) instead.',
            ),
        ),
        # M2M: Book ↔ Category  (the new system)
        migrations.AddField(
            model_name='book',
            name='categories',
            field=models.ManyToManyField(
                blank=True,
                related_name='books',
                to='library.category',
                help_text='Select one or more categories this book belongs to.',
            ),
        ),
        # M2M: Book ↔ Tag
        migrations.AddField(
            model_name='book',
            name='tags',
            field=models.ManyToManyField(
                blank=True,
                related_name='books',
                to='library.tag',
                help_text='SEO keywords / tags for this book.',
            ),
        ),
        # Performance indexes
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['slug'], name='library_book_slug_idx'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['-created_at'], name='library_book_created_idx'),
        ),
    ]
