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
        return item

class CategorySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Category.objects.all()

    def location(self, obj):
        return f"/category/{obj.slug}"

class BookSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.7

    def items(self):
        return Book.objects.all().order_by('-created_at')

    def location(self, obj):
        # Adjust this match your React routing for book details
        # If books open in a modal on the home/category page, you might want to 
        # give them their own dedicated URLs for indexing.
        return f"/book/{obj.slug}"

    def lastmod(self, obj):
        return obj.created_at
