from django.db import migrations


def copy_fk_to_m2m(apps, schema_editor):
    """
    Data migration: Copy each book's legacy 'category' FK value
    into the new 'categories' M2M table.

    This ensures all existing books retain their category assignments
    after switching to the M2M system.
    """
    Book = apps.get_model('library', 'Book')
    for book in Book.objects.filter(category__isnull=False).iterator(chunk_size=100):
        book.categories.add(book.category)


def reverse_copy(apps, schema_editor):
    """
    Reverse: Remove all M2M entries from books that had their category
    populated by this migration.
    Note: This only removes entries that exactly match the legacy FK.
    Manually added M2M entries are preserved.
    """
    Book = apps.get_model('library', 'Book')
    for book in Book.objects.filter(category__isnull=False).iterator(chunk_size=100):
        book.categories.remove(book.category)


class Migration(migrations.Migration):
    """
    Migration 0011: Data migration to populate the new M2M categories
    from the existing legacy ForeignKey category data.

    Safe to run multiple times — `add()` is idempotent.
    """

    dependencies = [
        ('library', '0010_book_seo_m2m_fields'),
    ]

    operations = [
        migrations.RunPython(copy_fk_to_m2m, reverse_code=reverse_copy),
    ]
