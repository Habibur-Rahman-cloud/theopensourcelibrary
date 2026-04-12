from django.contrib.sitemaps import Sitemap
from .models import Book, Category

class BaseSitemap(Sitemap):
    protocol = 'https'
    
    # This forces Django to use your frontend domain instead of the API domain
    def get_urls(self, site=None, **kwargs):
        # We pass a dummy 'site' object to override the domain
        class DummySite:
            domain = 'theopensourcelibrary.com'
            name = 'theopensourcelibrary.com'
        
        return super().get_urls(site=DummySite(), **kwargs)

class StaticViewSitemap(BaseSitemap):
    priority = 1.0
    changefreq = 'daily'

    def items(self):
        return ['/', '/categories', '/books', '/request-book', '/become-contributor']

    def location(self, item):
        return item

class CategorySitemap(BaseSitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Category.objects.all()

    def location(self, obj):
        return f"/category/{obj.slug}"

class BookSitemap(BaseSitemap):
    changefreq = "monthly"
    priority = 0.7

    def items(self):
        return Book.objects.all().order_by('-created_at')

    def location(self, obj):
        return f"/book/{obj.slug}"

    def lastmod(self, obj):
        return obj.created_at
