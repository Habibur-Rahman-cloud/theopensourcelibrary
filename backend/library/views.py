from django.http import StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.clickjacking import xframe_options_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from rest_framework import mixins, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Category, Book, Newsletter, RequestedBook
from .serializers import (
    CategorySerializer,
    BookSerializer,
    NewsletterSerializer,
    RequestedBookSerializer,
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by('-created_at')
    serializer_class = BookSerializer

    def get_queryset(self):
        queryset = Book.objects.all().order_by('-created_at')
        category_slug = self.request.query_params.get('category')
        search_query = self.request.query_params.get('search')
        
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
            
        if search_query:
            queryset = queryset.filter(title__icontains=search_query) # Basic search by title
            
        return queryset

    @method_decorator(xframe_options_exempt)
    @action(detail=True, methods=['get'], url_path='view-pdf')
    def view_pdf(self, request, pk=None):
        import requests
        book = get_object_or_404(Book, pk=pk)
        if not book.pdf_file:
            return Response({"error": "No PDF file associated with this book"}, status=status.HTTP_404_NOT_FOUND)
            
        pdf_url = book.pdf_file.url
        
        # We use a stream to fetch from Cloudinary and pass it to the user
        try:
            # We don't use credentials/auth here as we are fetching the public-but-blocked URL
            # but we are doing it from our server which is usually not blocked by same-origin/CDN rules
            r = requests.get(pdf_url, stream=True, timeout=20)
            r.raise_for_status()
            
            response = StreamingHttpResponse(
                r.iter_content(chunk_size=8192),
                content_type='application/pdf'
            )
            # 'inline' allows the browser to show it in the viewer
            response['Content-Disposition'] = f'inline; filename="{book.title}.pdf"'
            return response
        except Exception as e:
            return Response({"error": f"Failed to fetch PDF from storage: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY)

class RequestedBookViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = RequestedBook.objects.all().order_by('-created_at')
    serializer_class = RequestedBookSerializer
    permission_classes = [AllowAny]


class NewsletterViewSet(viewsets.ViewSet):
    def _send_otp_email(self, email, otp):
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        from django.utils.html import strip_tags

        subject = "Verify your Newsletter Subscription ✨"
        
        html_content = f"""
        <html>
        <body style="font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f5; padding: 40px 0; margin: 0;">
            <div style="max-w-md: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: center;">
                <h1 style="color: #18181b; font-size: 24px; font-weight: 800; margin-bottom: 8px;">The Opensource Library</h1>
                <p style="color: #71717a; font-size: 16px; margin-bottom: 32px;">Verify your newsletter subscription</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                    <p style="color: #475569; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Your Verification Code</p>
                    <div style="font-size: 36px; font-weight: 900; color: #3b82f6; letter-spacing: 0.2em; font-family: monospace;">{otp}</div>
                </div>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                    Enter this code in the verification window to complete your subscription.<br>
                    This code is valid for a limited time.
                </p>
                
                <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px;">
                    <p style="color: #94a3b8; font-size: 12px;">
                        If you didn't request this subscription, you can safely ignore this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        text_content = strip_tags(html_content)
        
        msg = EmailMultiAlternatives(
            subject, 
            text_content, 
            settings.DEFAULT_FROM_EMAIL, 
            [email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)

    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = str(random.randint(100000, 999999))
        
        # Update or create unverified subscriber
        subscriber, created = Newsletter.objects.get_or_create(email=email)
        
        if subscriber.is_verified:
            return Response({"error": "Already subscribed"}, status=status.HTTP_400_BAD_REQUEST)
            
        subscriber.otp = otp
        subscriber.save()
        
        try:
            self._send_otp_email(email, otp)
            return Response({"message": "OTP sent to your email"}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Email Error: {str(e)}")
            return Response({"error": "Failed to send verification email. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def verify_otp(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            subscriber = Newsletter.objects.get(email=email, otp=otp)
            subscriber.is_verified = True
            subscriber.otp = None # Clear OTP after verification
            subscriber.save()
            return Response({"message": "Successfully subscribed!"}, status=status.HTTP_200_OK)
        except Newsletter.DoesNotExist:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='check-subscription')
    def check_subscription(self, request):
        email = (request.query_params.get('email') or '').strip()
        if not email:
            return Response(
                {"error": "Email is required", "subscribed": False},
                status=status.HTTP_400_BAD_REQUEST,
            )
        subscribed = Newsletter.objects.filter(email__iexact=email, is_verified=True).exists()
        return Response({"subscribed": subscribed})
