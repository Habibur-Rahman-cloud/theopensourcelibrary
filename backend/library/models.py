from django.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from cloudinary_storage.storage import RawMediaCloudinaryStorage


class Category(models.Model):
    """
    Hierarchical category model.
    Top-level categories have parent=None.
    Sub-categories point to a parent category.
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    icon_emoji = models.CharField(
        max_length=10, default="📚",
        help_text="Emoji icon for the category (e.g. 📚, 🔬, 🎨)"
    )
    parent = models.ForeignKey(
        'self',
        null=True, blank=True,
        related_name='children',
        on_delete=models.SET_NULL,
        help_text="Leave blank to make this a top-level category. "
                  "Select a parent to make this a sub-category."
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
        indexes = [models.Index(fields=['slug'])]

    @property
    def is_subcategory(self):
        return self.parent is not None

    @property
    def full_path(self):
        """Returns 'Parent → Child' for sub-categories, just 'Name' for top-level."""
        if self.parent:
            return f"{self.parent.name} → {self.name}"
        return self.name

    def __str__(self):
        return self.full_path


class Tag(models.Model):
    """
    SEO keyword / tag model.
    Each tag is a unique, reusable keyword that can be attached to many books.
    Think of these as YouTube-style tags for search engine targeting.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        indexes = [models.Index(fields=['slug'])]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


def validate_file_size(value):
    limit = 10 * 1024 * 1024  # 10 MB limit for Cloudinary Free Tier
    if value.size > limit:
        raise ValidationError(
            f'File size too large. Size is {value.size / (1024*1024):.2f} MB. '
            f'Maximum allowed is 10 MB because of Cloudinary free tier limits.'
        )


class Book(models.Model):
    """
    Core book model with full SEO support, hierarchical categories (M2M),
    and structured keyword tags.
    """
    # ── Core Info ──────────────────────────────────────────────────────────
    title = models.CharField(max_length=255)
    author = models.CharField(
        max_length=255, blank=True, default='',
        help_text="Book author name"
    )
    published_year = models.PositiveSmallIntegerField(
        null=True, blank=True,
        help_text="Year of original publication"
    )

    # ── SEO Fields ─────────────────────────────────────────────────────────
    slug = models.SlugField(
        unique=True, blank=True,
        help_text="Auto-generated from title. You can edit this for SEO — "
                  "changing it will break existing links."
    )
    meta_title = models.CharField(
        max_length=70, blank=True,
        help_text="SEO meta title (≤70 chars). Leave blank to use the book title automatically."
    )
    meta_description = models.TextField(
        max_length=160, blank=True,
        help_text="SEO meta description (≤160 chars). Leave blank to use the first 160 chars of the summary."
    )

    # ── Files ──────────────────────────────────────────────────────────────
    cover_image = models.ImageField(upload_to='covers/')
    pdf_file = models.FileField(
        upload_to='pdfs/',
        storage=RawMediaCloudinaryStorage(),
        validators=[validate_file_size]
    )

    # ── Content ────────────────────────────────────────────────────────────
    summary = models.TextField(help_text="Short summary for the home/detail card")
    description = models.TextField(help_text="Full book description")

    # ── Relations ──────────────────────────────────────────────────────────
    # Legacy FK kept for backward compatibility (nullable). Do NOT use for new code.
    # New code should use the `categories` M2M field.
    category = models.ForeignKey(
        Category,
        null=True, blank=True,
        related_name='books_legacy',
        on_delete=models.SET_NULL,
        help_text="[LEGACY] Single category FK. Use 'categories' instead."
    )
    categories = models.ManyToManyField(
        Category,
        blank=True,
        related_name='books',
        help_text="Select one or more categories this book belongs to."
    )
    tags = models.ManyToManyField(
        Tag,
        blank=True,
        related_name='books',
        help_text="SEO keywords / tags for this book. "
                  "Add relevant search terms people would use to find this book."
    )

    # ── Timestamps ─────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['-created_at']),
        ]

    # ── SEO helpers ────────────────────────────────────────────────────────
    @property
    def effective_meta_title(self):
        """Returns meta_title if set, otherwise falls back to book title."""
        return self.meta_title or self.title

    @property
    def effective_meta_description(self):
        """Returns meta_description if set, otherwise falls back to summary[:160]."""
        return self.meta_description or self.summary[:160]

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
