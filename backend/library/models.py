from django.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from cloudinary_storage.storage import RawMediaCloudinaryStorage

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    icon_emoji = models.CharField(max_length=10, default="📚", help_text="Emoji icon for the category (e.g. 📚, 🔬, 🎨)")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

def validate_file_size(value):
    limit = 10 * 1024 * 1024 # 10 MB limit for Cloudinary Free Tier
    if value.size > limit:
        raise ValidationError(f'File size too large. Size is {value.size / (1024*1024):.2f} MB. Maximum allowed is 10 MB because of Cloudinary free tier limits.')

class Book(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    category = models.ForeignKey(Category, related_name='books', on_delete=models.CASCADE)
    cover_image = models.ImageField(upload_to='covers/')
    pdf_file = models.FileField(upload_to='pdfs/', storage=RawMediaCloudinaryStorage(), validators=[validate_file_size])
    summary = models.TextField(help_text="Short summary for the home/detail card")
    description = models.TextField(help_text="Full book description")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Newsletter(models.Model):
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} ({'Verified' if self.is_verified else 'Pending'})"

class RequestedBook(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    title = models.CharField(max_length=255)
    author_name = models.CharField(max_length=255)
    email = models.EmailField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Book request'
        verbose_name_plural = 'Book requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} requested {self.title} by {self.author_name}"
