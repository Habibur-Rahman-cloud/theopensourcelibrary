from rest_framework import serializers
from .models import Category, Book, Newsletter, RequestedBook

class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Book
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    book_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon_emoji', 'book_count']

    def get_book_count(self, obj):
        count = obj.books.count()
        if count >= 99:
            return "99+"
        elif count >= 9:
            return f"{count}+" # Based on user's compact 9+ 99+ request
        return str(count)

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
