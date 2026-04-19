import random
import requests
import logging
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
    lookup_field = 'slug'

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by('-created_at')
    serializer_class = BookSerializer
    lookup_field = 'slug'

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
    def view_pdf(self, request, slug=None):
        """
        Proxy PDF requests to bypass storage provider (Cloudinary) same-origin/X-Frame blocks.
        Uses the default lookup_field (slug).
        """
        book = self.get_object()
        
        if not book.pdf_file:
            return Response({"error": "No PDF file associated with this book"}, status=status.HTTP_404_NOT_FOUND)
            
        pdf_url = book.pdf_file.url
        
        try:
            # Fetch the PDF content from storage (Cloudinary)
            r = requests.get(pdf_url, stream=True, timeout=30)
            r.raise_for_status()
            
            response = StreamingHttpResponse(
                r.iter_content(chunk_size=8192),
                content_type='application/pdf'
            )
            # Use 'inline' so browser opens its native PDF viewer and remembers scroll position
            response['Content-Disposition'] = f'inline; filename="{book.title}.pdf"'
            
            # Allow embedding from specific frontend domains
            # Note: frame-ancestors is the modern CSP equivalent of X-Frame-Options
            response['Content-Security-Policy'] = (
                "frame-ancestors 'self' "
                "https://theopensourcelibrary.com "
                "https://www.theopensourcelibrary.com "
                "https://theopensourcelibrary.pages.dev "
                "http://localhost:5173;"
            )
            return response
        except Exception as e:
            logging.error(f"PDF Proxy Error for book '{book.title}': {str(e)}")
            return Response(
                {"error": f"Failed to fetch PDF from storage: {str(e)}"}, 
                status=status.HTTP_502_BAD_GATEWAY
            )

class RequestedBookViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = RequestedBook.objects.all().order_by('-created_at')
    serializer_class = RequestedBookSerializer
    permission_classes = [AllowAny]


class NewsletterViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    authentication_classes = [] # Disable CSRF/Session checks for this public API

    @action(detail=False, methods=['get'])
    def ping(self, request):
        return Response({"message": "Newsletter API is reachable!"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='test-email')
    def test_email(self, request):
        from django.conf import settings
        from django.http import HttpResponse
        import requests
        import json
        
        try:
            resend_api_key = getattr(settings, 'RESEND_API_KEY', None)
            if not resend_api_key:
                return HttpResponse(json.dumps({"error": "RESEND_API_KEY missing in Railway variables"}), status=200)

            url = "https://api.resend.com/emails"
            headers = {"Authorization": f"Bearer {resend_api_key}", "Content-Type": "application/json"}
            payload = {
                "from": "Library <newsletter@theopensourcelibrary.com>",
                "to": ["thehabibur24@gmail.com"], # Testing with your own email
                "subject": "Diagnostic Check ✨ (Resend API)",
                "html": "<p>If you see this, Resend API is working perfectly!</p>"
            }
            
            print(f"DEBUG: Diagnostic Resend attempt for thehabibur24@gmail.com")
            r = requests.post(url, headers=headers, json=payload, timeout=10)
            return HttpResponse(json.dumps({
                "status": r.status_code, 
                "response": r.json(),
                "tip": "If status is 403, make sure you are sending only to the email you signed up with (on free tier)."
            }), content_type="application/json")
        except Exception as e:
            return HttpResponse(json.dumps({"error": str(e)}), status=200)

    def _send_otp_email(self, email, otp):
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        from django.utils.html import strip_tags

        subject = "Verify your Newsletter Subscription ✨"
        
        html_content = f"""
        <html>
        <body style="font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f5; padding: 40px 0; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: center;">
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
        
        import requests
        
        try:
            resend_api_key = getattr(settings, 'RESEND_API_KEY', None)
            if not resend_api_key:
                print("BACKGROUND RESEND ERROR: RESEND_API_KEY is missing!")
                return

            url = "https://api.resend.com/emails"
            headers = {"Authorization": f"Bearer {resend_api_key}", "Content-Type": "application/json"}
            payload = {
                "from": "Library <newsletter@theopensourcelibrary.com>",
                "to": [email],
                "subject": subject,
                "html": html_content
            }
            
            print(f"DEBUG: Attempting Resend API call for {email}")
            r = requests.post(url, headers=headers, json=payload, timeout=10)
            print(f"DEBUG: Resend API finished for {email} with status {r.status_code}")
            
        except Exception as e:
            import traceback
            print(f"RESEND API ERROR for {email}: {str(e)}")
            print(traceback.format_exc())

    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        try:
            email_raw = request.data.get('email')
            print(f"DEBUG: Newsletter subscribe attempt for: {email_raw}")
            
            if not email_raw:
                return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            email = email_raw.strip().lower()
            otp = str(random.randint(100000, 999999))
            print(f"DEBUG: Generated OTP for {email}")
            
            # Update or create subscriber with normalized email
            subscriber, created = Newsletter.objects.get_or_create(email=email)
            print(f"DEBUG: Subscriber record {'created' if created else 'found'} for {email}")
            
            if subscriber.is_verified:
                print(f"DEBUG: {email} is already verified")
                return Response({"error": "This email is already subscribed."}, status=status.HTTP_400_BAD_REQUEST)
                
            subscriber.otp = otp
            subscriber.save()
            # Move email sending to a background thread to prevent timeouts
            try:
                import threading
                thread = threading.Thread(target=self._send_otp_email, args=(email, otp))
                thread.daemon = True
                thread.start()
                print(f"DEBUG: Background email thread started for {email}")
                return Response({"message": "OTP sent to your email"}, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"DEBUG: Failed to start background thread: {str(e)}")
                # Fallback to synchronous if threading fails for some reason
                self._send_otp_email(email, otp)
                return Response({"message": "OTP sent to your email"}, status=status.HTTP_200_OK)
                
        except Exception as e:
            import traceback
            print(f"Newsletter Subscribe Error: {str(e)}")
            print(traceback.format_exc())
            return Response({
                "error": f"Server error during subscription: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def verify_otp(self, request):
        try:
            email_raw = request.data.get('email')
            otp = request.data.get('otp')
            
            if not email_raw or not otp:
                return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)
            
            email = email_raw.strip().lower()
                
            try:
                subscriber = Newsletter.objects.get(email=email, otp=otp)
                subscriber.is_verified = True
                subscriber.otp = None # Clear OTP after verification
                subscriber.save()
                return Response({"message": "Successfully subscribed!"}, status=status.HTTP_200_OK)
            except Newsletter.DoesNotExist:
                return Response({"error": "Invalid OTP or email. Please request a new code."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Newsletter Verification Error: {str(e)}")
            return Response({
                "error": f"Server error during verification: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='check-subscription')
    def check_subscription(self, request):
        email = (request.query_params.get('email') or '').strip().lower()
        if not email:
            return Response(
                {"error": "Email is required", "subscribed": False},
                status=status.HTTP_400_BAD_REQUEST,
            )
        subscribed = Newsletter.objects.filter(email=email, is_verified=True).exists()
        return Response({"subscribed": subscribed})
