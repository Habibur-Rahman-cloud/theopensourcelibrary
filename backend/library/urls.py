from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TagViewSet, BookViewSet, NewsletterViewSet, RequestedBookViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'books', BookViewSet, basename='book')
router.register(r'newsletter', NewsletterViewSet, basename='newsletter')
router.register(r'request-book', RequestedBookViewSet, basename='request-book')

urlpatterns = [
    path('', include(router.urls)),
]

