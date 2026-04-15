# Generated manually - add file size validator to Book.pdf_file
import library.models
from django.db import migrations, models
import cloudinary_storage.storage

class Migration(migrations.Migration):

    dependencies = [
        ('library', '0006_alter_book_pdf_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='pdf_file',
            field=models.FileField(
                storage=cloudinary_storage.storage.RawMediaCloudinaryStorage(),
                upload_to='pdfs/',
                validators=[library.models.validate_file_size]
            ),
        ),
    ]
