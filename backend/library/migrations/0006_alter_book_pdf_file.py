# Generated manually - switches pdf_file to RawMediaCloudinaryStorage so PDFs
# upload correctly to Cloudinary as 'raw' resource type instead of failing as
# an invalid image type.

import cloudinary_storage.storage
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0005_alter_category_options_alter_requestedbook_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='pdf_file',
            field=models.FileField(
                storage=cloudinary_storage.storage.RawMediaCloudinaryStorage(),
                upload_to='pdfs/',
            ),
        ),
    ]
