from django.contrib.sitemaps import Sitemap
from .models import Book, Category
from django.urls import reverse

class StaticViewSitemap(Sitemap):
    priority = 1.0
    changefreq = 'daily'

    def items(self):
        # These names should match the route names in your frontend
        return ['/', '/categories', '/books', '/request-book', '/become-contributor']

    def location(self, item):
        return f"https://theopensourcelibrary.com{item}"

class CategorySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Category.objects.all()

    def location(self, obj):
        return f"https://theopensourcelibrary.com/category/{obj.slug}"

class BookSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.7

    def items(self):
        return Book.objects.all().order_by('-created_at')

    def location(self, obj):
        return f"https://theopensourcelibrary.com/book/{obj.slug}"

    def lastmod(self, obj):
        return obj.created_at
