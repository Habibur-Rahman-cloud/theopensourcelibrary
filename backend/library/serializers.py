from rest_framework import serializers
from .models import Category, Tag, Book, Newsletter, RequestedBook


class TagSerializer(serializers.ModelSerializer):
    """Serializer for SEO keyword tags."""
    book_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'book_count']

    def get_book_count(self, obj):
        return obj.books.count()


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for categories.
    Top-level categories include their children (sub-categories).
    """
    book_count = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True, default=None)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon_emoji', 'parent', 'parent_name', 'children', 'book_count']

    def get_book_count(self, obj):
        count = obj.books.count()
        if count >= 99:
            return "99+"
        elif count >= 9:
            return f"{count}+"
        return str(count)

    def get_children(self, obj):
        """Only emit children list for top-level categories."""
        if obj.parent is None:
            children = obj.children.all()
            return CategorySerializer(children, many=True).data
        return []


class BookSerializer(serializers.ModelSerializer):
    """
    Full book serializer with SEO fields, M2M categories, and tags.
    """
    # Legacy FK field (backward compat)
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    category_slug = serializers.CharField(source='category.slug', read_only=True, default=None)

    # M2M relations — detail representations
    categories_detail = CategorySerializer(source='categories', many=True, read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)

    # Computed SEO fields (fallback-aware)
    effective_meta_title = serializers.CharField(read_only=True)
    effective_meta_description = serializers.CharField(read_only=True)

    class Meta:
        model = Book
        fields = [
            # Identifiers
            'id', 'title', 'slug',
            # Author & publication
            'author', 'published_year',
            # SEO
            'meta_title', 'meta_description',
            'effective_meta_title', 'effective_meta_description',
            # Legacy category (backward compat)
            'category', 'category_name', 'category_slug',
            # M2M
            'categories', 'categories_detail',
            'tags', 'tags_detail',
            # Files
            'cover_image', 'pdf_file',
            # Content
            'summary', 'description',
            # Timestamps
            'created_at', 'updated_at',
        ]


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = '__all__'


class RequestedBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestedBook
        fields = ['id', 'title', 'author_name', 'email', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

    def validate_email(self, value):
        normalized = (value or '').strip().lower()
        if not normalized:
            raise serializers.ValidationError('Email is required.')
        if not Newsletter.objects.filter(email__iexact=normalized, is_verified=True).exists():
            raise serializers.ValidationError(
                'This email is not on our verified newsletter list. Subscribe and verify your email first.'
            )
        return normalized
