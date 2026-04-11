from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, BookViewSet, NewsletterViewSet, RequestedBookViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'books', BookViewSet)
router.register(r'newsletter', NewsletterViewSet, basename='newsletter')
router.register(r'request-book', RequestedBookViewSet, basename='request-book')

urlpatterns = [
    path('', include(router.urls)),
]
